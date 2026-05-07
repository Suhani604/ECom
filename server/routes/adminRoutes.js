import express from 'express'
import {
  getDashboardStats,
  getAllSellers, getSellerById, approveSeller, rejectSeller, suspendSeller,
  getAllProducts, approveProduct, rejectProduct,
  getAllBuyers, toggleBlockUser,
  getAllOrders,
} from '../controllers/adminController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(authenticate)
router.use(authorise('admin'))

router.get('/dashboard',              getDashboardStats)
router.get('/sellers',                getAllSellers)
router.get('/sellers/:id',            getSellerById)
router.put('/sellers/:id/approve',    approveSeller)
router.put('/sellers/:id/reject',     rejectSeller)
router.put('/sellers/:id/suspend',    suspendSeller)
router.get('/products',               getAllProducts)
router.put('/products/:id/approve',   approveProduct)
router.put('/products/:id/reject',    rejectProduct)
router.get('/buyers',                 getAllBuyers)
router.put('/users/:id/block',        toggleBlockUser)
router.get('/orders',                 getAllOrders)

export default router