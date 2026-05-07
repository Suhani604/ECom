import express from 'express'
import {
  getAddresses, addAddress, updateAddress, deleteAddress,
} from '../controllers/orderController.js'
import { authenticate, authorise } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/addresses',        authenticate, authorise('buyer'), getAddresses)
router.post('/addresses',       authenticate, authorise('buyer'), addAddress)
router.put('/addresses/:id',    authenticate, authorise('buyer'), updateAddress)
router.delete('/addresses/:id', authenticate, authorise('buyer'), deleteAddress)

export default router