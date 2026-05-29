import axios from 'axios'

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' })

// Level 1 — Men, Women, Kids
export const getCategoriesAPI = () =>
  API.get('/api/categories')

// Level 2 — Ethnic Wear, Western Wear, Shoes...
export const getItemTypesAPI = (categoryId) =>
  API.get(`/api/categories/item-types?categoryId=${categoryId}`)

// Level 3 — Kurtis Sets & Fabrics, Sarees...
export const getSubItemTypesAPI = (itemTypeId) =>
  API.get(`/api/categories/sub-item-types?itemTypeId=${itemTypeId}`)

// Level 4 — Kurtis, Anarkalis, Straight Kurtas...
export const getItemNamesAPI = (subItemTypeId) =>
  API.get(`/api/categories/item-names?subItemTypeId=${subItemTypeId}`)

// Sizes (needs all 3 IDs)
export const getSizesAPI = (categoryId, itemTypeId, itemNameId) =>
  API.get(`/api/categories/sizes?categoryId=${categoryId}&itemTypeId=${itemTypeId}&itemNameId=${itemNameId}`)

// Colors (needs category + itemType)
export const getColorsAPI = (categoryId, itemTypeId) =>
  API.get(`/api/categories/colors?categoryId=${categoryId}&itemTypeId=${itemTypeId}`)

// Additional Details (needs category + itemType)
export const getAdditionalDetailsAPI = (categoryId, itemTypeId) =>
  API.get(`/api/categories/additional-details?categoryId=${categoryId}&itemTypeId=${itemTypeId}`)