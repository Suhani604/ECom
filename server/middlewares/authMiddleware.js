import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' })

    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password -otp -otpExpiry')

    if (!user)          return res.status(401).json({ success: false, message: 'User not found' })
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' })

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired' })
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const authorise = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' })
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Access denied` })
  next()
}