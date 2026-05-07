import Razorpay  from 'razorpay'
import crypto    from 'crypto'
import Order     from '../models/Order.js'
import Product   from '../models/Product.js'
import User      from '../models/User.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import { io }    from '../server.js'
import { emitOrderPlaced, emitPaymentConfirmed, emitLowStock } from '../sockets/socketEmit.js'

// ─── Razorpay instance ────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE ORDER
// POST /api/orders
// Body: { items, deliveryAddressId, paymentMethod, couponCode }
// ═══════════════════════════════════════════════════════════════════════════════
export const createOrder = async (req, res) => {
  const { items, deliveryAddress, paymentMethod, couponCode } = req.body

  if (!items || items.length === 0)
    return errorResponse(res, 'Cart is empty')

  if (!deliveryAddress)
    return errorResponse(res, 'Delivery address is required')

  if (!['razorpay', 'cod'].includes(paymentMethod))
    return errorResponse(res, 'Invalid payment method')

  // Validate each item and calculate total
  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const product = await Product.findById(item.productId)
    if (!product || product.status !== 'active')
      return errorResponse(res, `Product "${item.title}" is no longer available`)

    // Find variant and check stock
    const variant = product.variants.find(
      (v) => v.size === item.size && (v.color === item.color || !item.color)
    )
    if (!variant || variant.stock < item.quantity)
      return errorResponse(res, `Size ${item.size} of "${product.title}" is out of stock`)

    const itemTotal = product.sellingPrice * item.quantity
    subtotal += itemTotal

    orderItems.push({
      product:      product._id,
      variantId:    variant._id,   
      seller:       product.seller,
      title:        product.title,
      image:        product.images?.[0] || '',
      size:         item.size,
      color:        item.color || '',
      quantity:     item.quantity,
      mrp:          product.mrp,
      sellingPrice: product.sellingPrice,
      gstPercent:   product.gstPercent,
    })
  }

  // Shipping fee (free above ₹499)
  const shippingFee  = subtotal >= 499 ? 0 : 49
  const discount     = 0  // coupon logic here later
  const totalAmount  = subtotal + shippingFee - discount

  // Create order in DB
  const order = await Order.create({
    buyer:           req.user._id,
    items:           orderItems,
    deliveryAddress,
    paymentMethod,
    paymentStatus:   paymentMethod === 'cod' ? 'pending' : 'pending',
    subtotal,
    shippingFee,
    discount,
    totalAmount,
    couponCode:      couponCode || '',
    status:          'placed',
    statusHistory:   [{ status: 'placed', updatedAt: new Date(), note: 'Order placed' }],
  })

  // Reduce stock for each variant
  for (const item of orderItems) {
    await Product.updateOne(
  { _id: item.product, 'variants._id': item.variantId },
  { $inc: { 'variants.$.stock': -item.quantity } }
)

    // Check low stock (< 5 remaining)
    const updated = await Product.findById(item.product)
    const variant = updated?.variants.find((v) => v.size === item.size)
    if (variant && variant.stock < 5) {
      emitLowStock(io, {
        sellerId:     item.seller,
        productId:    item.product,
        productTitle: item.title,
        stock:        variant.stock,
      })
    }

    // Notify seller
    emitOrderPlaced(io, {
      orderId:      order._id,
      sellerId:     item.seller,
      buyerName:    req.user.name,
      productTitle: item.title,
      amount:       totalAmount,
    })
  }

  return successResponse(res, 'Order placed successfully', { order }, 201)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE RAZORPAY PAYMENT ORDER
