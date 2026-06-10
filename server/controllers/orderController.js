import Razorpay  from 'razorpay'
import crypto    from 'crypto'
import Order     from '../models/Order.js'
import Product   from '../models/Product.js'
import User      from '../models/User.js'
import { sendOutForDeliveryEmail ,sendOrderPlacedEmail} from '../utils/emailHelper.js'
import { emitOutForDelivery } from '../sockets/socketEmit.js'
import { sendOutForDeliveryWhatsApp, sendOutForDeliverySMS } from '../utils/whatsappHelper.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import { io }    from '../server.js'
import { emitOrderPlaced, emitPaymentConfirmed, emitLowStock } from '../sockets/socketEmit.js'
import { lookupPincode } from '../utils/pincodeDB.js'

// ── FIXED IMPORT — all 5 named exports now exist in shippingHelper.js ─────────
import {
  calculateShipping,
  calculateReverseShipping,
  detectZone,
  getCheapestCourier,
} from '../utils/shippingHelper.js'
import { Courier } from '../models/ShippingConfig.js'

// ─── Razorpay instance ────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const SELLER_PINCODE = process.env.SELLER_PINCODE || '444604'

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE ORDER
// POST /api/orders
// ═══════════════════════════════════════════════════════════════════════════════
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, couponCode } = req.body

    if (!items || items.length === 0)
      return errorResponse(res, 'Cart is empty')

    if (!deliveryAddress)
      return errorResponse(res, 'Delivery address is required')

    if (!['razorpay', 'cod'].includes(paymentMethod))
      return errorResponse(res, 'Invalid payment method')

    // ── Validate items & calculate subtotal ────────────────────────────────
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || product.status !== 'active')
        return errorResponse(res, `Product "${item.title}" is no longer available`)

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

    // ── Calculate shipping ─────────────────────────────────────────────────
    const buyerPincode     = deliveryAddress.pincode
    const zone           = detectZone(buyerPincode, SELLER_PINCODE)
    const firstProduct   = await Product.findById(orderItems[0].product)
    const itemWeightG    = firstProduct?.shippingWeight  || 500
    const packagingWeightG = firstProduct?.packagingWeight || 60

const shipping = await calculateShipping({
  itemWeightG,
  packagingWeightG,
  zone,
  isCOD:        paymentMethod === 'cod',
  sellingPrice: subtotal,
})

    const discount    = 0
    const totalAmount = subtotal + shipping.shippingFee - discount

    // ── Create order ───────────────────────────────────────────────────────
    const order = await Order.create({
      buyer:         req.user._id,
      items:         orderItems,
      deliveryAddress,
      paymentMethod,
      paymentStatus: 'pending',

      subtotal,
      discount,
      totalAmount,
      couponCode: couponCode || '',

      shippingFee:        shipping.shippingFee,
      courierName:        shipping.courierLabel,
      zone:               shipping.zone,
      deliveryDays:       shipping.deliveryDays,
      codCharge:          shipping.codCharge,
      platformCommission: shipping.platformCommission,
      gstOnShipping:      shipping.gstOnShipping,
      paymentGatewayFee:  shipping.paymentGatewayFee,
      totalDeducted:      shipping.totalDeducted,
      sellerPayout:       shipping.sellerPayout,
      effectiveMarginPct: shipping.effectiveMarginPct,

      status:        'placed',
      statusHistory: [{ status: 'placed', updatedAt: new Date(), note: 'Order placed' }],
    })

    // ── Reduce stock & emit events ─────────────────────────────────────────
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': -item.quantity } }
      )

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

      emitOrderPlaced(io, {
        orderId:      order._id,
        sellerId:     item.seller,
        buyerName:    req.user.name,
        productTitle: item.title,
        amount:       totalAmount,
      })
    }

    return successResponse(res, 'Order placed successfully', {
      order,
      shippingBreakdown: {
        courier:      shipping.courierLabel,
        zone:         shipping.zone,
        shippingFee:  shipping.shippingFee,
        deliveryDays: shipping.deliveryDays,
        deliveryDate: shipping.deliveryDate,
        codCharge:    shipping.codCharge,
        sellerPayout: shipping.sellerPayout,
      },
    }, 201)

  } catch (err) {
    console.error('[createOrder]', err)
    return errorResponse(res, err.message || 'Failed to place order', 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE RAZORPAY PAYMENT ORDER
// POST /api/orders/:id/razorpay
// ═══════════════════════════════════════════════════════════════════════════════
export const createRazorpayOrder = async (req, res) => {
  console.log('[RAZORPAY ROUTE] user:', req.user?._id, 'orderId:', req.params.id)
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
  console.log('[RAZORPAY ROUTE] order found:', !!order)

  if (order.paymentStatus === 'paid')
    return errorResponse(res, 'Order already paid')

  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(order.totalAmount * 100),
    currency: 'INR',
    receipt:  `order_${order._id}`,
    notes:    { orderId: order._id.toString(), buyerId: req.user._id.toString() },
  })

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
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
    return errorResponse(res, 'All payment verification fields are required')

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature)
    return errorResponse(res, 'Payment verification failed — invalid signature', 400)

  const order = await Order.findById(orderId)
  if (!order) return errorResponse(res, 'Order not found', 404)

  order.paymentStatus     = 'paid'
  order.razorpayPaymentId = razorpayPaymentId
  order.status            = 'confirmed'
  order.statusHistory.push({ status: 'confirmed', updatedAt: new Date(), note: 'Payment verified' })
  await order.save()

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
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Orders fetched', orders, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE ORDER
// GET /api/orders/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
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

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock': item.quantity } }
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
// ═══════════════════════════════════════════════════════════════════════════════
export const requestReturn = async (req, res) => {
  const { reason } = req.body
  if (!reason) return errorResponse(res, 'Return reason is required')

  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
  if (!order) return errorResponse(res, 'Order not found', 404)

  if (order.status !== 'delivered')
    return errorResponse(res, 'Can only return delivered orders')

  // ── FIXED: calculateReverseShipping returns .total not .totalReverse ──────
  const reverseCharge = await calculateReverseShipping(order.zone || 'nonMetro')

  order.status = 'return_requested'
  order.statusHistory.push({
    status:    'return_requested',
    updatedAt: new Date(),
    note:      `${reason} | Reverse charge: ₹${reverseCharge.total}`,
  })
  await order.save()

  return successResponse(res, 'Return request submitted', { reverseCharge })
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

  if (isDefault) user.addresses.forEach((a) => { a.isDefault = false })

  user.addresses.push({
    name, phone, line1, line2: line2 || '', city, state, pincode,
    isDefault: isDefault || user.addresses.length === 0,
  })
  await user.save()

  return successResponse(res, 'Address added', { addresses: user.addresses }, 201)
}

