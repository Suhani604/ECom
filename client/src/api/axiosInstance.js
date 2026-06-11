import axios from 'axios'
import useAuthStore from '../context/useAuthStore.js'

// ✅ FIX: Sirf ek jagah baseURL set karo — VITE_API_BASE_URL Vercel mein set hona chahiye
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 30s — Render free tier slow start ke liye
})

// Request interceptor — token attach karo
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ FIX: Sirf EK response interceptor — duplicate hata diya
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url    = error.config?.url || ''
    const status = error.response?.status

    // 401 pe logout — payment/order routes ko skip karo
    if (status === 401 && !url.includes('/razorpay') && !url.includes('/orders')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api