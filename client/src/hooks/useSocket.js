import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { connectSocket, disconnectSocket } from '../api/socket.js'
import useAuthStore          from '../context/useAuthStore.js'
import useNotificationStore  from '../context/useNotificationStore.js'

const useSocket = () => {
  const { user, token }     = useAuthStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!token || !user) return

    const socket = connectSocket(token)

    // Common events
    socket.on('order:status_changed', (data) => {
      toast.success(data.message, { icon: '📦' })
      addNotification({ type: 'order', message: data.message, data })
    })

    socket.on('payment:confirmed', (data) => {
      toast.success(data.message, { icon: '✅' })
      addNotification({ type: 'payment', message: data.message, data })
    })

    // Seller events
    if (user.role === 'seller') {
      socket.on('order:new', (data) => {
        toast.success(data.message, { icon: '🛒', duration: 5000 })
        addNotification({ type: 'order_new', message: data.message, data })
      })
      socket.on('seller:account_approved', (data) => {
        toast.success(data.message, { icon: '🎉', duration: 8000 })
        addNotification({ type: 'account', message: data.message, data })
      })
      socket.on('seller:account_rejected', (data) => {
        toast.error(data.message, { icon: '⚠️', duration: 8000 })
        addNotification({ type: 'account', message: data.message, data })
      })
      socket.on('product:approved', (data) => {
        toast.success(data.message, { icon: '✅' })
        addNotification({ type: 'product', message: data.message, data })
      })
      socket.on('product:rejected', (data) => {
        toast.error(data.message, { icon: '🚫' })
        addNotification({ type: 'product', message: data.message, data })
      })
      socket.on('product:low_stock', (data) => {
        toast(data.message, { icon: '⚠️' })
        addNotification({ type: 'stock', message: data.message, data })
      })
      socket.on('payout:received', (data) => {
        toast.success(data.message, { icon: '💰' })
        addNotification({ type: 'payout', message: data.message, data })
      })
    }

    // Admin events
    if (user.role === 'admin') {
      socket.on('order:new', (data) => {
        addNotification({ type: 'order_new', message: data.message || 'New order placed', data })
      })
      socket.on('online:count', (data) => {
        window.dispatchEvent(new CustomEvent('online:count', { detail: data }))
      })
      socket.on('user:online', (data) => {
        addNotification({ type: 'user_online', message: `${data.name} (${data.role}) came online`, data })
      })
    }

    return () => { disconnectSocket() }
  }, [token, user?._id])
}

export default useSocket