import api from './axiosInstance.js'

export const getAddressesAPI     = ()            => api.get('/buyer/addresses')
export const addAddressAPI       = (data)        => api.post('/buyer/addresses', data)
export const updateAddressAPI    = (id, data)    => api.put(`/buyer/addresses/${id}`, data)
export const deleteAddressAPI    = (id)          => api.delete(`/buyer/addresses/${id}`)
export const createOrderAPI      = (data)        => api.post('/orders', data)
export const getMyOrdersAPI      = (params = {}) => api.get('/orders/my', { params })
export const getOrderByIdAPI     = (id)          => api.get(`/orders/${id}`)
export const cancelOrderAPI      = (id)          => api.put(`/orders/${id}/cancel`)
export const returnOrderAPI      = (id, reason)  => api.put(`/orders/${id}/return`, { reason })
export const createRazorpayOrderAPI   = (orderId) => api.post(`/orders/${orderId}/razorpay`)
export const verifyRazorpayPaymentAPI = (data)    => api.post('/orders/verify-payment', data)