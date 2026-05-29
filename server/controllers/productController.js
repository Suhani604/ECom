// server/controllers/productController.js
import Product  from '../models/Product.js'
import Category from '../models/Category.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'
import cloudinary from '../config/cloudinary.js'

// ─── helpers ─────────────────────────────────────────────────────────────────
const toNum   = (v, fallback = 0)   => { const n = parseFloat(v);   return isNaN(n) ? fallback : n }
const toInt   = (v, fallback = 0)   => { const n = parseInt(v);     return isNaN(n) ? fallback : n }
const toBool  = (v, fallback = true) => v === undefined ? fallback : v === 'true' || v === true

// ─── GET ALL PRODUCTS (public) ────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  const page     = parseInt(req.query.page)  || 1
  const limit    = parseInt(req.query.limit) || 12
  const category = req.query.category        || null
  const search   = req.query.search          || null
  const skip     = (page - 1) * limit

  const filter = { status: 'active' }

  if (category) {
    const cat = await Category.findOne({
      name:     { $regex: new RegExp(`^${category}$`, 'i') },
      parent:   null,
      isActive: true,
    })
    filter.category = cat ? cat._id : null
  }

  if (search) {
    const matchingCatIds = await Category.find({
      name: { $regex: search, $options: 'i' },
      isActive: true,
    }).select('_id')

    const ids = matchingCatIds.map(c => c._id)

    const KEYWORD_MAP = {
      'T-Shirts':  ['tshirt', 't-shirt', 'tee', 'polo'],
      'Shirts':    ['shirt'],
      'Jeans':     ['jeans', 'denim'],
      'Kurtis':    ['kurti', 'kurtis', 'kurta'],
      'Sarees':    ['saree', 'sari'],
      'Dresses':   ['dress', 'gown', 'frock'],
      'Jackets':   ['jacket', 'hoodie', 'sweatshirt'],
      'Sneakers':  ['sneaker', 'shoe', 'footwear'],
      'Watches':   ['watch'],
      'Jewellery': ['jewel', 'necklace', 'earring', 'ring', 'bangle'],
    }

    const keywords      = KEYWORD_MAP[search] || [search.toLowerCase()]
    const keywordRegexes = keywords.map(kw => ({ title: { $regex: kw, $options: 'i' } }))

    filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand:       { $regex: search, $options: 'i' } },
      { tags:        { $in: [new RegExp(search, 'i')] } },
      { itemName:    { $in: ids } },
      { subItemType: { $in: ids } },
      { itemType:    { $in: ids } },
      { category:    { $in: ids } },
      ...keywordRegexes,
    ]
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller',      'name sellerDetails.businessName')
      .populate('category',    'name')
      .populate('itemType',    'name')
      .populate('subItemType', 'name')
      .populate('itemName',    'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Products fetched', products, page, limit, total)
}

// ─── GET SINGLE PRODUCT (public) ─────────────────────────────────────────────
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller',      'name sellerDetails.businessName sellerDetails.pickupAddress')
    .populate('category',    'name')
    .populate('itemType',    'name')
    .populate('subItemType', 'name')
    .populate('itemName',    'name')

  if (!product || product.status !== 'active')
    return errorResponse(res, 'Product not found', 404)

  return successResponse(res, 'Product fetched', { product })
}

