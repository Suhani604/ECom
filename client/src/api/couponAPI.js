import api from './axiosInstance.js'

export const applyCouponAPI    = (code, cartTotal) => api.post('/coupons/apply', { code, cartTotal })
export const removeCouponAPI   = ()                => api.post('/coupons/remove')
export const getMyReferralAPI  = ()                => api.get('/coupons/my-referral')

// Admin
export const getAllCouponsAPI  = ()      => api.get('/coupons')
export const createCouponAPI   = (data)  => api.post('/coupons', data)
export const updateCouponAPI   = (id, data) => api.put(`/coupons/${id}`, data)
export const deleteCouponAPI   = (id)    => api.delete(`/coupons/${id}`)
export const seedCouponsAPI    = ()      => api.post('/coupons/seed-defaults')