import express from 'express'
import {
  getActiveBanners, getAllBannersAdmin,
  createBanner, updateBanner, toggleBanner, deleteBanner,
  uploadBannerImage,                          // ← add this
} from '../controllers/bannerController.js'
import { authenticate } from '../middlewares/authMiddleware.js'
import uploadMiddleware from '../middlewares/uploadMiddleware.js'

const router = express.Router()

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' })
  next()
}

router.get   ('/',                    getActiveBanners)
router.get   ('/admin',               authenticate, adminOnly, getAllBannersAdmin)
router.post  ('/admin/upload',        authenticate, adminOnly, uploadBannerImage)  // ← add this BEFORE /admin/:id
router.post  ('/admin',               authenticate, adminOnly, createBanner)
router.put   ('/admin/:id',           authenticate, adminOnly, updateBanner)
router.patch ('/admin/:id/toggle',    authenticate, adminOnly, toggleBanner)
router.delete('/admin/:id',           authenticate, adminOnly, deleteBanner)

export default router