// ─── CREATE PRODUCT (seller) ──────────────────────────────────────────────────
// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      category, itemType, subItemType, itemName,
      title, description, brand, tags,
      gstPercent,
      variants,
      additionalDetails,
      keepImages,
      // shipping fields from form
      courierPartner,
      codAvailable,
      freeShipping,
    } = req.body

    // ── NaN fix: always parse numbers explicitly ──────────────────────────
    const mrp                 = toNum(req.body.mrp)
    const sellingPrice        = toNum(req.body.sellingPrice)
    const weight              = toNum(req.body.weight, 0)         // jewellery net weight (grams)
    const shippingWeight      = toInt(req.body.shippingWeight, 500) // grams
    const packagingWeight     = toInt(req.body.packagingWeight, 60) // grams
    const length              = toNum(req.body.length, 0)
    const width               = toNum(req.body.width, 0)
    const height              = toNum(req.body.height, 0)
    const extraShippingCharge = toNum(req.body.extraShippingCharge, 0)

    // ── Validate required numbers ─────────────────────────────────────────
    if (!mrp || mrp <= 0)
      return errorResponse(res, 'MRP must be a valid number greater than 0', 400)
    if (!sellingPrice || sellingPrice <= 0)
      return errorResponse(res, 'Selling price must be a valid number greater than 0', 400)
    if (sellingPrice > mrp)
      return errorResponse(res, 'Selling price cannot be greater than MRP', 400)

    // ── Validate required strings ─────────────────────────────────────────
    if (!title?.trim())       return errorResponse(res, 'Title is required', 400)
    if (!description?.trim()) return errorResponse(res, 'Description is required', 400)
    if (!category)            return errorResponse(res, 'Category is required', 400)
    if (!itemType)            return errorResponse(res, 'Item type is required', 400)
    if (!subItemType)         return errorResponse(res, 'Sub item type is required', 400)
    if (!itemName)            return errorResponse(res, 'Item name is required', 400)

    // ── Variants ──────────────────────────────────────────────────────────
    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants
    if (!parsedVariants || parsedVariants.length === 0)
      return errorResponse(res, 'Add at least 1 variant', 400)

    // ── Images — upload to Cloudinary ─────────────────────────────────────
    if (!req.files || req.files.length === 0)
      return errorResponse(res, 'At least 1 product image is required', 400)

    const imageUrls = []
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'voguecart/products',
      })
      imageUrls.push(result.secure_url)
    }

    // ── Tags ──────────────────────────────────────────────────────────────
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || [])

    // ── Additional Details ────────────────────────────────────────────────
    const parsedAdditional = typeof additionalDetails === 'string'
      ? JSON.parse(additionalDetails)
      : (additionalDetails || {})

    // ── Volumetric weight (L×B×H ÷ 5000 cm³, convert to grams) ──────────
    const volumetricWeightG = length && width && height
      ? Math.round((length * width * height) / 5)
      : 0
    const chargeableWeight = Math.max(shippingWeight, volumetricWeightG)

    // ── Create ────────────────────────────────────────────────────────────
    const product = await Product.create({
      seller:      req.user._id,
      category,    itemType, subItemType, itemName,
      title:       title.trim(),
      description: description.trim(),
      brand:       brand || '',
      tags:        parsedTags,

      mrp,
      sellingPrice,
      gstPercent:  toNum(gstPercent, 5),
      weight,

      // shipping
      shippingWeight:      chargeableWeight || shippingWeight,
      packagingWeight,
      length, width, height,
      extraShippingCharge,
      codAvailable:        toBool(codAvailable, true),
      freeShipping:        toBool(freeShipping, false),
      courierPartner:      courierPartner || 'auto',

      images:            imageUrls,
      variants:          parsedVariants,
      additionalDetails: parsedAdditional,
      status:            'pending',
    })

    return successResponse(res, 'Product submitted for approval', { product }, 201)
  } catch (err) {
    console.error('[createProduct]', err)
    return errorResponse(res, err.message || 'Failed to create product', 500)
  }
}

