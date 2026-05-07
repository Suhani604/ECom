import Product  from '../models/Product.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js'

// GET /api/products — public, buyers browse
export const getProducts = async (req, res) => {
  const page     = parseInt(req.query.page)  || 1
  const limit    = parseInt(req.query.limit) || 12
  const category = req.query.category        || null
  const search   = req.query.search          || null
  const skip     = (page - 1) * limit

  const filter = { status: 'active' }
  if (category) filter.category = category
  if (search)   filter.$or = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { brand:       { $regex: search, $options: 'i' } },
  ]

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name sellerDetails.businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ])

  return paginatedResponse(res, 'Products fetched', products, page, limit, total)
}

// GET /api/products/:id — public, single product
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name sellerDetails.businessName sellerDetails.pickupAddress')

  if (!product || product.status !== 'active')
    return errorResponse(res, 'Product not found', 404)

  return successResponse(res, 'Product fetched', { product })
}