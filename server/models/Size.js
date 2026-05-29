// models/Size.js  — updated to include subItemTypeId
import mongoose from 'mongoose'

const sizeSchema = new mongoose.Schema({
  sizeValue:    { type: String, required: true },
  categoryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  itemTypeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subItemTypeId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },  // Level 3 (optional for backward compat)
  itemNameId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  sortOrder:    { type: Number, default: 0 },
})

sizeSchema.index({ categoryId: 1, itemTypeId: 1, itemNameId: 1 })

const Size = mongoose.model('Size', sizeSchema)
export default Size