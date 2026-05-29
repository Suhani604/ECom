import api from './axiosInstance.js'

// ─── Buyer signup ─────────────────────────────────────────────────────────────
export const buyerSignupAPI = (data) =>
  api.post('/auth/signup/buyer', data)

// ─── Seller signup ────────────────────────────────────────────────────────────
export const sellerSignupAPI = (data) =>
  api.post('/auth/signup/seller', data)

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOTPAPI = (userId, otp) =>
  api.post('/auth/verify-otp', { userId, otp })

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export const resendOTPAPI = (userId) =>
  api.post('/auth/resend-otp', { userId })

// ─── Login with password ──────────────────────────────────────────────────────
export const loginAPI = (emailOrPhone, password) =>
  api.post('/auth/login', { emailOrPhone, password })

// ─── Login with OTP ───────────────────────────────────────────────────────────
export const requestLoginOTPAPI = (emailOrPhone) =>
  api.post('/auth/login-otp/request', { emailOrPhone })

export const verifyLoginOTPAPI = (userId, otp) =>
  api.post('/auth/login-otp/verify', { userId, otp })

// ─── Forgot / reset password ──────────────────────────────────────────────────
export const forgotPasswordAPI = (email) =>
  api.post('/auth/forgot-password', { email })

export const resetPasswordAPI = (userId, otp, newPassword) =>
  api.post('/auth/reset-password', { userId, otp, newPassword })

// ─── Refresh token ────────────────────────────────────────────────────────────
export const refreshTokenAPI = (refreshToken) =>
  api.post('/auth/refresh-token', { refreshToken })

// ─── Get current user ─────────────────────────────────────────────────────────
export const getMeAPI = () =>
  api.get('/auth/me')