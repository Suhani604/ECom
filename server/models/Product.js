import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size:  { type: String, required: true },
  color: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  sku:   { type: String, default: '' },
})

const productSchema = new mongoose.Schema({
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  brand:        { type: String, default: '' },
  tags:         [{ type: String }],
  category: { type: String, enum: ['men','women','kids','watches','shoes','jewellery','accessories'], required: true },
  subCategory:  { type: String, required: true },
  mrp:          { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  gstPercent:   { type: Number, default: 5 },
  images:       [{ type: String }],
  variants:     [variantSchema],
  weight:       { type: Number, default: 0.5 },
  status: {
    type: String,
    enum: ['pending','active','rejected','out_of_stock','deleted'],
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