export const updateAddress = async (req, res) => {
  const user    = await User.findById(req.user._id)
  const address = user.addresses?.id(req.params.id)
  if (!address) return errorResponse(res, 'Address not found', 404)

  const fields = ['name', 'phone', 'line1', 'line2', 'city', 'state', 'pincode', 'isDefault']
  fields.forEach((f) => { if (req.body[f] !== undefined) address[f] = req.body[f] })

  if (req.body.isDefault)
    user.addresses.forEach((a) => { if (a._id.toString() !== req.params.id) a.isDefault = false })

  await user.save()
  return successResponse(res, 'Address updated', { addresses: user.addresses })
}

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id)
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id)
  await user.save()
  return successResponse(res, 'Address deleted', { addresses: user.addresses })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE ORDER STATUS (admin / seller)
// PUT /api/orders/:id/status
// ═══════════════════════════════════════════════════════════════════════════════
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingUrl, note } = req.body

    const validStatuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
    if (!validStatuses.includes(status))
      return errorResponse(res, 'Invalid status')

    const order = await Order.findById(req.params.id).populate('buyer', 'name email phone')
    if (!order) return errorResponse(res, 'Order not found', 404)

    order.status = status
    if (trackingUrl) order.trackingUrl = trackingUrl
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      note: note || `Status updated to ${status}`,
    })
    await order.save()

    io.to(`user_${order.buyer._id}`).emit('order_status_update', {
      orderId:   order._id,
      status,
      message:   `Your order is now: ${status.replace(/_/g, ' ')}`,
      timestamp: new Date(),
    })

    if (status === 'out_for_delivery') {
      const tracking = trackingUrl || `${process.env.CLIENT_URL}/order/${order._id}`

      await sendOutForDeliveryEmail(order.buyer.email, order.buyer.name, order._id.toString(), tracking)

      if (order.buyer.phone) {
        await sendOutForDeliveryWhatsApp(order.buyer.phone, order.buyer.name, order._id.toString(), tracking)
        await sendOutForDeliverySMS(order.buyer.phone, order.buyer.name, order._id.toString(), tracking)
      }

      emitOutForDelivery(io, { orderId: order._id, buyerId: order.buyer._id, trackingUrl: tracking })
    }

    return successResponse(res, 'Order status updated', { order })
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHECK PINCODE DELIVERY
// GET /api/orders/check-pincode?pincode=444801
// Public — no auth needed
// ═══════════════════════════════════════════════════════════════════════════════
const METRO_CITIES = new Set([
  'Mumbai', 'Delhi', 'New Delhi', 'Bengaluru', 'Bangalore Urban',
  'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad',
  'Surat', 'Jaipur', 'Lucknow', 'Nagpur',
])
const NO_COD_ZONES = new Set(['Lakshadweep', 'Andaman and Nicobar'])

