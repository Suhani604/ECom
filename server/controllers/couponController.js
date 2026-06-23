import Coupon from '../models/Coupon.js'
import Order  from '../models/Order.js'
import User   from '../models/User.js'

// ── Helper: Generate unique referral code ─────────────────────────────────────
const generateReferralCode = (name) => {
  const base = name.toUpperCase().replace(/\s/g, '').slice(0, 4)
  const rand  = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${base}${rand}`
}

// ── APPLY COUPON (buyer checkout pe) ─────────────────────────────────────────
export const applyCoupon = async (req, res) => {
  const { code, cartTotal } = req.body
  const userId = req.user._id

  if (!code || !cartTotal)
    return res.status(400).json({ success: false, message: 'Code and cartTotal required' })

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
  if (!coupon)
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon' })

  // ── Expiry check ──────────────────────────────────────────────────────────
  if (coupon.expiryDate && new Date() > coupon.expiryDate)
    return res.status(400).json({ success: false, message: 'Coupon has expired' })

  // ── Start date check ──────────────────────────────────────────────────────
  if (coupon.startDate && new Date() < coupon.startDate)
    return res.status(400).json({ success: false, message: 'Coupon not yet active' })

  // ── Max uses check ────────────────────────────────────────────────────────
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })

  // ── Per user limit check ──────────────────────────────────────────────────
  const userUseCount = coupon.usedBy.filter(id => id.toString() === userId.toString()).length
  if (userUseCount >= coupon.maxUsesPerUser)
    return res.status(400).json({ success: false, message: 'You have already used this coupon' })

  // ── Min order check ───────────────────────────────────────────────────────
  if (cartTotal < coupon.minOrderAmount)
    return res.status(400).json({
      success: false,
      message: `Minimum order amount is ₹${coupon.minOrderAmount}`
    })

  // ── First order check ─────────────────────────────────────────────────────
  if (coupon.couponType === 'firstOrder') {
    const prevOrders = await Order.countDocuments({ buyer: userId, status: { $ne: 'cancelled' } })
    if (prevOrders > 0)
      return res.status(400).json({ success: false, message: 'This coupon is only for first order' })
  }

  // ── Calculate discount ────────────────────────────────────────────────────
  let discount = 0
  if (coupon.discountType === 'percent') {
    discount = Math.floor((cartTotal * coupon.discountValue) / 100)
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else {
    discount = coupon.discountValue
  }
  discount = Math.min(discount, cartTotal) // discount can't exceed cart total

  const finalAmount = cartTotal - discount

  return res.json({
    success: true,
    message: `Coupon applied! You save ₹${discount}`,
    couponCode:  coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
    finalAmount,
    description: coupon.description,
  })
}

// ── REMOVE COUPON ─────────────────────────────────────────────────────────────
export const removeCoupon = async (req, res) => {
  return res.json({ success: true, message: 'Coupon removed', discount: 0 })
}

// ── GET MY REFERRAL CODE ──────────────────────────────────────────────────────
export const getMyReferralCode = async (req, res) => {
  let user = await User.findById(req.user._id)
  if (!user.referralCode) {
    user.referralCode = generateReferralCode(user.name)
    await user.save()
  }
  return res.json({
    success: true,
    referralCode: user.referralCode,
    referralCount: user.referralCount || 0,
    walletBalance: user.walletBalance || 0,
    referralLink: `${process.env.FRONTEND_URL}/signup/buyer?ref=${user.referralCode}`,
  })
}

// ── ADMIN: Create Coupon ──────────────────────────────────────────────────────
export const createCoupon = async (req, res) => {
  const {
    code, description, discountType, discountValue,
    minOrderAmount, maxDiscount, maxUses, maxUsesPerUser,
    startDate, expiryDate, couponType
  } = req.body

  const exists = await Coupon.findOne({ code: code.toUpperCase() })
  if (exists) return res.status(400).json({ success: false, message: 'Coupon code already exists' })

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description, discountType, discountValue,
    minOrderAmount, maxDiscount, maxUses,
    maxUsesPerUser: maxUsesPerUser || 1,
    startDate, expiryDate, couponType,
  })

  return res.status(201).json({ success: true, message: 'Coupon created!', coupon })
}

// ── ADMIN: Get All Coupons ────────────────────────────────────────────────────
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  return res.json({ success: true, coupons })
}

// ── ADMIN: Update Coupon ──────────────────────────────────────────────────────
export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' })
  return res.json({ success: true, message: 'Coupon updated!', coupon })
}

// ── ADMIN: Delete Coupon ──────────────────────────────────────────────────────
export const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id)
  return res.json({ success: true, message: 'Coupon deleted' })
}

// ── ADMIN: Create Default Coupons (First Order + Referral) ───────────────────
export const createDefaultCoupons = async (req, res) => {
  const defaults = [
    {
      code: 'FIRST50',
      description: '50% off on your first order (max ₹200)',
      discountType: 'percent',
      discountValue: 50,
      maxDiscount: 200,
      minOrderAmount: 299,
      couponType: 'firstOrder',
      maxUsesPerUser: 1,
    },
    {
      code: 'WELCOME100',
      description: '₹100 off on first order above ₹499',
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 499,
      couponType: 'newUser',
      maxUsesPerUser: 1,
    },
    {
      code: 'REFER50',
      description: '₹50 off for referred users',
      discountType: 'flat',
      discountValue: 50,
      minOrderAmount: 199,
      couponType: 'referral',
      maxUsesPerUser: 1,
    },
  ]

  const results = []
  for (const d of defaults) {
    const exists = await Coupon.findOne({ code: d.code })
    if (!exists) {
      const c = await Coupon.create(d)
      results.push(c.code)
    }
  }

  return res.json({ success: true, message: 'Default coupons created', created: results })
}