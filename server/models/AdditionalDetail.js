import mongoose from 'mongoose'

// Each field config inside the fields array
const fieldSchema = new mongoose.Schema({
  name:      { type: String, required: true },   // 'materialComposition'
  label:     { type: String, required: true },   // 'Material Composition'
  type:      { type: String, enum: ['select', 'text'], default: 'select' },
  options:   { type: [String], default: [] },    // ['Cotton', 'Polyester', ...]
  sortOrder: { type: Number, default: 0 },
}, { _id: false })

const additionalDetailSchema = new mongoose.Schema({
  categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  itemTypeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  fields:      { type: [fieldSchema], default: [] },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

// One config doc per category + itemType combination
additionalDetailSchema.index({ categoryId: 1, itemTypeId: 1 }, { unique: true })

const AdditionalDetail = mongoose.model('AdditionalDetail', additionalDetailSchema)
export default AdditionalDetail