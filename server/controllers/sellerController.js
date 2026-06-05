import User            from '../models/User.js'
import Product         from '../models/Product.js'
import Order           from '../models/Order.js'
import Category        from '../models/Category.js'
import cloudinary      from '../config/cloudinary.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import { io }          from '../server.js'
import { emitProductApproved, emitProductRejected, emitLowStock } from '../sockets/socketEmit.js'

const VALID_CATEGORIES = ['men','women','kids','watches','shoes','jewellery','accessories']

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 2: Business Info
// ═══════════════════════════════════════════════════════════════════════════════
export const saveBusinessInfo = async (req, res) => {
  const { businessName, businessType } = req.body
  if (!businessName || !businessType)
    return errorResponse(res, 'Business name and type are required')

  const user = await User.findById(req.user._id)
  user.sellerDetails.businessName  = businessName.trim()
  user.sellerDetails.businessType  = businessType
  user.sellerDetails.onboardingStep = Math.max(user.sellerDetails.onboardingStep, 2)
  await user.save()

  return successResponse(res, 'Business info saved', { user: user.toSafeObject() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 3: GSTIN & Tax
// ═══════════════════════════════════════════════════════════════════════════════
export const saveGSTIN = async (req, res) => {
  const { gstin, pan } = req.body
  if (!gstin) return errorResponse(res, 'GSTIN is required')

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstinRegex.test(gstin.toUpperCase()))
    return errorResponse(res, 'Invalid GSTIN format. Example: 27AAPFU0939F1ZV')

  const user = await User.findById(req.user._id)

  let gstCertUrl = user.sellerDetails.gstCertUrl
  if (req.file) gstCertUrl = req.file.path

  user.sellerDetails.gstin           = gstin.toUpperCase().trim()
  user.sellerDetails.pan             = pan?.toUpperCase().trim() || ''
  user.sellerDetails.gstCertUrl      = gstCertUrl
  user.sellerDetails.onboardingStep  = Math.max(user.sellerDetails.onboardingStep, 3)
  await user.save()

  return successResponse(res, 'GSTIN details saved', { user: user.toSafeObject() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 4: Bank Details
// ═══════════════════════════════════════════════════════════════════════════════
export const saveBankDetails = async (req, res) => {
  const { bankName, accountHolder, accountNumber, ifscCode } = req.body

  if (!bankName || !accountHolder || !accountNumber || !ifscCode)
    return errorResponse(res, 'All bank fields are required')

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  if (!ifscRegex.test(ifscCode.toUpperCase()))
    return errorResponse(res, 'Invalid IFSC code. Example: SBIN0001234')

  const user = await User.findById(req.user._id)

  let cancelChequeUrl = user.sellerDetails.cancelChequeUrl
  if (req.file) cancelChequeUrl = req.file.path

  user.sellerDetails.bankName         = bankName.trim()
  user.sellerDetails.accountHolder    = accountHolder.trim()
  user.sellerDetails.accountNumber    = accountNumber.trim()
  user.sellerDetails.ifscCode         = ifscCode.toUpperCase().trim()
  user.sellerDetails.cancelChequeUrl  = cancelChequeUrl
  user.sellerDetails.onboardingStep   = Math.max(user.sellerDetails.onboardingStep, 4)
  await user.save()

  return successResponse(res, 'Bank details saved', { user: user.toSafeObject() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 5: Pickup Address
// ═══════════════════════════════════════════════════════════════════════════════
export const savePickupAddress = async (req, res) => {
  const { line1, line2, city, state, pincode, contactName, contactPhone } = req.body

  if (!line1 || !city || !state || !pincode || !contactName || !contactPhone)
    return errorResponse(res, 'All pickup address fields are required')

  if (!/^\d{6}$/.test(pincode))
    return errorResponse(res, 'Invalid pincode — must be 6 digits')

  if (!/^[6-9]\d{9}$/.test(contactPhone))
    return errorResponse(res, 'Invalid contact phone number')

  const user = await User.findById(req.user._id)
  user.sellerDetails.pickupAddress = {
    line1: line1.trim(), line2: line2?.trim() || '',
    city: city.trim(), state: state.trim(),
    pincode: pincode.trim(),
    contactName: contactName.trim(),
    contactPhone: contactPhone.trim(),
  }
  user.sellerDetails.onboardingStep      = 5
  user.sellerDetails.onboardingComplete  = true
  await user.save()

  return successResponse(res, 'Pickup address saved! Onboarding complete. Await admin approval.', {
    user: user.toSafeObject(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SELLER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
export const getSellerProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
  return successResponse(res, 'Seller profile fetched', { user })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE SELLER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
export const updateSellerProfile = async (req, res) => {
  const { name, phone } = req.body
  const user = await User.findById(req.user._id)

  if (name)  user.name  = name.trim()
  if (phone) user.phone = phone.trim()
  if (req.file) user.profilePhoto = req.file.path

  await user.save()
  return successResponse(res, 'Profile updated', { user: user.toSafeObject() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD PRODUCT — ✅ FIXED: Cloudinary upload
// ═══════════════════════════════════════════════════════════════════════════════
export const addProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id)
    if (seller.sellerDetails.approvalStatus !== 'approved')
      return errorResponse(res, 'Your seller account must be approved before listing products', 403)

    const {
      title, description, brand,
      category, itemType, subItemType, itemName,
      mrp, sellingPrice, gstPercent, tags, weight,
      variants, additionalDetails,
    } = req.body

    if (!title || !description || !category || !itemType || !subItemType || !itemName || !mrp || !sellingPrice)
      return errorResponse(res, 'title, description, category, itemType, subItemType, itemName, mrp, sellingPrice are required')

    if (Number(sellingPrice) > Number(mrp))
      return errorResponse(res, 'Selling price cannot be more than MRP')

    if (!req.files || req.files.length === 0)
      return errorResponse(res, 'At least 1 product image is required')

    let parsedVariants = []
    try {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants || []
    } catch {
      return errorResponse(res, 'Invalid variants format')
    }

    if (parsedVariants.length === 0)
      return errorResponse(res, 'At least one size/stock variant is required')

    let parsedAdditional = {}
    try {
      parsedAdditional = typeof additionalDetails === 'string' ? JSON.parse(additionalDetails) : additionalDetails || {}
    } catch { parsedAdditional = {} }

    let parsedTags = []
    try {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || []
    } catch { parsedTags = [] }

    // ✅ FIXED — Cloudinary upload (purana code f.filename use karta tha jo undefined tha)
    let images = []
    try {
      images = await Promise.all(
        req.files.map((f) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'voguecart/products' },
              (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
              }
            ).end(f.buffer)
          })
        )
      )
    } catch (err) {
      console.error('[addProduct] Cloudinary upload failed:', err)
      return errorResponse(res, 'Image upload failed. Please try again.', 500)
    }

    const product = await Product.create({
      seller:            req.user._id,
      title:             title.trim(),
      description:       description.trim(),
      brand:             brand?.trim() || '',
      category,
      itemType,
      subItemType,
      itemName,
      mrp:               Number(mrp),
      sellingPrice:      Number(sellingPrice),
      gstPercent:        Number(gstPercent) || 5,
      tags:              parsedTags,
      weight:            Number(weight) || 0.5,
      images,
      variants:          parsedVariants,
      additionalDetails: parsedAdditional,
      status:            'pending',
    })

    return successResponse(res, 'Product added! Awaiting admin approval.', { product }, 201)
  } catch (err) {
    console.error('[addProduct]', err)
    return errorResponse(res, err.message || 'Failed to add product', 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET MY PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
export const getMyProducts = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 10
  const status = req.query.status          || null
  const skip   = (page - 1) * limit

  const filter = { seller: req.user._id }
  if (status) filter.status = status

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Products fetched', products, page, limit, total)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE PRODUCT
// ═══════════════════════════════════════════════════════════════════════════════
export const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
    .populate('category',    'name')
    .populate('itemType',    'name')
    .populate('subItemType', 'name')
    .populate('itemName',    'name')
  if (!product) return errorResponse(res, 'Product not found', 404)
  return successResponse(res, 'Product fetched', { product })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE PRODUCT — ✅ FIXED: category fields now saved + shipping fields added
// ═══════════════════════════════════════════════════════════════════════════════
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
    if (!product) return errorResponse(res, 'Product not found', 404)

    if (product.status === 'deleted')
      return errorResponse(res, 'Cannot update a deleted product')

    const {
      title, description, brand,
      category, itemType, subItemType, itemName,
      mrp, sellingPrice, gstPercent, tags, weight,
      variants, additionalDetails, keepImages,
      courierPartner, codAvailable, freeShipping,
    } = req.body

    // ── All 4 category levels are required on every update ────────────────
    // Without this, Mongoose throws "Cast to ObjectId failed" because the
    // product in DB may have an old plain string like "women" instead of an ObjectId.
    if (!category)    return errorResponse(res, 'Category is required', 400)
    if (!itemType)    return errorResponse(res, 'Item type is required', 400)
    if (!subItemType) return errorResponse(res, 'Sub item type is required', 400)
    if (!itemName)    return errorResponse(res, 'Item name is required', 400)

    // ── Always overwrite category fields with fresh ObjectIds from form ────
    product.category    = category
    product.itemType    = itemType
    product.subItemType = subItemType
    product.itemName    = itemName

    // ── Basic fields ──────────────────────────────────────────────────────
    if (title)               product.title        = title.trim()
    if (description)         product.description  = description.trim()
    if (brand !== undefined) product.brand        = brand.trim()
    if (mrp)                 product.mrp          = Number(mrp)
    if (sellingPrice)        product.sellingPrice = Number(sellingPrice)
    if (gstPercent)          product.gstPercent   = Number(gstPercent)
    if (weight)              product.weight       = Number(weight)

    if (Number(product.sellingPrice) > Number(product.mrp))
      return errorResponse(res, 'Selling price cannot be greater than MRP', 400)

    // ── Shipping fields ───────────────────────────────────────────────────
    if (req.body.shippingWeight !== undefined)
      product.shippingWeight      = parseInt(req.body.shippingWeight)      || product.shippingWeight
    if (req.body.packagingWeight !== undefined)
      product.packagingWeight     = parseInt(req.body.packagingWeight)     || product.packagingWeight
    if (req.body.length !== undefined)
      product.length              = parseFloat(req.body.length)            || product.length
    if (req.body.width !== undefined)
      product.width               = parseFloat(req.body.width)             || product.width
    if (req.body.height !== undefined)
      product.height              = parseFloat(req.body.height)            || product.height
    if (req.body.extraShippingCharge !== undefined)
      product.extraShippingCharge = parseFloat(req.body.extraShippingCharge) || 0
    if (codAvailable !== undefined)
      product.codAvailable        = codAvailable === 'true' || codAvailable === true
    if (freeShipping !== undefined)
      product.freeShipping        = freeShipping === 'true' || freeShipping === true
    if (courierPartner)
      product.courierPartner      = courierPartner

    // ── Tags, Variants, Additional Details ────────────────────────────────
    if (tags) {
      try { product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags } catch { }
    }
    if (variants) {
      try { product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants } catch { }
    }
    if (additionalDetails) {
      try {
        product.additionalDetails = typeof additionalDetails === 'string'
          ? JSON.parse(additionalDetails)
          : additionalDetails
      } catch { }
    }

    // ── Images ────────────────────────────────────────────────────────────
    if (req.files && req.files.length > 0) {
      // New files uploaded — upload to Cloudinary
      let newImages = []
      try {
        newImages = await Promise.all(
          req.files.map((f) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { folder: 'voguecart/products' },
                (error, result) => {
                  if (error) reject(error)
                  else resolve(result.secure_url)
                }
              ).end(f.buffer)
            })
          )
        )
      } catch (err) {
        console.error('[updateProduct] Cloudinary upload failed:', err)
        return errorResponse(res, 'Image upload failed. Please try again.', 500)
      }

      let kept = []
      try { kept = keepImages ? JSON.parse(keepImages) : [] } catch { kept = [] }

      const cleanKept = kept.filter(img =>
        img && typeof img === 'string' &&
        !img.includes('undefined') &&
        !img.includes('localhost')
      )

      product.images = [...cleanKept, ...newImages].slice(0, 8)

    } else if (keepImages) {
      // No new files but keepImages sent — restore existing images
      try {
        const kept = JSON.parse(keepImages)
        const cleanKept = kept.filter(img =>
          img && typeof img === 'string' &&
          !img.includes('undefined') &&
          !img.includes('localhost')
        )
        if (cleanKept.length > 0) product.images = cleanKept
      } catch { }
    }

    if (!product.images || product.images.length === 0)
      return errorResponse(res, 'At least 1 product image is required', 400)

    product.status = 'pending'
    await product.save()

    return successResponse(res, 'Product updated. Re-submitted for approval.', { product })
  } catch (err) {
    console.error('[updateProduct]', err)
    return errorResponse(res, err.message || 'Failed to update product', 500)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE PRODUCT (soft delete)
// ═══════════════════════════════════════════════════════════════════════════════
export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
  if (!product) return errorResponse(res, 'Product not found', 404)

  product.status = 'deleted'
  await product.save()

  return successResponse(res, 'Product deleted')
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════════
export const getDashboardStats = async (req, res) => {
  const sellerId = req.user._id

  const [totalProducts, activeProducts, pendingProducts, rejectedProducts] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Product.countDocuments({ seller: sellerId, status: 'active' }),
    Product.countDocuments({ seller: sellerId, status: 'pending' }),
    Product.countDocuments({ seller: sellerId, status: 'rejected' }),
  ])

  return successResponse(res, 'Dashboard stats', {
    stats: { totalProducts, activeProducts, pendingProducts, rejectedProducts },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 })
  return successResponse(res, 'Categories fetched', { categories })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SELLER ORDERS
// ═══════════════════════════════════════════════════════════════════════════════
export const getSellerOrders = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 20
  const skip   = (page - 1) * limit
  const status = req.query.status || null
  const search = req.query.search || null

  const filter = { 'items.seller': req.user._id }
  if (status) filter.status = status

  const [orders, total] = await Promise.all([
    Order.find(filter)
  .populate('buyer', 'name email phone')
  .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ])

  const sellerOrders = orders.map(order => {
    const obj = order.toObject()
    obj.items = obj.items.filter(item =>
      item.seller?.toString() === req.user._id.toString()
    )
    return obj
  })

  let result = sellerOrders
  if (search) {
    const q = search.toLowerCase()
    result = sellerOrders.filter(o =>
      (o.buyer?.name || '').toLowerCase().includes(q) ||
      (o.orderNumber || o._id?.toString() || '').toLowerCase().includes(q)
    )
  }

  return successResponse(res, 'Orders fetched', { orders: result, total })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE ORDER STATUS
// ═══════════════════════════════════════════════════════════════════════════════
export const updateSellerOrderStatus = async (req, res) => {
  const { status } = req.body

  const allowed = ['confirmed', 'packed', 'shipped', 'cancelled']
  if (!allowed.includes(status))
    return errorResponse(res, `Sellers can only update to: ${allowed.join(', ')}`)

  const order = await Order.findOne({
    _id: req.params.orderId,
    'items.seller': req.user._id,
  })
  if (!order) return errorResponse(res, 'Order not found', 404)

  const sellerFlow = { placed: 'confirmed', confirmed: 'packed', packed: 'shipped' }
  if (status !== 'cancelled' && sellerFlow[order.status] !== status)
    return errorResponse(res, `Cannot jump from ${order.status} to ${status}`)

  order.status = status
  order.statusHistory.push({ status, note: 'Updated by seller' })
  await order.save()

  return successResponse(res, 'Order status updated', { order })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SELLER ORDER STATS
// ═══════════════════════════════════════════════════════════════════════════════
export const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id

    const [
      total, placed, confirmed, packed, shipped,
      out_for_delivery, delivered, cancelled, revenueAgg,
    ] = await Promise.all([
      Order.countDocuments({ 'items.seller': sellerId }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'placed' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'confirmed' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'packed' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'shipped' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'out_for_delivery' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'delivered' }),
      Order.countDocuments({ 'items.seller': sellerId, status: 'cancelled' }),
      Order.aggregate([
        { $match: { 'items.seller': sellerId, status: { $nin: ['cancelled', 'returned'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ])

    return successResponse(res, 'Stats fetched', {
      total, placed, confirmed, packed, shipped,
      out_for_delivery, delivered, cancelled,
      revenue: revenueAgg[0]?.total || 0,
    })
  } catch (err) {
    return errorResponse(res, err.message, 500)
  }
}