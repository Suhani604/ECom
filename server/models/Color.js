import mongoose from 'mongoose'

const colorSchema = new mongoose.Schema({
  colorName:   { type: String, required: true, trim: true },  // 'Black', 'Black Dial', '22K Gold'
  categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  itemTypeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  sortOrder:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

// Compound index so queries by categoryId + itemTypeId are fast
colorSchema.index({ categoryId: 1, itemTypeId: 1 })

const Color = mongoose.model('Color', colorSchema)
export default Color