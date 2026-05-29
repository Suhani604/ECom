import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, required: true, unique: true },
  parent:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image:     { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema)
export default Category