// POST /api/orders/:id/razorpay
// ═══════════════════════════════════════════════════════════════════════════════
export const createRazorpayOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
  if (!order) return errorResponse(res, 'Order not found', 404)

  if (order.paymentStatus === 'paid')
    return errorResponse(res, 'Order already paid')

  // Create Razorpay order (amount in paise)
  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(order.totalAmount * 100),
    currency: 'INR',
    receipt:  `order_${order._id}`,
    notes:    { orderId: order._id.toString(), buyerId: req.user._id.toString() },
  })

  // Save razorpay order id
  order.razorpayOrderId = razorpayOrder.id
  await order.save()

  return successResponse(res, 'Razorpay order created', {
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
    orderId:         order._id,
    buyerName:       req.user.name,
    buyerEmail:      req.user.email,
    buyerPhone:      req.user.phone,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFY RAZORPAY PAYMENT
// POST /api/orders/verify-payment
// Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
    return errorResponse(res, 'All payment verification fields are required')

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature)
    return errorResponse(res, 'Payment verification failed — invalid signature', 400)

  // Update order
  const order = await Order.findById(orderId)
  if (!order) return errorResponse(res, 'Order not found', 404)

  order.paymentStatus      = 'paid'
  order.razorpayPaymentId  = razorpayPaymentId
  order.status             = 'confirmed'
  order.statusHistory.push({ status: 'confirmed', updatedAt: new Date(), note: 'Payment verified' })
  await order.save()

  // Real-time notification to buyer
  emitPaymentConfirmed(io, {
    orderId:          order._id,
    buyerId:          order.buyer,
    amount:           order.totalAmount,
    razorpayPaymentId,
  })

  return successResponse(res, 'Payment verified successfully!', { order })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET MY ORDERS (buyer)
// GET /api/orders/my?page=1&status=
// ═══════════════════════════════════════════════════════════════════════════════
export const getMyOrders = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 10
  const status = req.query.status          || null
  const skip   = (page - 1) * limit

  const filter = { buyer: req.user._id }
  if (status) filter.status = status

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Orders fetched', orders, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE ORDER
// GET /api/orders/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const getOrderById = async (req, res) => {
  const order = await Order.findOne({
    _id:   req.params.id,
    buyer: req.user._id,
  })
  if (!order) return errorResponse(res, 'Order not found', 404)
  return successResponse(res, 'Order fetched', { order })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// ═══════════════════════════════════════════════════════════════════════════════
export const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
  if (!order) return errorResponse(res, 'Order not found', 404)

  const cancellableStatuses = ['placed', 'confirmed', 'packed']
  if (!cancellableStatuses.includes(order.status))
    return errorResponse(res, `Cannot cancel order in "${order.status}" status`)

  // Restore stock
  for (const item of order.items) {
    await Product.updateOne(
  { _id: item.product, 'variants._id': item.variantId },  // ← fix
  { $inc: { 'variants.$.stock': item.quantity } }          // +quantity to restore
)
  }

  order.status = 'cancelled'
  order.statusHistory.push({ status: 'cancelled', updatedAt: new Date(), note: 'Cancelled by buyer' })
  await order.save()

  return successResponse(res, 'Order cancelled successfully')
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST RETURN
// PUT /api/orders/:id/return
// Body: { reason }
// ═══════════════════════════════════════════════════════════════════════════════
export const requestReturn = async (req, res) => {
  const { reason } = req.body
  if (!reason) return errorResponse(res, 'Return reason is required')

  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
  if (!order) return errorResponse(res, 'Order not found', 404)

  if (order.status !== 'delivered')
    return errorResponse(res, 'Can only return delivered orders')

  order.status = 'return_requested'
  order.statusHistory.push({ status: 'return_requested', updatedAt: new Date(), note: reason })
  await order.save()

  return successResponse(res, 'Return request submitted')
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUYER ADDRESS CRUD
// ═══════════════════════════════════════════════════════════════════════════════
export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses')
  return successResponse(res, 'Addresses fetched', { addresses: user.addresses || [] })
}

export const addAddress = async (req, res) => {
  const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body
  if (!name || !phone || !line1 || !city || !state || !pincode)
    return errorResponse(res, 'All required address fields must be filled')

  const user = await User.findById(req.user._id)
  if (!user.addresses) user.addresses = []

  // If setting as default, unset all others
  if (isDefault) user.addresses.forEach((a) => { a.isDefault = false })

  user.addresses.push({ name, phone, line1, line2: line2 || '', city, state, pincode, isDefault: isDefault || user.addresses.length === 0 })
  await user.save()

  return successResponse(res, 'Address added', { addresses: user.addresses }, 201)
}

export const updateAddress = async (req, res) => {
  const user    = await User.findById(req.user._id)
  const address = user.addresses?.id(req.params.id)
  if (!address) return errorResponse(res, 'Address not found', 404)

  const fields = ['name','phone','line1','line2','city','state','pincode','isDefault']
  fields.forEach((f) => { if (req.body[f] !== undefined) address[f] = req.body[f] })

  if (req.body.isDefault) user.addresses.forEach((a) => { if (a._id.toString() !== req.params.id) a.isDefault = false })
  await user.save()

  return successResponse(res, 'Address updated', { addresses: user.addresses })
}

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id)
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id)
  await user.save()
  return successResponse(res, 'Address deleted', { addresses: user.addresses })
}