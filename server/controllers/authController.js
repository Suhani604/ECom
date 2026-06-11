import bcrypt  from 'bcryptjs'
import User    from '../models/User.js'
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, generateOTP, otpExpiry
} from '../utils/jwtHelper.js'
import { sendOTPEmail } from '../utils/emailHelper.js'
import { sendOTPSMS } from '../utils/smsHelper.js'

// ── helper ────────────────────────────────────────────────────────────────────
const ok  = (res, msg, data = {}, code = 200) =>
  res.status(code).json({ success: true,  message: msg, ...data })
const err = (res, msg, code = 400) =>
  res.status(code).json({ success: false, message: msg })

// ── DEV OTP helper ────────────────────────────────────────────────────────────
// In development: OTP is always 123456 (no email needed)
// In production:  real random OTP sent via email
const isDev = process.env.NODE_ENV !== 'production'
const getOTP = () => isDev ? '123456' : generateOTP()
const tryEmail = (email, name, otp, type, phone = null) => {
  // ── Always log OTP in terminal ──────────────────────────────────────────────
  console.log(`\n🔑 OTP for ${email}: ${otp}\n`)
  // ── FIX: fire-and-forget — don't await so request doesn't hang ─────────────
  // Render free tier mein SMTP timeout hota hai — non-blocking rakho
  sendOTPEmail(email, name, otp, type).catch(e => console.error('❌ Email failed FULL ERROR:', e))
  if (phone) {
    sendOTPSMS(phone, otp).catch(e => console.error('SMS failed:', e.message))
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUYER SIGNUP
// ═══════════════════════════════════════════════════════════════════════════════
export const buyerSignup = async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!name || !email || !phone || !password)
    return err(res, 'All fields are required')
  if (password.length < 6)
    return err(res, 'Password must be at least 6 characters')

  const exists = await User.findOne({ $or: [{ email }, { phone }] })
  if (exists) {
    if (exists.email === email) return err(res, 'Email already registered', 409)
    return err(res, 'Phone number already registered', 409)
  }

  const otp    = getOTP()
  const expiry = otpExpiry()

  const user = await User.create({
    name, email, phone, password,
    role: 'buyer', otp, otpExpiry: expiry, isVerified: false,
  })

  tryEmail(email, name, otp, 'verify', phone)

  return ok(res, isDev
    ? 'Account created! Use OTP: 123456'
    : 'Account created! Check email for OTP',
  { userId: user._id, email: user.email }, 201)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER SIGNUP
// ═══════════════════════════════════════════════════════════════════════════════
export const sellerSignup = async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!name || !email || !phone || !password)
    return err(res, 'All fields are required')
  if (password.length < 6)
    return err(res, 'Password must be at least 6 characters')

  const exists = await User.findOne({ $or: [{ email }, { phone }] })
  if (exists) {
    if (exists.email === email) return err(res, 'Email already registered', 409)
    return err(res, 'Phone number already registered', 409)
  }

  const otp    = getOTP()
  const expiry = otpExpiry()

  const user = await User.create({
    name, email, phone, password,
    role: 'seller', otp, otpExpiry: expiry, isVerified: false,
    sellerDetails: { onboardingStep: 1, approvalStatus: 'pending' },
  })

  tryEmail(email, name, otp, 'verify', phone)

  return ok(res, isDev
    ? 'Seller account created! Use OTP: 123456'
    : 'Seller account created! Check email for OTP',
  { userId: user._id, email: user.email }, 201)
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFY OTP
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body
  if (!userId || !otp) return err(res, 'userId and OTP required')

  const user = await User.findById(userId)
  if (!user)           return err(res, 'User not found', 404)
  if (user.isVerified) return err(res, 'Already verified')

  if (!user.otp || !user.otpExpiry)
    return err(res, 'No OTP found. Request a new one')
  if (new Date() > user.otpExpiry)
    return err(res, 'OTP expired. Request a new one')
  if (user.otp !== otp.toString())
    return err(res, 'Invalid OTP')

  user.isVerified = true
  user.otp        = undefined
  user.otpExpiry  = undefined
  await user.save()

  const token        = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  const safeUser = user.toObject()
  delete safeUser.password
  delete safeUser.otp
  delete safeUser.otpExpiry

  return ok(res, 'Account verified!', { token, refreshToken, user: safeUser })
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEND OTP
// ═══════════════════════════════════════════════════════════════════════════════
export const resendOTP = async (req, res) => {
  const { userId } = req.body
  if (!userId) return err(res, 'userId required')

  const user = await User.findById(userId)
  if (!user)           return err(res, 'User not found', 404)
  if (user.isVerified) return err(res, 'Already verified')

  const otp    = getOTP()
  const expiry = otpExpiry()
  user.otp       = otp
  user.otpExpiry = expiry
  await user.save()

  tryEmail(user.email, user.name, otp, 'verify')

  return ok(res, isDev ? 'OTP is: 123456' : `OTP resent to ${user.email}`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
export const login = async (req, res) => {
  const { emailOrPhone, password } = req.body
  if (!emailOrPhone || !password)
    return err(res, 'Email/phone and password required')

  const user = await User.findOne({
    $or: [
      { email: emailOrPhone.toLowerCase().trim() },
      { phone: emailOrPhone.trim() },
    ],
  })

  if (!user)          return err(res, 'No account found with this email/phone', 404)
  if (!user.isActive) return err(res, 'Account suspended', 403)

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return err(res, 'Incorrect password')

  if (!user.isVerified) {
    const otp    = getOTP()
    const expiry = otpExpiry()
    user.otp       = otp
    user.otpExpiry = expiry
    await user.save()
    tryEmail(user.email, user.name, otp, 'verify')
    return res.status(403).json({
      success: false,
      message: isDev
        ? 'Account not verified. Use OTP: 123456'
        : 'Account not verified. OTP sent to your email.',
      userId: user._id,
    })
  }

  const token        = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  const safeUser = user.toObject()
  delete safeUser.password
  delete safeUser.otp
  delete safeUser.otpExpiry

  return ok(res, 'Login successful', { token, refreshToken, user: safeUser })
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGIN OTP
// ═══════════════════════════════════════════════════════════════════════════════
export const requestLoginOTP = async (req, res) => {
  const { emailOrPhone } = req.body
  if (!emailOrPhone) return err(res, 'Email or phone required')

  const user = await User.findOne({
    $or: [
      { email: emailOrPhone.toLowerCase().trim() },
      { phone: emailOrPhone.trim() },
    ],
  })
  if (!user)          return err(res, 'No account found', 404)
  if (!user.isActive) return err(res, 'Account suspended', 403)

  const otp    = getOTP()
  const expiry = otpExpiry()
  user.otp       = otp
  user.otpExpiry = expiry
  await user.save()

  tryEmail(user.email, user.name, otp, 'login')

  return ok(res, isDev ? 'Use OTP: 123456' : `OTP sent to ${user.email}`, { userId: user._id })
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFY LOGIN OTP
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body
  if (!userId || !otp) return err(res, 'userId and OTP required')

  const user = await User.findById(userId)
  if (!user)          return err(res, 'User not found', 404)
  if (!user.isActive) return err(res, 'Account suspended', 403)

  if (!user.otp || !user.otpExpiry)
    return err(res, 'No OTP found. Request again')
  if (new Date() > user.otpExpiry)
    return err(res, 'OTP expired. Request again')
  if (user.otp !== otp.toString())
    return err(res, 'Invalid OTP')

  if (!user.isVerified) user.isVerified = true
  user.otp       = undefined
  user.otpExpiry = undefined
  await user.save()

  const token        = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  const safeUser = user.toObject()
  delete safeUser.password

  return ok(res, 'Login successful', { token, refreshToken, user: safeUser })
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) return err(res, 'Email required')

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return ok(res, 'If that email exists, OTP has been sent')

  const otp    = getOTP()
  const expiry = otpExpiry()
  user.otp       = otp
  user.otpExpiry = expiry
  await user.save()

  tryEmail(user.email, user.name, otp, 'reset')

  return ok(res, isDev ? 'Use OTP: 123456' : 'OTP sent to your email', { userId: user._id })
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════
export const resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body
  if (!userId || !otp || !newPassword)
    return err(res, 'All fields required')
  if (newPassword.length < 6)
    return err(res, 'Password must be at least 6 characters')

  const user = await User.findById(userId)
  if (!user) return err(res, 'User not found', 404)

  if (!user.otp || !user.otpExpiry)
    return err(res, 'No OTP found. Request again')
  if (new Date() > user.otpExpiry)
    return err(res, 'OTP expired. Request again')
  if (user.otp !== otp.toString())
    return err(res, 'Invalid OTP')

  const hashed = await bcrypt.hash(newPassword, 12)
  user.password  = hashed
  user.otp       = undefined
  user.otpExpiry = undefined
  await user.save()

  return ok(res, 'Password reset successfully! Please login.')
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════════════════════
export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body
  if (!token) return err(res, 'Refresh token required')

  try {
    const decoded = verifyRefreshToken(token)
    const user    = await User.findById(decoded.id).select('-password -otp -otpExpiry')
    if (!user)          return err(res, 'User not found', 404)
    if (!user.isActive) return err(res, 'Account suspended', 403)

    const accessToken = generateAccessToken(user._id)
    const newRefresh  = generateRefreshToken(user._id)

    return ok(res, 'Token refreshed', { token: accessToken, refreshToken: newRefresh, user })
  } catch (_) {
    return err(res, 'Invalid refresh token', 401)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ME
// ═══════════════════════════════════════════════════════════════════════════════
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
  return ok(res, 'User fetched', { user })
}