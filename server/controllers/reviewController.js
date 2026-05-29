import Review   from '../models/Review.js'
import Order    from '../models/Order.js'
import Product  from '../models/Product.js'
import mongoose from 'mongoose'

// ─── UPDATED: orderId is optional, no delivery restriction ───────────────────
export const submitReview = async (req, res) => {
  try {
    const { orderId, productId, rating, title, comment, images } = req.body
    const buyerId = req.user._id

    if (!productId) return res.status(400).json({ message: 'productId is required' })
    if (!rating)    return res.status(400).json({ message: 'rating is required' })

    // If orderId provided, validate it belongs to buyer (but NO delivery check)
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, buyer: buyerId })
      if (!order) return res.status(404).json({ message: 'Order not found' })
      const itemInOrder = order.items.find(i => i.product.toString() === productId)
      if (!itemInOrder) return res.status(400).json({ message: 'Product not found in this order' })
    }

    // Prevent duplicate: same buyer + same product (order optional)
    const dupQuery = { product: productId, buyer: buyerId }
    if (orderId) dupQuery.order = orderId
    const existing = await Review.findOne(dupQuery)
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' })

    const review = await Review.create({
      product:  productId,
      buyer:    buyerId,
      order:    orderId || null,   // ← null if no orderId
      rating,
      title:    title   || '',
      comment:  comment || '',
      images:   images  || [],
    })

    await updateProductRating(productId)
    const populated = await review.populate('buyer', 'name')
    res.status(201).json({ message: 'Review submitted successfully', review: populated })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already reviewed this product' })
    res.status(500).json({ message: err.message })
  }
}

// ─── All below are UNCHANGED ─────────────────────────────────────────────────

export const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, title, comment, images } = req.body
    const review = await Review.findOne({ _id: reviewId, buyer: req.user._id })
    if (!review) return res.status(404).json({ message: 'Review not found' })
    if (rating  !== undefined) review.rating  = rating
    if (title   !== undefined) review.title   = title
    if (comment !== undefined) review.comment = comment
    if (images  !== undefined) review.images  = images
    await review.save()
    await updateProductRating(review.product)
    const populated = await review.populate('buyer', 'name')
    res.json({ message: 'Review updated', review: populated })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit
    const objectId = new mongoose.Types.ObjectId(productId)
    const [reviews, total, breakdown] = await Promise.all([
      Review.find({ product: productId, isVisible: true })
        .populate('buyer', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Review.countDocuments({ product: productId, isVisible: true }),
      Review.aggregate([
        { $match: { product: objectId, isVisible: true } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ])
    res.json({ reviews, total, page, pages: Math.ceil(total / limit), breakdown })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ buyer: req.user._id })
      .populate('product', 'title images').sort({ createdAt: -1 })
    res.json({ reviews })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const checkOrderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ order: req.params.orderId, buyer: req.user._id }, 'product rating')
    res.json({ reviews })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

async function updateProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isVisible: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round((result[0]?.avg || 0) * 10) / 10,
    reviewCount:   result[0]?.count || 0,
  })
}

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('buyer',   'name email')
      .populate('product', 'title images seller')
      .sort({ createdAt: -1 })
    res.json({ reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { isVisible } = req.body
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isVisible },
      { new: true }
    )
    if (!review) return res.status(404).json({ message: 'Review not found' })
    await updateProductRating(review.product)
    res.json({ message: 'Visibility updated', review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getSellerProductReviews = async (req, res) => {
  try {
    const sellerId = req.user._id
    const products = await Product.find({ seller: sellerId }, '_id')
    const productIds = products.map((p) => p._id)
    const reviews = await Review.find({ product: { $in: productIds }, isVisible: true })
      .populate('buyer',   'name')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
    res.json({ reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}