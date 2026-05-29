import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
 title: { type: String, default: '', trim: true },
  subtitle:    { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  link:        { type: String, default: '' },
  type:        { type: String, enum: ['hero', 'promo', 'category'], default: 'hero' },
  category:    { type: String, default: '' }, // men, women, kids, jewellery, ''
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true })

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner