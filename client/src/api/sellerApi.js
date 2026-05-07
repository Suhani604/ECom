import api from './axiosInstance.js'

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const saveBusinessInfoAPI = (data) =>
  api.put('/seller/onboarding/business', data)

export const saveGSTINAPI = (formData) =>
  api.put('/seller/onboarding/gstin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const saveBankDetailsAPI = (formData) =>
  api.put('/seller/onboarding/bank', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const savePickupAddressAPI = (data) =>
  api.put('/seller/onboarding/pickup', data)

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getSellerProfileAPI = () =>
  api.get('/seller/profile')

export const updateSellerProfileAPI = (formData) =>
  api.put('/seller/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ─── Products ─────────────────────────────────────────────────────────────────
export const addProductAPI = (formData) =>
  api.post('/seller/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getMyProductsAPI = (params = {}) =>
  api.get('/seller/products', { params })

export const getProductAPI = (id) =>
  api.get(`/seller/products/${id}`)

export const updateProductAPI = (id, formData) =>
  api.put(`/seller/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteProductAPI = (id) =>
  api.delete(`/seller/products/${id}`)

// ─── Dashboard & utils ────────────────────────────────────────────────────────
export const getDashboardStatsAPI = () =>
  api.get('/seller/dashboard')

export const getCategoriesAPI = () =>
  api.get('/seller/categories')