function parseGoogleComponents(components = []) {
  const get = (type) => components.find(c => c.types.includes(type))?.long_name || null
  const city     = get('locality') || get('administrative_area_level_3')
  const district = get('administrative_area_level_2') || city
  const state    = get('administrative_area_level_1')
  return { city, district, state }
}

async function buildPincodeResult(pincode, { city, district, state }, buyerPincode) {
  const zone         = detectZone(buyerPincode, SELLER_PINCODE)
const courierData  = await getCheapestCourier(zone)

  // ── FIXED: deliveryDays is now an object per zone ─────────────────────────
  const deliveryDays = courierData.deliveryDays[zone] || 4
  const deliveryDate = new Date(Date.now() + deliveryDays * 86400000)
    .toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

  const codAvailable = !NO_COD_ZONES.has(state) && !NO_COD_ZONES.has(district)
  const zoneRates    = courierData.zones[zone]
  const shippingFee  = zoneRates ? Math.round((40 + 55) / 2) : 49

  return {
    available:    true,
    pincode,
    city:         city || district || state,
    district:     district || state,
    state,
    zone,
    deliveryDate,
    deliveryDays,
    codAvailable,
    courierName:  courierData.label,
    shippingFee,
    areas:        [],
    message:      `Delivery available in ${city || district}, ${state}`,
  }
}

export const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.query

    if (!pincode || !/^\d{6}$/.test(pincode))
      return errorResponse(res, 'Invalid pincode — must be 6 digits', 400)

    const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY

    if (GOOGLE_KEY) {
      try {
        const controller = new AbortController()
        const timer      = setTimeout(() => controller.abort(), 5000)
        const url        = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${pincode}|country:IN&key=${GOOGLE_KEY}`
        const response   = await fetch(url, { signal: controller.signal })
        clearTimeout(timer)
        const data = await response.json()

        if (data.status === 'OK' && data.results?.length) {
          const parsed = parseGoogleComponents(data.results[0].address_components)
          if (parsed.state) {
            console.log(`[checkPincode] Google ✅ ${pincode} → ${parsed.city}, ${parsed.state}`)
            return successResponse(res, 'Pincode checked', await buildPincodeResult(pincode, parsed, pincode))
          }
        }

        if (data.status === 'ZERO_RESULTS') {
          return successResponse(res, 'Pincode checked', {
            available: false, pincode, message: 'Pincode not found. Please check and try again.',
          })
        }

        console.warn(`[checkPincode] Google status: ${data.status} — using local DB`)
      } catch (googleErr) {
        console.warn('[checkPincode] Google API failed:', googleErr.message, '— using local DB')
      }
    }

    const local = lookupPincode(pincode)

    if (local) {
      console.log(`[checkPincode] Local DB ✅ ${pincode} → ${local.district}, ${local.state}`)
      const zone         = detectZone(pincode, SELLER_PINCODE)
     const courierData  = await getCheapestCourier(zone)

      // ── FIXED: deliveryDays is now an object per zone ───────────────────
      const deliveryDays = courierData.zones?.[zone]?.deliveryDays || 4
      const deliveryDate = new Date(Date.now() + deliveryDays * 86400000)
        .toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

      return successResponse(res, 'Pincode checked', {
        ...local,
        zone,
        deliveryDays,
        deliveryDate,
        courierName: courierData.label,
        shippingFee: 47,
      })
    }

    return successResponse(res, 'Pincode checked', {
      available: false, pincode,
      message:   'Delivery not available for this pincode.',
    })

  } catch (err) {
    console.error('[checkPincode] Error:', err.message)
    return errorResponse(res, 'Could not check pincode. Try again.', 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHIPPING RATES  (seller dashboard)
// GET /api/orders/shipping-rates
// ═══════════════════════════════════════════════════════════════════════════════
export const shippingRates = async (req, res) => {
  const couriers = await Courier.find({ isActive: true })
  return successResponse(res, 'Shipping rates fetched', {
    couriers,
    sellerPincode: SELLER_PINCODE,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALCULATE SHIPPING  (product page / checkout preview)
// POST /api/orders/calculate-shipping
// Body: { itemWeightG, packagingWeightG, sellingPrice, buyerPincode, isCOD }
// ═══════════════════════════════════════════════════════════════════════════════
export const calculateShippingRoute = async (req, res) => {
  try {
    const {
      itemWeightG      = 500,
      packagingWeightG = 60,
      sellingPrice     = 0,
      buyerPincode     = '400001',
      isCOD            = false,
    } = req.body

    const zone    = detectZone(buyerPincode, SELLER_PINCODE)
    const result  = await calculateShipping({ itemWeightG, packagingWeightG, zone, isCOD, sellingPrice })

    return successResponse(res, 'Shipping calculated', result)
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}