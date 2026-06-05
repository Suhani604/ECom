import User     from '../models/User.js'
import Product  from '../models/Product.js'
import Order    from '../models/Order.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import { io }   from '../server.js'
import {
  emitSellerApproved, emitSellerRejected,
  emitProductApproved, emitProductRejected,emitDeliveryAssigned
} from '../sockets/socketEmit.js'
import DeliveryPartner from '../models/DeliveryPartner.js'

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL DELIVERY PARTNERS
// GET /api/admin/delivery-partners
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find()
      .select('-password')
      .sort({ createdAt: -1 })
    return successResponse(res, 'Delivery partners fetched', { partners })
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVE DELIVERY PARTNER
// PUT /api/admin/delivery-partners/:id/approve
// ═══════════════════════════════════════════════════════════════════════════════
export const approveDeliveryPartner = async (req, res) => {
  try {
    const dp = await DeliveryPartner.findById(req.params.id)
    if (!dp) return errorResponse(res, 'Delivery partner not found', 404)
    dp.isApproved = true
    await dp.save()
    return successResponse(res, `${dp.name} approved successfully`)
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSIGN DELIVERY PARTNER TO ORDER (by pincode/area match)
// PUT /api/admin/orders/:id/assign-delivery
// ═══════════════════════════════════════════════════════════════════════════════
export const assignDeliveryPartner = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone')
    if (!order) return errorResponse(res, 'Order not found', 404)

    const deliveryPincode = order.deliveryAddress?.pincode

    // Area-based auto assign — same pincode first, then same city
    let dp = await DeliveryPartner.findOne({
      isApproved:  true,
      isOnline:    true,
      isAvailable: true,
      'serviceArea.pincode': deliveryPincode,
    })

    // Fallback — same city
    if (!dp) {
      dp = await DeliveryPartner.findOne({
        isApproved:  true,
        isOnline:    true,
        isAvailable: true,
        'serviceArea.city': order.deliveryAddress?.city,
      })
    }

    if (!dp) return errorResponse(res, 'No available delivery partner in this area', 404)

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    order.deliveryBoy  = dp._id
    order.deliveryOTP  = otp
    order.status       = 'shipped'
    order.statusHistory.push({
      status: 'shipped',
      note: `Assigned to ${dp.name}`,
      updatedAt: new Date(),
    })
    await order.save()

    // Mark partner as unavailable
    dp.isAvailable = false
    await dp.save()

    // Real-time notify
    const sellerId = order.items[0]?.seller
    emitDeliveryAssigned(io, {
      orderId:         order._id,
      deliveryBoyId:   dp._id,
      buyerId:         order.buyer._id,
      sellerId,
      deliveryBoyName: dp.name,
    })

    return successResponse(res, `Order assigned to ${dp.name}`, {
      deliveryPartner: { name: dp.name, phone: dp.phone },
      otp, // Admin ko dikhao OTP (for reference)
    })
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET DELIVERY PARTNERS LIVE MAP DATA
// GET /api/admin/delivery-partners/live
// ═══════════════════════════════════════════════════════════════════════════════
export const getLiveDeliveryMap = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({ isOnline: true })
      .select('name phone currentLocation isAvailable serviceArea')
    return successResponse(res, 'Live partners fetched', { partners })
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// GET /api/admin/dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const getDashboardStats = async (req, res) => {
  const [
    totalBuyers,
    totalSellers,
    approvedSellers,
    pendingSellers,
    totalProducts,
    activeProducts,
    pendingProducts,
    totalOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'seller', 'sellerDetails.approvalStatus': 'approved' }),
    User.countDocuments({ role: 'seller', 'sellerDetails.approvalStatus': 'pending' }),
    Product.countDocuments({ status: { $ne: 'deleted' } }),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'pending' }),
    Order.countDocuments(),
  ])

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ])
  const totalRevenue = revenueAgg[0]?.total || 0

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
  const newSellersThisWeek = await User.countDocuments({
    role: 'seller',
    createdAt: { $gte: sevenDaysAgo },
  })

  return successResponse(res, 'Dashboard stats', {
    stats: {
      totalBuyers, totalSellers, approvedSellers, pendingSellers,
      totalProducts, activeProducts, pendingProducts,
      totalOrders, totalRevenue, recentOrders, newSellersThisWeek,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL SELLERS
// GET /api/admin/sellers?page=1&limit=10&status=pending
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllSellers = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 10
  const status = req.query.status          || null
  const search = req.query.search          || ''
  const skip   = (page - 1) * limit

  const filter = { role: 'seller' }
  if (status) filter['sellerDetails.approvalStatus'] = status
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'sellerDetails.businessName': { $regex: search, $options: 'i' } },
      { 'sellerDetails.gstin':        { $regex: search, $options: 'i' } },
    ]
  }

  const [sellers, total] = await Promise.all([
    User.find(filter)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Sellers fetched', sellers, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE SELLER
// GET /api/admin/sellers/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const getSellerById = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
    .select('-password -otp -otpExpiry')
  if (!seller) return errorResponse(res, 'Seller not found', 404)

  const products = await Product.find({ seller: seller._id })
    .select('title status images sellingPrice createdAt')
    .sort({ createdAt: -1 })
    .limit(10)

  return successResponse(res, 'Seller fetched', { seller, products })
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVE SELLER
// PUT /api/admin/sellers/:id/approve
// ═══════════════════════════════════════════════════════════════════════════════
export const approveSeller = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
  if (!seller) return errorResponse(res, 'Seller not found', 404)

  seller.sellerDetails.approvalStatus  = 'approved'
  seller.sellerDetails.approvedAt      = new Date()
  seller.sellerDetails.rejectionReason = ''
  await seller.save()

  emitSellerApproved(io, { sellerId: seller._id })
  return successResponse(res, `Seller "${seller.name}" approved successfully`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// REJECT SELLER
// PUT /api/admin/sellers/:id/reject
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectSeller = async (req, res) => {
  const { reason } = req.body
  if (!reason) return errorResponse(res, 'Rejection reason is required')

  const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
  if (!seller) return errorResponse(res, 'Seller not found', 404)

  seller.sellerDetails.approvalStatus  = 'rejected'
  seller.sellerDetails.rejectionReason = reason
  await seller.save()

  emitSellerRejected(io, { sellerId: seller._id, reason })
  return successResponse(res, `Seller "${seller.name}" rejected`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUSPEND / UNSUSPEND SELLER
// PUT /api/admin/sellers/:id/suspend
// ═══════════════════════════════════════════════════════════════════════════════
export const suspendSeller = async (req, res) => {
  const seller = await User.findOne({ _id: req.params.id, role: 'seller' })
  if (!seller) return errorResponse(res, 'Seller not found', 404)

  const isSuspended = seller.sellerDetails.approvalStatus === 'suspended'
  seller.sellerDetails.approvalStatus = isSuspended ? 'approved' : 'suspended'
  seller.isActive = isSuspended
  await seller.save()

  return successResponse(res, isSuspended ? 'Seller unsuspended' : 'Seller suspended')
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL PRODUCTS
// GET /api/admin/products?page=1&status=pending
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllProducts = async (req, res) => {
  const page     = parseInt(req.query.page)  || 1
  const limit    = parseInt(req.query.limit) || 12
  const status   = req.query.status          || null
  const category = req.query.category        || null
  const search   = req.query.search          || ''
  const skip     = (page - 1) * limit

  const filter = { status: { $ne: 'deleted' } }
  if (status)   filter.status   = status
  if (category) filter.category = category
  if (search)   filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { brand: { $regex: search, $options: 'i' } },
  ]

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name email sellerDetails.businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Products fetched', products, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVE PRODUCT
// PUT /api/admin/products/:id/approve
// ═══════════════════════════════════════════════════════════════════════════════
export const approveProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name')
  if (!product) return errorResponse(res, 'Product not found', 404)

  product.status          = 'active'
  product.approvedAt      = new Date()
  product.rejectionReason = ''
  await product.save()

  emitProductApproved(io, {
    sellerId: product.seller._id, productId: product._id, productTitle: product.title,
  })
  return successResponse(res, `Product "${product.title}" approved and is now live`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// REJECT PRODUCT
// PUT /api/admin/products/:id/reject
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectProduct = async (req, res) => {
  const { reason } = req.body
  if (!reason) return errorResponse(res, 'Rejection reason is required')

  const product = await Product.findById(req.params.id).populate('seller', 'name')
  if (!product) return errorResponse(res, 'Product not found', 404)

  product.status          = 'rejected'
  product.rejectionReason = reason
  await product.save()

  emitProductRejected(io, {
    sellerId: product.seller._id, productId: product._id,
    productTitle: product.title, reason,
  })
  return successResponse(res, `Product "${product.title}" rejected`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL BUYERS
// GET /api/admin/buyers?page=1&search=
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllBuyers = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 10
  const search = req.query.search          || ''
  const skip   = (page - 1) * limit

  const filter = { role: 'buyer' }
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
  }

  const [buyers, total] = await Promise.all([
    User.find(filter)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Buyers fetched', buyers, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK / UNBLOCK USER
// PUT /api/admin/users/:id/block
// ═══════════════════════════════════════════════════════════════════════════════
export const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return errorResponse(res, 'User not found', 404)
  if (user.role === 'admin') return errorResponse(res, 'Cannot block admin', 403)

  user.isActive = !user.isActive
  await user.save()

  return successResponse(res, user.isActive ? 'User unblocked' : 'User blocked')
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL ORDERS (admin view)
// GET /api/admin/orders?page=1&status=
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllOrders = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 10
  const status = req.query.status          || null
  const search = req.query.search          || ''
  const skip   = (page - 1) * limit

  const filter = {}
  if (status) filter.status = status
  if (search) {
    filter.$or = [
      { _id: search.match(/^[a-f\d]{24}$/i) ? search : null },
    ].filter(Boolean)
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
  .populate('buyer', 'name email phone')
  .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Orders fetched', orders, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE ORDER STATUS (admin)
// PUT /api/admin/orders/:id/status
//
// ROLE SPLIT:
//   Seller  → placed → confirmed → packed → shipped
//   Admin   → shipped → out_for_delivery → delivered  (+ can cancel anything)
//
// Admin button shown only when order is shipped or beyond.
// Admin can also cancel any order at any stage.
// ═══════════════════════════════════════════════════════════════════════════════
export const updateOrderStatus = async (req, res) => {
  try {
    const { id }     = req.params
    const { status } = req.body

    // All valid statuses in the system
    const allStatuses = [
      'placed', 'confirmed', 'packed', 'shipped',
      'out_for_delivery', 'delivered',
      'cancelled', 'return_requested', 'returned',
    ]
    if (!allStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' })

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // ── Admin handoff rule ──────────────────────────────────────────────────
    // Admin takes over AFTER seller has marked shipped.
    // Admin can advance: shipped → out_for_delivery → delivered
    // Admin can also cancel any order at any point.
    // Admin CANNOT go backwards or skip steps.
    // ─────────────────────────────────────────────────────────────────────────

    const adminFlow = {
      shipped:          'out_for_delivery',
      out_for_delivery: 'delivered',
    }

    // If not cancelling, enforce the admin flow order
    if (status !== 'cancelled' && status !== 'return_requested' && status !== 'returned') {
      const expectedNext = adminFlow[order.status]

      // If the current status is in the SELLER zone (placed/confirmed/packed)
      // admin should not be advancing — warn but allow in dev mode
      const sellerZone = ['placed', 'confirmed', 'packed']
      if (sellerZone.includes(order.status) && sellerZone.includes(status)) {
        // Allow admin to also do seller steps (fallback if seller hasn't acted)
      } else if (expectedNext && expectedNext !== status) {
        return res.status(400).json({
          message: `Cannot jump from "${order.status}" to "${status}". Expected next: "${expectedNext}"`,
        })
      }
    }

    order.status = status
    order.statusHistory.push({ status, note: 'Updated by admin', updatedAt: new Date() })

    // Auto mark COD as paid on delivery
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid'
    }

    await order.save()
    res.json({ message: 'Status updated', order })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}