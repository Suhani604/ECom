import api from './axiosInstance.js'

// ── Buyer ──────────────────────────────────────────────────────────────────
export const submitReviewAPI      = (data)      => api.post('/reviews', data)
export const editReviewAPI        = (id, data)  => api.put(`/reviews/${id}`, data)
export const getProductReviewsAPI = (productId) => api.get(`/reviews/product/${productId}`)
export const getMyReviewsAPI      = ()          => api.get('/reviews/my-reviews')
export const checkOrderReviewsAPI = (orderId)   => api.get(`/reviews/order/${orderId}/check`)

// ── Admin ──────────────────────────────────────────────────────────────────
export const getAllReviewsAdminAPI       = ()                  => api.get('/reviews/admin/all')
export const toggleReviewVisibilityAPI  = (id, isVisible)     => api.patch(`/reviews/admin/${id}/visibility`, { isVisible })

// ── Seller ─────────────────────────────────────────────────────────────────
export const getSellerProductReviewsAPI = ()                  => api.get('/reviews/seller/my-products')