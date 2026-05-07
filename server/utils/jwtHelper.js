import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' })

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET)

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

export const otpExpiry = () =>
  new Date(Date.now() + 10 * 60 * 1000)