// ─── UPDATE PRODUCT (seller) ──────────────────────────────────────────────────
// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
    if (!product) return errorResponse(res, 'Product not found', 404)

    const {
      category, itemType, subItemType, itemName,
      title, description, brand, tags,
      variants, additionalDetails, keepImages,
      courierPartner, codAvailable, freeShipping,
    } = req.body

    // ── NaN fix: parse numbers ────────────────────────────────────────────
    const mrp                 = req.body.mrp               !== undefined ? toNum(req.body.mrp)               : product.mrp
    const sellingPrice        = req.body.sellingPrice       !== undefined ? toNum(req.body.sellingPrice)       : product.sellingPrice
    const weight              = req.body.weight             !== undefined ? toNum(req.body.weight, 0)          : product.weight
    const shippingWeight      = req.body.shippingWeight     !== undefined ? toInt(req.body.shippingWeight, 500): product.shippingWeight
    const packagingWeight     = req.body.packagingWeight    !== undefined ? toInt(req.body.packagingWeight, 60) : product.packagingWeight
    const length              = req.body.length             !== undefined ? toNum(req.body.length, 0)          : product.length
    const width               = req.body.width              !== undefined ? toNum(req.body.width, 0)           : product.width
    const height              = req.body.height             !== undefined ? toNum(req.body.height, 0)          : product.height
    const extraShippingCharge = req.body.extraShippingCharge!== undefined ? toNum(req.body.extraShippingCharge, 0): product.extraShippingCharge

    if (isNaN(mrp) || mrp <= 0)
      return errorResponse(res, 'MRP must be a valid number greater than 0', 400)
    if (isNaN(sellingPrice) || sellingPrice <= 0)
      return errorResponse(res, 'Selling price must be a valid number greater than 0', 400)
    if (sellingPrice > mrp)
      return errorResponse(res, 'Selling price cannot be greater than MRP', 400)

    // ── Images ────────────────────────────────────────────────────────────
    let imageUrls = keepImages ? JSON.parse(keepImages) : [...product.images]

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'voguecart/products',
        })
        imageUrls.push(result.secure_url)
      }
    }

    if (imageUrls.length === 0)
      return errorResponse(res, 'At least 1 product image is required', 400)

    // ── Volumetric weight ─────────────────────────────────────────────────
    const volumetricWeightG = length && width && height
      ? Math.round((length * width * height) / 5)
      : 0
    const chargeableWeight = Math.max(shippingWeight, volumetricWeightG)

    // ── Apply updates ─────────────────────────────────────────────────────
    if (category)    product.category    = category
    if (itemType)    product.itemType    = itemType
    if (subItemType) product.subItemType = subItemType
    if (itemName)    product.itemName    = itemName
    if (title)       product.title       = title.trim()
    if (description) product.description = description.trim()
    if (brand !== undefined) product.brand = brand

    product.mrp                 = mrp
    product.sellingPrice        = sellingPrice
    product.gstPercent          = toNum(req.body.gstPercent, product.gstPercent)
    product.weight              = weight
    product.shippingWeight      = chargeableWeight || shippingWeight
    product.packagingWeight     = packagingWeight
    product.length              = length
    product.width               = width
    product.height              = height
    product.extraShippingCharge = extraShippingCharge
    product.codAvailable        = codAvailable !== undefined ? toBool(codAvailable)        : product.codAvailable
    product.freeShipping        = freeShipping !== undefined ? toBool(freeShipping, false) : product.freeShipping
    product.courierPartner      = courierPartner || product.courierPartner

    if (variants) {
      product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants
    }
    if (tags) {
      product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags
    }
    if (additionalDetails) {
      product.additionalDetails = typeof additionalDetails === 'string'
        ? JSON.parse(additionalDetails)
        : additionalDetails
    }

    product.images = imageUrls
    product.status = 'pending'  // re-submit for approval after edit

    await product.save()
    return successResponse(res, 'Product updated. Awaiting admin approval.', { product })
  } catch (err) {
    console.error('[updateProduct]', err)
    return errorResponse(res, err.message || 'Failed to update product', 500)
  }
}

// ─── GET SELLER'S OWN PRODUCTS ────────────────────────────────────────────────
// GET /api/products/my
export const getMyProducts = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 20
  const skip  = (page - 1) * limit

  const filter = { seller: req.user._id }
  if (req.query.status) filter.status = req.query.status

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category',    'name')
      .populate('itemType',    'name')
      .populate('subItemType', 'name')
      .populate('itemName',    'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Your products fetched', products, page, limit, total)
}

// ─── DELETE PRODUCT (seller soft-delete) ─────────────────────────────────────
// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
  if (!product) return errorResponse(res, 'Product not found', 404)

  product.status = 'deleted'
  await product.save()
  return successResponse(res, 'Product deleted')
}

// ─── ADMIN: GET ALL PRODUCTS ──────────────────────────────────────────────────
export const adminGetProducts = async (req, res) => {
  const page   = parseInt(req.query.page)  || 1
  const limit  = parseInt(req.query.limit) || 20
  const status = req.query.status          || null
  const skip   = (page - 1) * limit

  const filter = {}
  if (status) filter.status = status

Product.find(filter)
  .populate('seller', 'name sellerDetails.businessName')
  return paginatedResponse(res, 'Products fetched', products, page, limit, total)
}

// ─── ADMIN: APPROVE / REJECT PRODUCT ─────────────────────────────────────────
// PUT /api/admin/products/:id/status
export const adminUpdateProductStatus = async (req, res) => {
  const { status, rejectionReason } = req.body
  if (!['active', 'rejected'].includes(status))
    return errorResponse(res, 'Status must be "active" or "rejected"', 400)

  const product = await Product.findById(req.params.id)
  if (!product) return errorResponse(res, 'Product not found', 404)

  product.status = status
  if (status === 'active')   product.approvedAt = new Date()
  if (status === 'rejected') product.rejectionReason = rejectionReason || 'Did not meet guidelines'

  await product.save()
  return successResponse(res, `Product ${status}`, { product })
}

// ─── DEBUG (remove in production) ────────────────────────────────────────────
export const debugProducts = async (req, res) => {
  const populated = await Product.find({ status: 'active' })
    .populate('itemName', 'name')
    .populate('subItemType', 'name')
    .select('title itemName subItemType')

  return res.json(populated.map(p => ({
    title:       p.title,
    itemName:    p.itemName?.name    || 'MISSING',
    subItemType: p.subItemType?.name || 'MISSING',
  })))
}