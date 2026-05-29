import express from 'express'
import Category         from '../models/Category.js'
import Size             from '../models/Size.js'
import Color            from '../models/Color.js'
import AdditionalDetail from '../models/AdditionalDetail.js'

const router = express.Router()

// ── Mega Menu — fetch all 4 levels and build structured menu ──
router.get('/mega-menu', async (req, res) => {
  try {
    // Fetch ALL categories in one query (much faster than nested queries)
    const all = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .select('_id name slug parent level')

    const byParent = {}
    for (const cat of all) {
      const key = cat.parent ? cat.parent.toString() : 'root'
      if (!byParent[key]) byParent[key] = []
      byParent[key].push(cat)
    }

    const result = {}

    // Level 1 — Men, Women, Kids
    const level1 = byParent['root'] || []
    for (const cat of level1) {
      const key = cat.slug // 'men', 'women', 'kids'
      const cols = []

      // Level 2 — item types
      const level2 = byParent[cat._id.toString()] || []
      for (const itemType of level2) {

        const items = []
        // Level 3 — sub item types
        const level3 = byParent[itemType._id.toString()] || []
        for (const sub of level3) {

          // Level 4 — item names
          const level4 = byParent[sub._id.toString()] || []
          items.push(...level4.map(n => n.name))
        }

        if (items.length > 0) {
          cols.push({ heading: itemType.name, items })
        }
      }

      if (cols.length > 0) result[key] = cols
    }

    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// Level 1 — parent: null
router.get('/', async (req, res) => {
  try {
    const data = await Category.find({ parent: null })
      .sort({ sortOrder: 1 }).select('_id name slug sortOrder')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Level 2 — item types (parent = category _id)
router.get('/item-types', async (req, res) => {
  try {
    const { categoryId } = req.query
    if (!categoryId) return res.status(400).json({ success: false, message: 'categoryId required' })
    const data = await Category.find({ parent: categoryId })
      .sort({ sortOrder: 1 }).select('_id name slug sortOrder')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Level 3 — sub item types (parent = itemType _id)
router.get('/sub-item-types', async (req, res) => {
  try {
    const { itemTypeId } = req.query
    if (!itemTypeId) return res.status(400).json({ success: false, message: 'itemTypeId required' })
    const data = await Category.find({ parent: itemTypeId })
      .sort({ sortOrder: 1 }).select('_id name slug sortOrder')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Level 4 — item names (parent = subItemType _id)
router.get('/item-names', async (req, res) => {
  try {
    const { subItemTypeId } = req.query
    if (!subItemTypeId) return res.status(400).json({ success: false, message: 'subItemTypeId required' })
    const data = await Category.find({ parent: subItemTypeId })
      .sort({ sortOrder: 1 }).select('_id name slug sortOrder')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Sizes
router.get('/sizes', async (req, res) => {
  try {
    const { categoryId, itemTypeId, itemNameId } = req.query
    if (!categoryId || !itemTypeId || !itemNameId)
      return res.status(400).json({ success: false, message: 'categoryId, itemTypeId, itemNameId required' })
    const data = await Size.find({ categoryId, itemTypeId, itemNameId })
      .sort({ sortOrder: 1 }).select('_id sizeValue')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Colors
router.get('/colors', async (req, res) => {
  try {
    const { categoryId, itemTypeId } = req.query
    if (!categoryId || !itemTypeId)
      return res.status(400).json({ success: false, message: 'categoryId, itemTypeId required' })
    const data = await Color.find({ categoryId, itemTypeId })
      .sort({ sortOrder: 1 }).select('_id colorName hex colorGroup')
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Additional Details
router.get('/additional-details', async (req, res) => {
  try {
    const { categoryId, itemTypeId } = req.query
    if (!categoryId || !itemTypeId)
      return res.status(400).json({ success: false, message: 'categoryId, itemTypeId required' })
    const detail = await AdditionalDetail.findOne({ categoryId, itemTypeId }).select('fields')
    res.json({ success: true, data: detail?.fields || [] })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

export default router