import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId:    { type: mongoose.Schema.Types.ObjectId },   // ← ADD THIS LINE
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  image:        { type: String, default: '' },
  size:         { type: String, default: '' },
  color:        { type: String, default: '' },
  quantity:     { type: Number, required: true, min: 1 },
  mrp:          { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  gstPercent:   { type: Number, default: 5 },
})

const addressSnapshotSchema = new mongoose.Schema({
  name:    String,
  phone:   String,
  line1:   String,
  line2:   { type: String, default: '' },
  city:    String,
  state:   String,
  pincode: String,
})

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  deliveryAddress:   addressSnapshotSchema,
  paymentMethod:     { type: String, enum: ['razorpay','cod'], required: true },
  paymentStatus:     { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  subtotal:          { type: Number, required: true },
  shippingFee:       { type: Number, default: 0 },
  discount:          { type: Number, default: 0 },
  totalAmount:       { type: Number, required: true },
  couponCode:        { type: String, default: '' },
  status: {
    type: String,
    enum: ['placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','return_requested','returned'],
    default: 'placed',
  },
  statusHistory: [{
    status:    String,
    updatedAt: { type: Date, default: Date.now },
    note:      String,
  }],
  payoutStatus:      { type: String, enum: ['pending','processing','paid'], default: 'pending' },
  payoutReleasedAt:  { type: Date },
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
export default Order