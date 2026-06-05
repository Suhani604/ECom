import mongoose from 'mongoose'

const deliveryBoySchema = new mongoose.Schema({
  name:          { type: String, required: true },
  phone:         { type: String, required: true, unique: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String, required: true },
  photo:         { type: String, default: '' },
  vehicleNumber: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },

  // ── Location ──────────────────────────────────────────────
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  serviceArea: {
    pincode: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
  },

  // ── Status ────────────────────────────────────────────────
  isOnline:    { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isApproved:  { type: Boolean, default: false },

  // ── Earnings ──────────────────────────────────────────────
  totalEarnings:    { type: Number, default: 0 },
  pendingWithdrawal:{ type: Number, default: 0 },

  // ── Rating ────────────────────────────────────────────────
  rating:      { type: Number, default: 5 },
  totalOrders: { type: Number, default: 0 },

}, { timestamps: true })

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryBoySchema)
export default DeliveryPartner