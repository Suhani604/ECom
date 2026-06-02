import Category        from '../models/Category.js'
import Size            from '../models/Size.js'
import Color           from '../models/Color.js'
import AdditionalDetail from '../models/AdditionalDetail.js'

// ── GET /api/categories?parent=null|<id>
// Returns top-level categories (Men, Women...) or children (Clothing, Shoes... or T-Shirts, Jeans...)
export const getCategories = async (req, res) => {
  const { parent } = req.query

  const filter = {
    isActive: true,
    parent:   parent === 'null' || parent === undefined ? null : parent,
  }

  const categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select('_id name slug parent sortOrder')

  res.json({ success: true, data: categories })
}

// ── GET /api/categories/item-types?categoryId=<id>
// Children of a top-level category — Clothing, Shoes, Jewellery...
export const getItemTypes = async (req, res) => {
  const { categoryId } = req.query
  if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId required' })

  const itemTypes = await Category.find({ parent: categoryId, isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select('_id name slug sortOrder')

  res.json({ success: true, data: itemTypes })
}

// ── GET /api/categories/item-names?itemTypeId=<id>
// Children of an item type — T-Shirts, Jeans, Trouser...
export const getItemNames = async (req, res) => {
  const { itemTypeId } = req.query
  if (!itemTypeId) return res.status(400).json({ success: false, message: 'itemTypeId required' })

  const itemNames = await Category.find({ parent: itemTypeId, isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select('_id name slug sortOrder')

  res.json({ success: true, data: itemNames })
}

// ── GET /api/categories/sizes?categoryId=<id>&itemTypeId=<id>&itemNameId=<id>
export const getSizes = async (req, res) => {
  const { categoryId, itemTypeId, itemNameId } = req.query
  if (!categoryId || !itemTypeId || !itemNameId)
    return res.status(400).json({ success: false, message: 'categoryId, itemTypeId and itemNameId are required' })

  const sizes = await Size.find({ categoryId, itemTypeId, itemNameId, isActive: true })
    .sort({ sortOrder: 1, sizeValue: 1 })
    .select('_id sizeValue')

  res.json({ success: true, data: sizes })
}

// ── GET /api/categories/colors?categoryId=<id>&itemTypeId=<id>
export const getColors = async (req, res) => {
  const { categoryId, itemTypeId } = req.query
  if (!categoryId || !itemTypeId)
    return res.status(400).json({ success: false, message: 'categoryId and itemTypeId are required' })

  const colors = await Color.find({ categoryId, itemTypeId, isActive: true })
    .sort({ sortOrder: 1, colorName: 1 })
    .select('_id colorName')

  res.json({ success: true, data: colors })
}

// ── GET /api/categories/additional-details?categoryId=<id>&itemTypeId=<id>
export const getAdditionalDetails = async (req, res) => {
  const { categoryId, itemTypeId } = req.query
  if (!categoryId || !itemTypeId)
    return res.status(400).json({ success: false, message: 'categoryId and itemTypeId are required' })

  const detail = await AdditionalDetail.findOne({ categoryId, itemTypeId, isActive: true })
    .select('fields')

  res.json({ success: true, data: detail?.fields || [] })
}
export const getMegaMenu = async (req, res) => {
  try {
    // Get all Level 1 categories (Men, Women, Kids)
    const level1 = await Category.find({ parent: null, isActive: true }).sort('sortOrder')

    const result = {}

    for (const cat of level1) {
      const key = cat.slug // 'men', 'women', 'kids'

      // Get Level 2 (item types) for this category
      const level2 = await Category.find({ parent: cat._id, isActive: true }).sort('sortOrder')

      const cols = []
      for (const itemType of level2) {
        // Get Level 4 item names under this item type
        // First get Level 3 sub item types
        const level3 = await Category.find({ parent: itemType._id, isActive: true }).sort('sortOrder')

        const items = []
        for (const sub of level3) {
          // Get Level 4 item names
          const level4 = await Category.find({ parent: sub._id, isActive: true }).sort('sortOrder')
          items.push(...level4.map(n => n.name))
        }

        if (items.length > 0) {
          cols.push({ heading: itemType.name, items })
        }
      }

      if (cols.length > 0) {
        result[key] = cols
      }
    }

    // Add jewellery separately if it's stored differently
    // (your seed doesn't have jewellery as Level 1 — add it if needed)

    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET /api/admin/categories/additional-details
export const getAdditionalDetailsForAdmin = async (req, res) => {
  try {
    const details = await AdditionalDetail.find({ isActive: true })
      .populate('categoryId',  'name slug')
      .populate('itemTypeId',  'name slug')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: details })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── POST /api/admin/categories/additional-details
export const upsertAdditionalDetails = async (req, res) => {
  try {
    const { categoryId, itemTypeId, fields } = req.body
    if (!categoryId || !itemTypeId)
      return res.status(400).json({ success: false, message: 'categoryId and itemTypeId required' })

    const doc = await AdditionalDetail.findOneAndUpdate(
      { categoryId, itemTypeId },
      { categoryId, itemTypeId, fields, isActive: true },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}