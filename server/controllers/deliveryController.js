import DeliveryPartner from '../models/DeliveryPartner.js'
import Order from '../models/Order.js'
import { sendOTPSMS } from '../utils/smsHelper.js'
import { sendOutForDeliveryEmail } from '../utils/emailHelper.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  emitDeliveryAssigned,
  emitOrderPickedUp,
  emitOrderDelivered,
} from '../sockets/socketEmit.js'

// ── Register ──────────────────────────────────────────────────────────────────
export const registerDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, email, password, vehicleNumber, licenseNumber, pincode, city, state } = req.body
    const exists = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] })
    if (exists) return res.status(400).json({ message: 'Already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const dp = await DeliveryPartner.create({
      name, phone, email, password: hashed,
      vehicleNumber, licenseNumber,
      serviceArea: { pincode, city, state },
    })
    res.status(201).json({ message: 'Registered! Wait for admin approval.', id: dp._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginDeliveryPartner = async (req, res) => {
  try {
    const { phone, password } = req.body
    const dp = await DeliveryPartner.findOne({ phone })
    if (!dp) return res.status(404).json({ message: 'Not found' })
    if (!dp.isApproved) return res.status(403).json({ message: 'Account not approved yet' })
    const match = await bcrypt.compare(password, dp.password)
    if (!match) return res.status(401).json({ message: 'Wrong password' })
    const token = jwt.sign({ id: dp._id, role: 'delivery' }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, deliveryPartner: dp })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Toggle Online Status ──────────────────────────────────────────────────────
export const toggleOnlineStatus = async (req, res) => {
  try {
    const dp = await DeliveryPartner.findById(req.user.id)
    dp.isOnline = !dp.isOnline
    await dp.save()
    res.json({ isOnline: dp.isOnline })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get My Orders ─────────────────────────────────────────────────────────────
export const getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.user.id })
      .populate('buyer', 'name phone email')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Accept Order ──────────────────────────────────────────────────────────────
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.status = 'shipped'
    order.statusHistory.push({ status: 'shipped', note: 'Accepted by delivery partner' })
    await order.save()
    res.json({ message: 'Order accepted', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Mark Picked Up ────────────────────────────────────────────────────────────
export const markPickedUp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.seller')
      .populate('buyer', 'name phone email')  // ✅ buyer populate karo SMS ke liye
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // ✅ FIX: Pickup ke time OTP generate karo aur DB mein save karo
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString()
    order.deliveryOTP = deliveryOTP

    order.status = 'out_for_delivery'
    order.pickedUpAt = new Date()
    order.statusHistory.push({ status: 'out_for_delivery', note: 'Picked up by delivery partner' })
    await order.save()

    // Terminal mein OTP print karo (testing ke liye)
    console.log(`🔑 Delivery OTP for order ${order._id}: ${deliveryOTP}`)

    // Customer ko SMS bhejo (non-blocking)
    if (order.buyer?.phone) {
      try {
        await sendOTPSMS(order.buyer.phone, deliveryOTP)
        console.log(`✅ OTP SMS sent to ${order.buyer.phone}`)
      } catch (smsErr) {
        console.error(`❌ SMS failed (non-blocking): ${smsErr.message}`)
      }
    }
    // SMS ke baad yeh add karo:
if (order.buyer?.email) {
  sendOutForDeliveryEmail(
    order.buyer.email,
    order.buyer.name,
    order._id,
    `https://ecom-backend-6f19.onrender.com/track/${order._id}`
  ).catch(e => console.error('Delivery email failed:', e.message))
}


    // Real-time emit
    const io = req.app.get('io')
    const sellerId = order.items[0]?.seller?._id || order.items[0]?.seller
    const dp = await DeliveryPartner.findById(req.user.id)
    emitOrderPickedUp(io, {
      orderId: order._id,
      buyerId: order.buyer,
      sellerId,
      deliveryBoyName: dp.name,
    })

    res.json({ message: 'Marked as picked up', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Mark Delivered (OTP verify) ───────────────────────────────────────────────
export const markDelivered = async (req, res) => {
  try {
    const { otp } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.deliveryOTP !== otp) return res.status(400).json({ message: 'Wrong OTP' })

    order.status = 'delivered'
    order.deliveredAt = new Date()
    order.codCollected = order.paymentMethod === 'cod'
    order.statusHistory.push({ status: 'delivered', note: 'Delivered & OTP verified' })
    await order.save()

    // Earnings update
    const perDeliveryEarning = 40
    await DeliveryPartner.findByIdAndUpdate(req.user.id, {
      $inc: { totalEarnings: perDeliveryEarning, totalOrders: 1 },
      isAvailable: true,
    })

    // Real-time emit
    const io = req.app.get('io')
    const sellerId = order.items[0]?.seller
    emitOrderDelivered(io, {
      orderId: order._id,
      buyerId: order.buyer,
      sellerId,
    })

    res.json({ message: 'Order delivered successfully!', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Update Location ───────────────────────────────────────────────────────────
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body
    await DeliveryPartner.findByIdAndUpdate(req.user.id, {
      currentLocation: { lat, lng }
    })
    res.json({ message: 'Location updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const dp = await DeliveryPartner.findById(req.user.id).select('-password')
    res.json({ deliveryPartner: dp })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get Earnings ───────────────────────────────────────────────────────────────
export const getEarnings = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = await Order.countDocuments({
      deliveryBoy: req.user.id,
      status: 'delivered',
      deliveredAt: { $gte: today }
    })

    const dp = await DeliveryPartner.findById(req.user.id).select('totalEarnings pendingWithdrawal totalOrders')

    res.json({
      todayEarnings: todayOrders * 40,
      totalEarnings: dp.totalEarnings,
      pendingWithdrawal: dp.pendingWithdrawal,
      totalOrders: dp.totalOrders,
      todayOrders,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone email')
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const newOTP = Math.floor(1000 + Math.random() * 9000).toString()
    order.deliveryOTP = newOTP
    await order.save()

    // Terminal mein OTP print karo
    console.log(`🔑 Delivery OTP for order ${order._id}: ${newOTP}`)

    if (order.buyer?.phone) {
      try {
        await sendOTPSMS(order.buyer.phone, newOTP)
        console.log(`✅ SMS sent to ${order.buyer.phone}`)
      } catch (smsErr) {
        console.log(`❌ SMS failed: ${smsErr.message}`)
      }
    }

  if (order.buyer?.email) {
  sendOutForDeliveryEmail(
    order.buyer.email,
    order.buyer.name,
    order._id,
    `https://ecom-backend-6f19.onrender.com/track/${order._id}`
  ).catch(e => console.error('Delivery email failed:', e.message))
}

    res.json({ message: 'OTP sent to customer via SMS!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}