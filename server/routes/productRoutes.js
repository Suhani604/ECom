import express from 'express'
import Product from '../models/Product.js'
// ✅ CORRECT — one import line
import { getProducts, getProductById, debugProducts } from '../controllers/productController.js'

const router = express.Router()

router.get('/',    getProducts)
router.get('/:id', getProductById)


router.get('/', async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1
    const limit    = parseInt(req.query.limit) || 12
    const category = req.query.category        || null
    const search   = req.query.search          || null
    const skip     = (page - 1) * limit

    const filter = { status: 'active' }
    if (category) filter.category = category
    if (search)   filter.$text    = { $search: search }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name sellerDetails.businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name sellerDetails.businessName')
    if (!product || product.status !== 'active')
      return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router