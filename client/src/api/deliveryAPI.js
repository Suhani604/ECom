import axios from 'axios'

// Alag axios instance — delivery ka apna token hai
const deliveryApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

deliveryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deliveryToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

deliveryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('deliveryToken')
      localStorage.removeItem('deliveryPartner')
      window.location.href = '/delivery/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginDelivery    = (data) => deliveryApi.post('/delivery/login', data)
export const registerDelivery = (data) => deliveryApi.post('/delivery/register', data)

// ── Profile & Status ──────────────────────────────────────────────────────────
export const getDeliveryProfile  = ()     => deliveryApi.get('/delivery/profile')
export const toggleOnlineStatus  = ()     => deliveryApi.put('/delivery/toggle-online')
export const updateLocation      = (data) => deliveryApi.put('/delivery/location', data)

// ── Orders ────────────────────────────────────────────────────────────────────
export const getMyDeliveries = ()      => deliveryApi.get('/delivery/my-deliveries')
export const acceptOrder     = (id)    => deliveryApi.put(`/delivery/${id}/accept`)
export const markPickedUp    = (id)    => deliveryApi.put(`/delivery/${id}/picked-up`)
export const markDelivered   = (id, otp) => deliveryApi.put(`/delivery/${id}/delivered`, { otp })

// ── Earnings ──────────────────────────────────────────────────────────────────
export const getEarnings = () => deliveryApi.get('/delivery/earnings')
export const resendOTP = (id) => deliveryApi.put(`/delivery/${id}/resend-otp`)

export default deliveryApi