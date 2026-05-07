import User            from '../models/User.js'
import Product         from '../models/Product.js'
import Category        from '../models/Category.js'
import cloudinary      from '../config/cloudinary.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import { io }          from '../server.js'
import { emitProductApproved, emitProductRejected, emitLowStock } from '../sockets/socketEmit.js'

const VALID_CATEGORIES = ['men','women','kids','watches','shoes','jewellery','accessories']

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 2: Business Info
// PUT /api/seller/onboarding/business
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
// PUT /api/seller/onboarding/gstin
// ═══════════════════════════════════════════════════════════════════════════════
export const saveGSTIN = async (req, res) => {
  const { gstin, pan } = req.body
  if (!gstin) return errorResponse(res, 'GSTIN is required')

  // Basic GSTIN format: 15 chars alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstinRegex.test(gstin.toUpperCase()))
    return errorResponse(res, 'Invalid GSTIN format. Example: 27AAPFU0939F1ZV')

  const user = await User.findById(req.user._id)

  // Handle uploaded GST certificate
  let gstCertUrl = user.sellerDetails.gstCertUrl
  if (req.file) gstCertUrl = req.file.path   // Cloudinary URL

  user.sellerDetails.gstin           = gstin.toUpperCase().trim()
  user.sellerDetails.pan             = pan?.toUpperCase().trim() || ''
  user.sellerDetails.gstCertUrl      = gstCertUrl
  user.sellerDetails.onboardingStep  = Math.max(user.sellerDetails.onboardingStep, 3)
  await user.save()

  return successResponse(res, 'GSTIN details saved', { user: user.toSafeObject() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — STEP 4: Bank Details
// PUT /api/seller/onboarding/bank
// ═══════════════════════════════════════════════════════════════════════════════
export const saveBankDetails = async (req, res) => {
  const { bankName, accountHolder, accountNumber, ifscCode } = req.body

  if (!bankName || !accountHolder || !accountNumber || !ifscCode)
    return errorResponse(res, 'All bank fields are required')

  // IFSC format: 4 letters + 0 + 6 alphanumeric
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
// PUT /api/seller/onboarding/pickup
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
// GET SELLER PROFILE (onboarding status + details)
// GET /api/seller/profile
// ═══════════════════════════════════════════════════════════════════════════════
export const getSellerProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
  return successResponse(res, 'Seller profile fetched', { user })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE SELLER PROFILE (name, phone, profilePhoto)
// PUT /api/seller/profile
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
// ADD PRODUCT
// POST /api/seller/products
// ═══════════════════════════════════════════════════════════════════════════════
export const addProduct = async (req, res) => {
  // Check seller is approved
  const seller = await User.findById(req.user._id)
  if (seller.sellerDetails.approvalStatus !== 'approved')
    return errorResponse(res, 'Your seller account must be approved before listing products', 403)

  const {
    title, description, brand, category, subCategory,
    mrp, sellingPrice, gstPercent, tags, weight,
    variants,   // JSON string: [{ size, color, stock, sku }]
  } = req.body

  // Validation
  if (!title || !description || !category || !subCategory || !mrp || !sellingPrice)
    return errorResponse(res, 'title, description, category, subCategory, mrp, sellingPrice are required')

  // ✅ Fixed: allow all valid categories
  if (!VALID_CATEGORIES.includes(category))
    return errorResponse(res, `Category must be one of: ${VALID_CATEGORIES.join(', ')}`)

  if (Number(sellingPrice) > Number(mrp))
    return errorResponse(res, 'Selling price cannot be more than MRP')

  if (!req.files || req.files.length === 0)
    return errorResponse(res, 'At least 1 product image is required')

  // Parse variants
  let parsedVariants = []
  try {
    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants || []
  } catch {
    return errorResponse(res, 'Invalid variants format')
  }

  if (parsedVariants.length === 0)
    return errorResponse(res, 'At least one size/stock variant is required')

  // Image URLs from Cloudinary
  const images = req.files.map((f) => `http://localhost:5000/uploads/${f.filename}`)

  // Parse tags
  let parsedTags = []
  try {
    parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || []
  } catch { parsedTags = [] }

  const product = await Product.create({
    seller:       req.user._id,
    title:        title.trim(),
    description:  description.trim(),
    brand:        brand?.trim() || '',
    category,
    subCategory:  subCategory.trim(),
    mrp:          Number(mrp),
    sellingPrice: Number(sellingPrice),
    gstPercent:   Number(gstPercent) || 5,
    tags:         parsedTags,
    weight:       Number(weight) || 0.5,
    images,
    variants:     parsedVariants,
    status:       'pending',
  })

  return successResponse(res, 'Product added! Awaiting admin approval.', { product }, 201)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET MY PRODUCTS
// GET /api/seller/products?page=1&limit=10&status=active
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
// GET /api/seller/products/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
  if (!product) return errorResponse(res, 'Product not found', 404)
  return successResponse(res, 'Product fetched', { product })
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE PRODUCT
// PUT /api/seller/products/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const updateProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
  if (!product) return errorResponse(res, 'Product not found', 404)

  if (product.status === 'deleted')
    return errorResponse(res, 'Cannot update a deleted product')

  const {
    title, description, brand, mrp, sellingPrice,
    gstPercent, tags, weight, variants, keepImages,
  } = req.body

  if (title)        product.title        = title.trim()
  if (description)  product.description  = description.trim()
  if (brand)        product.brand        = brand.trim()
  if (mrp)          product.mrp          = Number(mrp)
  if (sellingPrice) product.sellingPrice = Number(sellingPrice)
  if (gstPercent)   product.gstPercent   = Number(gstPercent)
  if (weight)       product.weight       = Number(weight)

  if (tags) {
    try { product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags } catch { }
  }
  if (variants) {
    try { product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants } catch { }
  }

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => `http://localhost:5000/uploads/${f.filename}`)
    // keepImages: existing image URLs to keep
    let kept = []
    try { kept = keepImages ? JSON.parse(keepImages) : [] } catch { kept = [] }
    product.images = [...kept, ...newImages].slice(0, 8)
  }

  // Re-submit for approval if price/description changed
  product.status = 'pending'
  await product.save()

  return successResponse(res, 'Product updated. Re-submitted for approval.', { product })
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE PRODUCT (soft delete)
// DELETE /api/seller/products/:id
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
// GET /api/seller/dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const getDashboardStats = async (req, res) => {
  const sellerId = req.user._id

  const [
    totalProducts,
    activeProducts,
    pendingProducts,
    rejectedProducts,
  ] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Product.countDocuments({ seller: sellerId, status: 'active' }),
    Product.countDocuments({ seller: sellerId, status: 'pending' }),
    Product.countDocuments({ seller: sellerId, status: 'rejected' }),
  ])

  return successResponse(res, 'Dashboard stats', {
    stats: {
      totalProducts,
      activeProducts,
      pendingProducts,
      rejectedProducts,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL CATEGORIES (for product form dropdowns)
// GET /api/seller/categories
// ═══════════════════════════════════════════════════════════════════════════════
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 })
  return successResponse(res, 'Categories fetched', { categories })
}