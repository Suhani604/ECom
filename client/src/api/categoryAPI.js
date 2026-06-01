import api from './axiosInstance.js'  // ← yahi change hai, alag axios nahi

// Level 1 — Men, Women, Kids
export const getCategoriesAPI = () =>
  api.get('/categories')

// Level 2 — Ethnic Wear, Western Wear, Shoes...
export const getItemTypesAPI = (categoryId) =>
  api.get(`/categories/item-types?categoryId=${categoryId}`)

// Level 3 — Kurtis Sets & Fabrics, Sarees...
export const getSubItemTypesAPI = (itemTypeId) =>
  api.get(`/categories/sub-item-types?itemTypeId=${itemTypeId}`)

// Level 4 — Kurtis, Anarkalis, Straight Kurtas...
export const getItemNamesAPI = (subItemTypeId) =>
  api.get(`/categories/item-names?subItemTypeId=${subItemTypeId}`)

// Sizes
export const getSizesAPI = (categoryId, itemTypeId, itemNameId) =>
  api.get(`/categories/sizes?categoryId=${categoryId}&itemTypeId=${itemTypeId}&itemNameId=${itemNameId}`)

// Colors
export const getColorsAPI = (categoryId, itemTypeId) =>
  api.get(`/categories/colors?categoryId=${categoryId}&itemTypeId=${itemTypeId}`)

// Additional Details
export const getAdditionalDetailsAPI = (categoryId, itemTypeId) =>
  api.get(`/categories/additional-details?categoryId=${categoryId}&itemTypeId=${itemTypeId}`)

// Admin — get all additional details
export const getAdminAdditionalDetailsAPI = () =>
  api.get('/admin/categories/additional-details')

// Admin — upsert additional details
export const upsertAdditionalDetailsAPI = (data) =>
  api.post('/admin/categories/additional-details', data)