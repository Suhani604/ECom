import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:   { type: String, default: '' },

  // ── Discount Type ──────────────────────────────────────────────────────────
  discountType:  { type: String, enum: ['percent', 'flat'], required: true },
  discountValue: { type: Number, required: true }, // 20 = 20% or ₹20

  // ── Limits ────────────────────────────────────────────────────────────────
  minOrderAmount:  { type: Number, default: 0 },       // minimum cart value
  maxDiscount:     { type: Number, default: null },     // max cap for percent discount
  maxUses:         { type: Number, default: null },     // total uses allowed
  maxUsesPerUser:  { type: Number, default: 1 },        // per user limit
  usedCount:       { type: Number, default: 0 },

  // ── Validity ──────────────────────────────────────────────────────────────
  startDate:  { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  isActive:   { type: Boolean, default: true },

  // ── Special Types ─────────────────────────────────────────────────────────
  couponType: {
    type: String,
    enum: ['general', 'firstOrder', 'referral', 'newUser'],
    default: 'general',
  },

  // ── Usage tracking ────────────────────────────────────────────────────────
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true })

const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon