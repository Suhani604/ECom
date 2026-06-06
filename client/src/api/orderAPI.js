import api from './axiosInstance.js'

export const getAddressesAPI  = ()         => api.get('/orders/addresses')
export const addAddressAPI    = (data)     => api.post('/orders/addresses', data)
export const updateAddressAPI = (id, data) => api.put(`/orders/addresses/${id}`, data)
export const deleteAddressAPI = (id)       => api.delete(`/orders/addresses/${id}`)
export const createOrderAPI      = (data)        => api.post('/orders', data)
export const getMyOrdersAPI      = (params = {}) => api.get('/orders/my', { params })
export const getOrderByIdAPI     = (id)          => api.get(`/orders/${id}`)
export const cancelOrderAPI      = (id)          => api.put(`/orders/${id}/cancel`)
export const returnOrderAPI      = (id, reason)  => api.put(`/orders/${id}/return`, { reason })
export const createRazorpayOrderAPI   = (orderId) => api.post(`/orders/${orderId}/razorpay`)
export const verifyRazorpayPaymentAPI = (data)    => api.post('/orders/verify-payment', data)
// ADD this line
export const updateOrderStatusAPI = (id, data) => api.put(`/orders/${id}/status`, data)
export const calculateShippingAPI = (data) =>
  api.post('/orders/calculate-shipping', data)