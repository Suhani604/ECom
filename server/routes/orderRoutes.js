import express from 'express'
import {
  createOrder, createRazorpayOrder, verifyPayment,
  getMyOrders, getOrderById, cancelOrder, requestReturn,
  // ✅ Add these imports
  getAddresses, addAddress, updateAddress, deleteAddress,
} from '../controllers/orderController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

// ✅ Add address routes BEFORE /:id routes (order matters!)
router.get('/addresses',          authenticate, authorise('buyer'), getAddresses)
router.post('/addresses',         authenticate, authorise('buyer'), addAddress)
router.put('/addresses/:id',      authenticate, authorise('buyer'), updateAddress)
router.delete('/addresses/:id',   authenticate, authorise('buyer'), deleteAddress)

router.post('/',               authenticate, authorise('buyer'), createOrder)
router.get('/my',              authenticate, authorise('buyer'), getMyOrders)
router.post('/verify-payment', authenticate, authorise('buyer'), verifyPayment)
router.get('/:id',             authenticate, authorise('buyer'), getOrderById)
router.put('/:id/cancel',      authenticate, authorise('buyer'), cancelOrder)
router.put('/:id/return',      authenticate, authorise('buyer'), requestReturn)
router.post('/:id/razorpay',   authenticate, authorise('buyer'), createRazorpayOrder)

export default router