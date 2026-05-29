// server/models/Product.js
import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size:  { type: String, required: true },
  color: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  sku:   { type: String, default: '' },
})

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  brand:       { type: String, default: '' },
  tags:        [{ type: String }],

  // ── 4-level category
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  itemType:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subItemType: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  itemName:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // ── Pricing
  mrp:          { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  gstPercent:   { type: Number, default: 5 },

  images:   [{ type: String }],
  variants: [variantSchema],

  // ── Shipping fields (NEW) ─────────────────────────────────────
  shippingWeight:      { type: Number, default: 500 },   // grams — actual item weight
  packagingWeight:     { type: Number, default: 60 },    // grams — box/packaging weight
  length:              { type: Number, default: 0 },     // cm — for volumetric weight
  width:               { type: Number, default: 0 },     // cm
  height:              { type: Number, default: 0 },     // cm
  extraShippingCharge: { type: Number, default: 0 },     // ₹ flat extra charge
  codAvailable:        { type: Boolean, default: true },
  freeShipping:        { type: Boolean, default: false },
  courierPartner:      { type: String, default: 'auto' },// 'auto' | 'delhivery' | 'bluedart' etc.

  // ── kept for backward compat (jewellery net weight in grams)
  weight: { type: Number, default: 0 },
  // ─────────────────────────────────────────────────────────────

  additionalDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

  status: {
    type:    String,
    enum:    ['pending', 'active', 'rejected', 'out_of_stock', 'deleted'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  approvedAt:      { type: Date },
  totalSold:       { type: Number, default: 0 },
  averageRating:   { type: Number, default: 0 },
  reviewCount:     { type: Number, default: 0 },
}, { timestamps: true })

productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' })

const Product = mongoose.model('Product', productSchema)
export default Product