import { emitToUser, emitToAdmins } from './socketServer.js'

export const emitSellerApproved = (io, { sellerId }) => {
  emitToUser(io, sellerId?.toString(), 'seller:account_approved', {
    message: 'Your seller account is approved!',
    time: new Date(),
  })
}

export const emitSellerRejected = (io, { sellerId, reason }) => {
  emitToUser(io, sellerId?.toString(), 'seller:account_rejected', {
    reason,
    message: `Seller account rejected: ${reason}`,
    time: new Date(),
  })
}

export const emitProductApproved = (io, { sellerId, productId, productTitle }) => {
  emitToUser(io, sellerId?.toString(), 'product:approved', {
    productId,
    productTitle,
    message: `Your product "${productTitle}" is now live!`,
    time: new Date(),
  })
}

export const emitProductRejected = (io, { sellerId, productId, productTitle, reason }) => {
  emitToUser(io, sellerId?.toString(), 'product:rejected', {
    productId,
    productTitle,
    reason,
    message: `Product "${productTitle}" rejected: ${reason}`,
    time: new Date(),
  })
}

export const emitOrderPlaced = (io, { orderId, sellerId, buyerName, amount }) => {
  emitToUser(io, sellerId?.toString(), 'order:new', {
    orderId,
    buyerName,
    amount,
    message: `New order from ${buyerName} — ₹${amount}`,
    time: new Date(),
  })
  emitToAdmins(io, 'order:new', { orderId, buyerName, amount, time: new Date() })
}

export const emitPaymentConfirmed = (io, { orderId, buyerId, amount }) => {
  emitToUser(io, buyerId?.toString(), 'payment:confirmed', {
    orderId,
    amount,
    message: `Payment of ₹${amount} confirmed!`,
    time: new Date(),
  })
}

export const emitPayoutReleased = (io, { sellerId, amount, orderId }) => {
  emitToUser(io, sellerId?.toString(), 'payout:received', {
    amount,
    orderId,
    message: `₹${amount} credited to your bank account`,
    time: new Date(),
  })
}

export const emitLowStock = (io, { sellerId, productId, productTitle, stock }) => {
  emitToUser(io, sellerId?.toString(), 'product:low_stock', {
    productId,
    productTitle,
    stock,
    message: `Low stock: "${productTitle}" has only ${stock} left`,
    time: new Date(),
  })
}
// ADD this function to your existing socketEmit.js

export const emitOutForDelivery = (io, { orderId, buyerId, trackingUrl }) => {
  io.to(`user_${buyerId}`).emit('out_for_delivery', {
    orderId,
    trackingUrl,
    message: '🚚 Your order is out for delivery!',
    timestamp: new Date(),
  })
}