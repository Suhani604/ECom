import Banner from '../models/Banner.js'
import { v2 as cloudinary } from 'cloudinary'
import { successResponse, errorResponse } from '../utils/responseHelper.js'

// GET /api/banners — public
export const getActiveBanners = async (req, res) => {
  const { type, category } = req.query
  const filter = { isActive: true }
  if (type) filter.type = type
  if (category !== undefined) filter.category = category
  const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 })
  return successResponse(res, 'Banners fetched', { banners })
}

// GET /api/admin/banners — admin all
export const getAllBannersAdmin = async (req, res) => {
  const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 })
  return successResponse(res, 'Banners fetched', { banners })
}

// POST /api/admin/banners — create
export const createBanner = async (req, res) => {
  const { title = '', subtitle = '', imageUrl, link, type, category, sortOrder } = req.body
 if (!imageUrl && type !== 'promo') return errorResponse(res, 'Image is required', 400)
  const banner = await Banner.create({ title, subtitle, imageUrl, link, type, category, sortOrder: sortOrder || 0 })
  return successResponse(res, 'Banner created', { banner }, 201)
}

// PUT /api/admin/banners/:id — update
export const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!banner) return errorResponse(res, 'Banner not found', 404)
  return successResponse(res, 'Banner updated', { banner })
}

// DELETE /api/admin/banners/:id
export const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id)
  if (!banner) return errorResponse(res, 'Banner not found', 404)
  if (banner.imageUrl?.includes('cloudinary')) {
    const publicId = banner.imageUrl.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(`banners/${publicId}`).catch(() => {})
  }
  return successResponse(res, 'Banner deleted')
}

// POST /api/admin/banners/upload — upload image to cloudinary
export const uploadBannerImage = async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return errorResponse(res, 'Image required', 400)
    // CHANGE TO:
const result = await cloudinary.uploader.upload(image, {
  folder: 'banners',
  transformation: [{ quality: 'auto', fetch_format: 'auto' }],
})
    return successResponse(res, 'Uploaded', { imageUrl: result.secure_url })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return errorResponse(res, 'Image upload failed: ' + err.message, 500)
  }
}

// PATCH /api/admin/banners/:id/toggle
export const toggleBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id)
  if (!banner) return errorResponse(res, 'Banner not found', 404)
  banner.isActive = !banner.isActive
  await banner.save()
  return successResponse(res, 'Banner toggled', { banner })
}