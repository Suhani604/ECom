import express from 'express'
import {
  submitReview,
  editReview,
  getProductReviews,
  getMyReviews,
  checkOrderReviews,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  getSellerProductReviews,
} from '../controllers/reviewController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ── PUBLIC — no login needed ──────────────────────────────────────────────────
router.get('/product/:productId', getProductReviews)

// ── PROTECTED — all routes below require login ────────────────────────────────
router.use(authenticate)

router.post('/', submitReview)

// ⚠️  CRITICAL: specific named routes MUST come BEFORE param routes like /:reviewId
// Otherwise Express matches '/my-reviews' and '/seller/my-products' as a reviewId

// Buyer
router.get('/my-reviews',             getMyReviews)
router.get('/order/:orderId/check',   checkOrderReviews)

// Admin
router.get('/admin/all',                        getAllReviewsAdmin)
router.patch('/admin/:reviewId/visibility',     toggleReviewVisibility)

// Seller
router.get('/seller/my-products',               getSellerProductReviews)

// ⚠️  Param route LAST — must be after all named GET/PUT routes
router.put('/:reviewId', editReview)

export default router