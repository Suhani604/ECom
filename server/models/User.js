import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  name:      String,
  phone:     String,
  line1:     String,
  line2:     { type: String, default: '' },
  city:      String,
  state:     String,
  pincode:   String,
  isDefault: { type: Boolean, default: false },
})

const sellerDetailsSchema = new mongoose.Schema({
  businessName:    { type: String, default: '' },
  businessType:    { type: String, default: 'individual' },
  gstin:           { type: String, default: '' },
  pan:             { type: String, default: '' },
  gstCertUrl:      { type: String, default: '' },
  bankName:        { type: String, default: '' },
  accountHolder:   { type: String, default: '' },
  accountNumber:   { type: String, default: '' },
  ifscCode:        { type: String, default: '' },
  cancelChequeUrl: { type: String, default: '' },
  pickupAddress: {
    line1:        { type: String, default: '' },
    line2:        { type: String, default: '' },
    city:         { type: String, default: '' },
    state:        { type: String, default: '' },
    pincode:      { type: String, default: '' },
    contactName:  { type: String, default: '' },
    contactPhone: { type: String, default: '' },
  },
  onboardingStep:     { type: Number, default: 1 },
  onboardingComplete: { type: Boolean, default: false },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  approvedAt:      { type: Date },
})

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, unique: true, trim: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  profilePhoto: { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: false },
  addresses:    [addressSchema],
  sellerDetails:{ type: sellerDetailsSchema, default: () => ({}) },
  otp:          { type: String },
  otpExpiry:    { type: Date },
}, { timestamps: true })

// ── Hash password before save ──────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// ── Strip sensitive fields before sending to frontend ─────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.otp
  delete obj.otpExpiry
  return obj
}

const User = mongoose.model('User', userSchema)
export default User