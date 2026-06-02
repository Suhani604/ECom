// server/models/ShippingConfig.js
import mongoose from 'mongoose'

// ── Zone Rate ─────────────────────────────────────────────────
const zoneRateSchema = new mongoose.Schema({
  upTo500g:    { type: Number, required: true },  // base rate
  per500gExtra:{ type: Number, required: true },  // per extra 500g slab
  deliveryDays:{ type: Number, required: true },
}, { _id: false })

// ── Courier ───────────────────────────────────────────────────
const courierSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true }, // 'delhivery' | 'bluedart' | 'ekart'
  label:        { type: String, required: true },               // display name
  isActive:     { type: Boolean, default: true },
  zones: {
    sameCity:  zoneRateSchema,
    metro:     zoneRateSchema,
    nonMetro:  zoneRateSchema,
    remote:    zoneRateSchema,
  },
  codChargeFlat:    { type: Number, default: 30 },   // ₹ flat COD fee
  codChargePercent: { type: Number, default: 1.5 },  // % of order value (whichever higher)
}, { timestamps: true })

// ── Platform Charges (single doc, key: 'default') ─────────────
const platformChargesSchema = new mongoose.Schema({
  key:                  { type: String, default: 'default', unique: true },
  commissionPercent:    { type: Number, default: 9 },    // % platform commission
  gstOnShippingPercent: { type: Number, default: 18 },   // GST on shipping fee
  paymentGatewayPercent:{ type: Number, default: 2 },    // Razorpay fee %
  codHandlingFlat:      { type: Number, default: 20 },   // extra COD handling ₹
  tdsPercent:           { type: Number, default: 1 },    // TDS on seller payout
  holdPeriodDays:       { type: Number, default: 10 },   // payout hold after delivery
}, { timestamps: true })

export const Courier         = mongoose.model('Courier',         courierSchema)
export const PlatformCharges = mongoose.model('PlatformCharges', platformChargesSchema)