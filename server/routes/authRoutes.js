import express from 'express'
import {
  buyerSignup, sellerSignup, verifyOTP, resendOTP,
  login, requestLoginOTP, verifyLoginOTP,
  forgotPassword, resetPassword, refreshToken, getMe,
} from '../controllers/authController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/signup/buyer',       buyerSignup)
router.post('/signup/seller',      sellerSignup)
router.post('/verify-otp',         verifyOTP)
router.post('/resend-otp',         resendOTP)
router.post('/login',              login)
router.post('/login-otp/request',  requestLoginOTP)
router.post('/login-otp/verify',   verifyLoginOTP)
router.post('/forgot-password',    forgotPassword)
router.post('/reset-password',     resetPassword)
router.post('/refresh-token',      refreshToken)
router.get('/me', authenticate,    getMe)

export default router