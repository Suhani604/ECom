import express from 'express'
import {
  applyCoupon,
  removeCoupon,
  getMyReferralCode,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  createDefaultCoupons,
} from '../controllers/couponController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ── Buyer Routes ──────────────────────────────────────────────────────────────
router.post('/apply',      authenticate, applyCoupon)
router.post('/remove',     authenticate, removeCoupon)
router.get('/my-referral', authenticate, getMyReferralCode)

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.post('/',              authenticate, authorise('admin'), createCoupon)
router.get('/',               authenticate, authorise('admin'), getAllCoupons)
router.put('/:id',            authenticate, authorise('admin'), updateCoupon)
router.delete('/:id',         authenticate, authorise('admin'), deleteCoupon)
router.post('/seed-defaults', authenticate, authorise('admin'), createDefaultCoupons)

export default router