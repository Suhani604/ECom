import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  title:     { type: String, trim: true },
  comment:   { type: String, trim: true },
  images:    [{ type: String }],
  isVisible: { type: Boolean, default: true },
}, { timestamps: true })

reviewSchema.index({ product: 1, buyer: 1, order: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)
export default Review