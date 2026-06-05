import express from 'express'
import {
  registerDeliveryPartner,
  loginDeliveryPartner,
  toggleOnlineStatus,
  getMyDeliveries,
  acceptOrder,
  markPickedUp,
  markDelivered,
  updateLocation,
  getProfile,
  getEarnings,
  resendOTP,
} from '../controllers/deliveryController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', registerDeliveryPartner)
router.post('/login',    loginDeliveryPartner)

// ── Protected routes (delivery partner only) ──────────────────────────────────
router.get('/profile',              authenticate, authorise('delivery'), getProfile)
router.get('/earnings',             authenticate, authorise('delivery'), getEarnings)
router.get('/my-deliveries',        authenticate, authorise('delivery'), getMyDeliveries)
router.put('/toggle-online',        authenticate, authorise('delivery'), toggleOnlineStatus)
router.put('/location',             authenticate, authorise('delivery'), updateLocation)
router.put('/:id/accept',           authenticate, authorise('delivery'), acceptOrder)
router.put('/:id/picked-up',        authenticate, authorise('delivery'), markPickedUp)
router.put('/:id/delivered',        authenticate, authorise('delivery'), markDelivered)
router.put('/:id/resend-otp', authenticate, authorise('delivery'), resendOTP)
export default router