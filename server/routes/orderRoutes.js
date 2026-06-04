import express from 'express'
import {
  createOrder, createRazorpayOrder, verifyPayment,
  getMyOrders, getOrderById, cancelOrder, requestReturn,
  getAddresses, addAddress, updateAddress, deleteAddress,
  updateOrderStatus, checkPincode, calculateShippingRoute,  // ← ADD checkPincode here
} from '../controllers/orderController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ── Public route (no auth needed) ────────────────────────────────────────────
router.get('/check-pincode', checkPincode)   // ← ADD THIS LINE

// ── Address routes (BEFORE /:id routes) ──────────────────────────────────────
router.get('/addresses',        authenticate, authorise('buyer'), getAddresses)
router.post('/addresses',       authenticate, authorise('buyer'), addAddress)
router.put('/addresses/:id',    authenticate, authorise('buyer'), updateAddress)
router.delete('/addresses/:id', authenticate, authorise('buyer'), deleteAddress)

// ── Order routes ──────────────────────────────────────────────────────────────
router.post('/',               authenticate, authorise('buyer'),          createOrder)
router.get('/my',              authenticate, authorise('buyer'),          getMyOrders)
router.post('/verify-payment', authenticate, authorise('buyer'),          verifyPayment)
router.get('/:id',             authenticate, authorise('buyer'),          getOrderById)
router.put('/:id/cancel',      authenticate, authorise('buyer'),          cancelOrder)
router.put('/:id/return',      authenticate, authorise('buyer'),          requestReturn)
router.post('/:id/razorpay',   authenticate, authorise('buyer'),          createRazorpayOrder)
router.put('/:id/status',      authenticate, authorise('admin', 'seller'), updateOrderStatus)
router.post('/calculate-shipping', calculateShippingRoute)
export default router