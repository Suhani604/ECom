import express from 'express'
import {
  saveBusinessInfo, saveGSTIN, saveBankDetails, savePickupAddress,
  getSellerProfile, updateSellerProfile,
  addProduct, getMyProducts, getProduct, updateProduct, deleteProduct,
  getDashboardStats, getCategories,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerStats,            // ← ADD
} from '../controllers/sellerController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'
import { uploadDocument, uploadProductImages } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

router.use(authenticate)
router.use(authorise('seller'))

router.put('/onboarding/business', saveBusinessInfo)
router.put('/onboarding/gstin',    uploadDocument,       saveGSTIN)
router.put('/onboarding/bank',     uploadDocument,       saveBankDetails)
router.put('/onboarding/pickup',   savePickupAddress)
router.get('/profile',             getSellerProfile)
router.put('/profile',             uploadDocument,       updateSellerProfile)
router.post('/products',           uploadProductImages,  addProduct)
router.get('/products',            getMyProducts)
router.get('/products/:id',        getProduct)
router.put('/products/:id',        uploadProductImages,  updateProduct)
router.delete('/products/:id',     deleteProduct)
router.get('/dashboard',           getDashboardStats)
router.get('/categories',          getCategories)
router.get('/orders',                  getSellerOrders)
router.put('/orders/:orderId/status',  updateSellerOrderStatus)
router.get('/stats',               getSellerStats)   // ← ADD

export default router