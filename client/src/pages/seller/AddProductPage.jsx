import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiUpload, FiX, FiPackage, FiTruck } from 'react-icons/fi'

import {
  addProductAPI,
  getProductAPI,
  updateProductAPI,
} from '../../api/sellerAPI.js'

import {
  getCategoriesAPI,
  getItemTypesAPI,
  getSubItemTypesAPI,
  getItemNamesAPI,
  getSizesAPI,
  getColorsAPI,
  getAdditionalDetailsAPI,
} from '../../api/categoryAPI.js'

const GST_RATES = [3, 5, 12, 18]

// ─── Shipping defaults by item type ─────────────────────────────────────────
const SHIPPING_DEFAULTS = {
  'Jewellery':   { weight: 150,  l: 10, w: 8,  h: 3  },
  'Watches':     { weight: 350,  l: 15, w: 12, h: 8  },
  'Accessories': { weight: 200,  l: 20, w: 15, h: 5  },
  'Shoes':       { weight: 900,  l: 32, w: 20, h: 14 },
  'Ethnic Wear': { weight: 400,  l: 35, w: 25, h: 5  },
  'Western Wear':{ weight: 300,  l: 30, w: 22, h: 4  },
  'default':     { weight: 500,  l: 30, w: 20, h: 5  },
}

export default function AddProductPage() {
  const navigate     = useNavigate()
  const { id }       = useParams()
  const isEdit       = Boolean(id)
  const fileInputRef = useRef()

  // ── Server-driven dropdown data ──────────────────────────────
  const [categories,       setCategories]       = useState([])
  const [itemTypes,        setItemTypes]        = useState([])
  const [subItemTypes,     setSubItemTypes]     = useState([])
  const [itemNames,        setItemNames]        = useState([])
  const [availableSizes,   setAvailableSizes]   = useState([])
  const [availableColors,  setAvailableColors]  = useState([])
  const [additionalFields, setAdditionalFields] = useState([])

  // ── UI state ─────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(false)
  const [previews,     setPreviews]     = useState([])
  const [existingImgs, setExistingImgs] = useState([])
  const [customColors, setCustomColors] = useState({})

  // ── Shipping state (controlled, outside react-hook-form) ─────
  const [shipping, setShipping] = useState({
    shippingWeightKg:     0.5,
    packagingWeightKg:    0.06,
    length:               30,
    width:                20,
    height:               5,
    extraShippingCharge:  0,
    codAvailable:         true,
    freeShipping:         false,
    courierPartner:       'auto',
  })

  // ── Selected IDs ─────────────────────────────────────────────
  const [selectedCategoryId,    setSelectedCategoryId]    = useState('')
  const [selectedItemTypeId,    setSelectedItemTypeId]    = useState('')
  const [selectedSubItemTypeId, setSelectedSubItemTypeId] = useState('')
  const [selectedItemNameId,    setSelectedItemNameId]    = useState('')

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors }, reset,
  } = useForm({
    defaultValues: {
      variants: [{ size: '', color: '', stock: 1, sku: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  // ── Auto-fill shipping defaults when item type changes ───────
  useEffect(() => {
    const typeName = itemTypes.find(t => t._id === selectedItemTypeId)?.name
    const defaults = SHIPPING_DEFAULTS[typeName] || SHIPPING_DEFAULTS['default']
    setShipping(prev => ({
      ...prev,
      shippingWeightKg:  defaults.weight / 1000,
      length:            defaults.l,
      width:             defaults.w,
      height:            defaults.h,
    }))
  }, [selectedItemTypeId])

  // ── Level 1: Load categories on mount ────────────────────────
  useEffect(() => {
    getCategoriesAPI()
      .then(({ data }) => setCategories(data.data))
      .catch(() => toast.error('Failed to load categories'))
  }, [])

  // ── Level 2: Load item types ──────────────────────────────────
  useEffect(() => {
    if (!selectedCategoryId) { setItemTypes([]); return }
    getItemTypesAPI(selectedCategoryId)
      .then(({ data }) => setItemTypes(data.data))
      .catch(() => toast.error('Failed to load item types'))
  }, [selectedCategoryId])

  // ── Level 3: Load sub item types ──────────────────────────────
  useEffect(() => {
    if (!selectedItemTypeId) { setSubItemTypes([]); return }
    getSubItemTypesAPI(selectedItemTypeId)
      .then(({ data }) => setSubItemTypes(data.data))
      .catch(() => toast.error('Failed to load sub item types'))
  }, [selectedItemTypeId])

  // ── Level 4: Load item names ──────────────────────────────────
  useEffect(() => {
    if (!selectedSubItemTypeId) { setItemNames([]); return }
    getItemNamesAPI(selectedSubItemTypeId)
      .then(({ data }) => setItemNames(data.data))
      .catch(() => toast.error('Failed to load item names'))
  }, [selectedSubItemTypeId])

  // ── Load sizes, colors, additional fields ─────────────────────
  useEffect(() => {
    if (!selectedCategoryId || !selectedItemTypeId || !selectedItemNameId) {
      setAvailableSizes([]); setAvailableColors([]); setAdditionalFields([])
      return
    }
    Promise.all([
      getSizesAPI(selectedCategoryId, selectedItemTypeId, selectedItemNameId),
      getColorsAPI(selectedCategoryId, selectedItemTypeId),
      getAdditionalDetailsAPI(selectedCategoryId, selectedItemTypeId),
    ])
      .then(([s, c, a]) => {
        setAvailableSizes(s.data.data)
        setAvailableColors(c.data.data)
        setAdditionalFields(a.data.data)
      })
      .catch(() => toast.error('Failed to load product options'))
  }, [selectedCategoryId, selectedItemTypeId, selectedItemNameId])

  // ── Load product for editing ──────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const { data } = await getProductAPI(id)
        const p = data.product
        setSelectedCategoryId(p.category?._id      || p.category)
        setSelectedItemTypeId(p.itemType?._id       || p.itemType)
        setSelectedSubItemTypeId(p.subItemType?._id || p.subItemType)
        setSelectedItemNameId(p.itemName?._id       || p.itemName)
        reset({
          title:        p.title,
          description:  p.description,
          brand:        p.brand,
          mrp:          p.mrp,
          sellingPrice: p.sellingPrice,
          gstPercent:   p.gstPercent,
          weight:       p.weight,
          tags:         p.tags?.join(', ') || '',
          variants:     p.variants?.length ? p.variants : [{ size: '', color: '', stock: 1, sku: '' }],
          ...(p.additionalDetails || {}),
        })
        setExistingImgs(p.images || [])
        // Restore shipping fields
        setShipping({
          shippingWeightKg:    (p.shippingWeight  || 500) / 1000,
          packagingWeightKg:   (p.packagingWeight || 60)  / 1000,
          length:               p.length               || 30,
          width:                p.width                || 20,
          height:               p.height               || 5,
          extraShippingCharge:  p.extraShippingCharge  || 0,
          codAvailable:         p.codAvailable          ?? true,
          freeShipping:         p.freeShipping          ?? false,
          courierPartner:       p.courierPartner        || 'auto',
        })
      } catch { toast.error('Failed to load product') }
    }
    load()
  }, [id])

  // ── Shipping field change handler ─────────────────────────────
  const handleShipping = (e) => {
    const { name, value, type, checked } = e.target
    setShipping(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }))
  }

  // ── Volumetric weight preview ─────────────────────────────────
  const volumetricKg  = (shipping.length * shipping.width * shipping.height) / 5000
  const chargeableKg  = Math.max(shipping.shippingWeightKg, volumetricKg)

  // ── Image handlers ────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const total = previews.length + existingImgs.length + files.length
    if (total > 8) { toast.error('Max 8 images allowed'); return }
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPreviews(prev => [...prev, { file, url }])
    })
  }
  const removePreview  = (idx) => { URL.revokeObjectURL(previews[idx].url); setPreviews(p => p.filter((_, i) => i !== idx)) }
  const removeExisting = (idx) => setExistingImgs(p => p.filter((_, i) => i !== idx))

  // ── Add all sizes shortcut ────────────────────────────────────
  const addAllSizes = () => {
    const current = fields.map(f => f.size)
    availableSizes.forEach(({ sizeValue }) => {
      if (!current.includes(sizeValue)) append({ size: sizeValue, color: '', stock: 0, sku: '' })
    })
  }

  // ── Handle "Other" color ──────────────────────────────────────
  const handleColorSelect = (i, value) => {
    setValue(`variants.${i}.color`, value === 'Other' ? '' : value)
    setCustomColors(prev => ({ ...prev, [i]: value === 'Other' }))
  }

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = async (form) => {
    if (previews.length === 0 && existingImgs.length === 0)
      return toast.error('Add at least 1 product image')
    if (!form.variants || form.variants.length === 0)
      return toast.error('Add at least 1 size/variant')
    if (!selectedCategoryId)    return toast.error('Select a category')
    if (!selectedItemTypeId)    return toast.error('Select an item type')
    if (!selectedSubItemTypeId) return toast.error('Select a sub type')
    if (!selectedItemNameId)    return toast.error('Select an item name')

    setLoading(true)
    try {
      const additionalDetails = {}
      additionalFields.forEach(({ name }) => {
        if (form[name]) additionalDetails[name] = form[name]
      })

      const fd = new FormData()
      fd.append('category',          selectedCategoryId)
      fd.append('itemType',          selectedItemTypeId)
      fd.append('subItemType',       selectedSubItemTypeId)
      fd.append('itemName',          selectedItemNameId)
      fd.append('title',             form.title)
      fd.append('description',       form.description)
      fd.append('brand',             form.brand || '')

      // ── Numbers: always send as string but backend will parseFloat ───────
      fd.append('mrp',               String(Number(form.mrp)))
      fd.append('sellingPrice',      String(Number(form.sellingPrice)))
      fd.append('gstPercent',        String(Number(form.gstPercent || 5)))
      fd.append('weight',            String(Number(form.weight || 0)))

      // ── Shipping fields — convert kg back to grams for backend ───────────
      fd.append('shippingWeight',      String(Math.round(shipping.shippingWeightKg * 1000)))
      fd.append('packagingWeight',     String(Math.round(shipping.packagingWeightKg * 1000)))
      fd.append('length',              String(shipping.length))
      fd.append('width',               String(shipping.width))
      fd.append('height',              String(shipping.height))
      fd.append('extraShippingCharge', String(shipping.extraShippingCharge))
      fd.append('codAvailable',        String(shipping.codAvailable))
      fd.append('freeShipping',        String(shipping.freeShipping))
      fd.append('courierPartner',      shipping.courierPartner)

      fd.append('variants',          JSON.stringify(form.variants))
      fd.append('additionalDetails', JSON.stringify(additionalDetails))

      const tagsArr = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      fd.append('tags', JSON.stringify(tagsArr))

      previews.forEach(p => fd.append('images', p.file))
      if (isEdit) fd.append('keepImages', JSON.stringify(existingImgs))

      if (isEdit) {
        await updateProductAPI(id, fd)
        toast.success('Product updated! Awaiting approval.')
      } else {
        await addProductAPI(fd)
        toast.success('Product added! Awaiting admin approval.')
      }
      navigate('/seller/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setLoading(false) }
  }

  // ── Derived labels ────────────────────────────────────────────
  const selectedCategory = categories.find(c => c._id === selectedCategoryId)
  const selectedItemType = itemTypes.find(t => t._id === selectedItemTypeId)

  const gstHint = {
    'Jewellery':   'Gold/silver: 3% | Imitation: 5%',
    'Watches':     'Typically 18%',
    'Accessories': 'Typically 12–18%',
    'Shoes':       'Footwear ≤₹1000: 5% | Above: 12%',
  }[selectedItemType?.name] || 'Most garments: 5% or 12%'

  const colorLabel = {
    'Jewellery': 'Metal / Finish',
    'Watches':   'Dial / Strap',
    'Shoes':     'Color',
  }[selectedItemType?.name] || 'Color / Finish'

  const weightLabel = selectedItemType?.name === 'Jewellery'
    ? 'Net Weight (grams) — for hallmarking'
    : 'Net Weight (kg) — jewellery / product weight'

  const isWatchOrAcc = ['Watches', 'Accessories'].includes(selectedItemType?.name)

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">←</button>
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <FiPackage className="text-orange-600" size={16} />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <button onClick={handleSubmit(onSubmit)} disabled={loading}
          className="btn-primary text-sm px-5">
          {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Submit for Approval'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Product Info */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Product Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'Min 10 characters' } })}
                      placeholder="e.g. Men's Classic White Cotton T-Shirt"
                      className="input-field"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      <textarea
                        {...register('description', {
                          required: 'Description is required',
                          minLength: { value: 10, message: 'Min 10 characters' },
                        })}
                        rows={4}
                        placeholder={`• Cotton fabric\n• Regular fit\n• Comfortable for daily wear\n• Machine washable`}
                        className="input-field resize-none leading-7"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const cursor = e.target.selectionStart
                            const text   = e.target.value
                            const newText = text.substring(0, cursor) + '\n• ' + text.substring(cursor)
                            setValue('description', newText)
                            setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = cursor + 3 }, 0)
                          }
                        }}
                        onFocus={(e) => { if (!e.target.value) setValue('description', '• ') }}
                      />
                      <p className="text-xs text-gray-400">Press Enter to add next bullet point</p>
                    </div>
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input {...register('brand')} placeholder="e.g. Zara, H&M" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input {...register('tags')} placeholder="cotton, casual, summer" className="input-field" />
                      <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category — 4 levels */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-400">*</span></label>
                    <select className="input-field" value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value)
                        setSelectedItemTypeId(''); setSelectedSubItemTypeId(''); setSelectedItemNameId('')
                        setItemTypes([]); setSubItemTypes([]); setItemNames([])
                        setAvailableSizes([]); setAvailableColors([]); setAdditionalFields([])
                        setValue('variants', [{ size: '', color: '', stock: 1, sku: '' }])
                        setCustomColors({})
                      }}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Type <span className="text-red-400">*</span></label>
                    <select className="input-field" value={selectedItemTypeId} disabled={!selectedCategoryId}
                      onChange={(e) => {
                        setSelectedItemTypeId(e.target.value)
                        setSelectedSubItemTypeId(''); setSelectedItemNameId('')
                        setSubItemTypes([]); setItemNames([])
                        setAvailableSizes([]); setAvailableColors([]); setAdditionalFields([])
                        setValue('variants', [{ size: '', color: '', stock: 1, sku: '' }])
                        setCustomColors({})
                      }}>
                      <option value="">Select...</option>
                      {itemTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type <span className="text-red-400">*</span></label>
                    <select className="input-field" value={selectedSubItemTypeId} disabled={!selectedItemTypeId}
                      onChange={(e) => {
                        setSelectedSubItemTypeId(e.target.value)
                        setSelectedItemNameId(''); setItemNames([])
                        setAvailableSizes([]); setAvailableColors([]); setAdditionalFields([])
                        setValue('variants', [{ size: '', color: '', stock: 1, sku: '' }])
                        setCustomColors({})
                      }}>
                      <option value="">Select...</option>
                      {subItemTypes.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name <span className="text-red-400">*</span></label>
                    <select className="input-field" value={selectedItemNameId} disabled={!selectedSubItemTypeId}
                      onChange={(e) => {
                        setSelectedItemNameId(e.target.value)
                        setValue('variants', [{ size: '', color: '', stock: 1, sku: '' }])
                        setCustomColors({})
                      }}>
                      <option value="">Select...</option>
                      {itemNames.map(n => <option key={n._id} value={n._id}>{n.name}</option>)}
                    </select>
                  </div>
                </div>
                {selectedCategory && selectedItemType && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-xs text-blue-600 font-medium">
                      {selectedCategory.name} → {selectedItemType.name}
                      {subItemTypes.find(s => s._id === selectedSubItemTypeId)?.name
                        ? ` → ${subItemTypes.find(s => s._id === selectedSubItemTypeId).name}` : ''}
                      {itemNames.find(n => n._id === selectedItemNameId)?.name
                        ? ` → ${itemNames.find(n => n._id === selectedItemNameId).name}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Sizes & Stock */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {isWatchOrAcc ? 'Variants & Stock' : 'Sizes & Stock'}
                  </h3>
                  <div className="flex gap-2">
                    {availableSizes.length > 0 && (
                      <button type="button" onClick={addAllSizes}
                        className="text-xs text-orange-600 border border-orange-200 px-3 py-1 rounded-lg hover:bg-orange-50">
                        + Add all sizes
                      </button>
                    )}
                    <button type="button"
                      onClick={() => append({ size: '', color: '', stock: 1, sku: '' })}
                      className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1">
                      <FiPlus size={12} /> Add row
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2 px-1">
                  <div className="col-span-3">Size</div>
                  <div className="col-span-3">{colorLabel}</div>
                  <div className="col-span-3">Stock qty</div>
                  <div className="col-span-2">SKU</div>
                  <div className="col-span-1"></div>
                </div>

                {!selectedItemNameId && (
                  <p className="text-xs text-gray-400 py-4 text-center">
                    Select all 4 category levels to load sizes
                  </p>
                )}

                <div className="space-y-2">
                  {fields.map((field, i) => (
                    <div key={field.id} className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          {availableSizes.length > 0 ? (
                            <select {...register(`variants.${i}.size`, { required: true })} className="input-field text-sm py-2">
                              <option value="">Size</option>
                              {availableSizes.map(s => <option key={s._id} value={s.sizeValue}>{s.sizeValue}</option>)}
                            </select>
                          ) : (
                            <input {...register(`variants.${i}.size`, { required: true })} placeholder="Size" className="input-field text-sm py-2" />
                          )}
                        </div>
                        <div className="col-span-3">
                          {availableColors.length > 0 ? (
                            <select className="input-field text-sm py-2" defaultValue="" onChange={(e) => handleColorSelect(i, e.target.value)}>
                              <option value="">{colorLabel}</option>
                              {availableColors.map(c => <option key={c._id} value={c.colorName}>{c.colorName}</option>)}
                              <option value="Other">Other (type below)</option>
                            </select>
                          ) : (
                            <input {...register(`variants.${i}.color`)} placeholder="Color / Finish" className="input-field text-sm py-2" />
                          )}
                        </div>
                        <div className="col-span-3">
                          <input
                            {...register(`variants.${i}.stock`, { required: true, min: 0, valueAsNumber: true })}
                            type="number" min="0" placeholder="0" className="input-field text-sm py-2"
                          />
                        </div>
                        <div className="col-span-2">
                          <input {...register(`variants.${i}.sku`)} placeholder="SKU" className="input-field text-sm py-2" />
                        </div>
                        <div className="col-span-1">
                          <button type="button"
                            onClick={() => { remove(i); setCustomColors(prev => { const n = { ...prev }; delete n[i]; return n }) }}
                            disabled={fields.length === 1}
                            className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {customColors[i] && (
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3 col-start-4">
                            <input
                              {...register(`variants.${i}.color`, { required: true })}
                              placeholder={`Custom ${colorLabel.toLowerCase()}…`}
                              className="input-field text-sm py-2 border-orange-300 focus:ring-orange-400"
                              autoFocus
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SHIPPING DETAILS (NEW) ── */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-pink-100 rounded-md flex items-center justify-center">
                    <FiTruck className="text-pink-600" size={13} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Shipping Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  {/* Shipping weight (kg) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Weight (kg) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number" name="shippingWeightKg" step="0.1" min="0.1"
                      value={shipping.shippingWeightKg}
                      onChange={handleShipping}
                      className="input-field"
                      placeholder="e.g. 0.5"
                    />
                    <p className="text-xs text-gray-400 mt-1">Actual packed weight of the product</p>
                  </div>

                  {/* Courier partner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courier Partner</label>
                    <select name="courierPartner" value={shipping.courierPartner} onChange={handleShipping} className="input-field">
                      <option value="auto">Auto (cheapest for buyer's zone)</option>
                      <option value="delhivery">Delhivery</option>
                      <option value="bluedart">Bluedart</option>
                      <option value="ekart">Ekart</option>
                      <option value="xpressbees">Xpressbees</option>
                    </select>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                    <input type="number" name="length" step="0.1" min="0"
                      value={shipping.length} onChange={handleShipping} className="input-field" placeholder="e.g. 30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                    <input type="number" name="width" step="0.1" min="0"
                      value={shipping.width} onChange={handleShipping} className="input-field" placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input type="number" name="height" step="0.1" min="0"
                      value={shipping.height} onChange={handleShipping} className="input-field" placeholder="e.g. 5" />
                  </div>

                  {/* Extra charge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extra Shipping Charge (₹)</label>
                    <input type="number" name="extraShippingCharge" step="1" min="0"
                      value={shipping.extraShippingCharge} onChange={handleShipping} className="input-field" placeholder="0" />
                    <p className="text-xs text-gray-400 mt-1">Flat extra added on top of courier rate</p>
                  </div>
                </div>

                {/* Volumetric weight info */}
                {shipping.length > 0 && shipping.width > 0 && shipping.height > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex flex-wrap gap-3">
                    <span>Actual: <strong>{shipping.shippingWeightKg} kg</strong></span>
                    <span>Volumetric: <strong>{volumetricKg.toFixed(2)} kg</strong></span>
                    <span className="font-semibold text-blue-800">
                      Chargeable: {chargeableKg.toFixed(2)} kg
                      {volumetricKg > shipping.shippingWeightKg ? ' (volumetric applies)' : ' (actual applies)'}
                    </span>
                  </div>
                )}

                {/* COD + Free Shipping toggles */}
                <div className="flex flex-wrap gap-6 mt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input type="checkbox" name="codAvailable"
                      checked={shipping.codAvailable} onChange={handleShipping}
                      className="w-4 h-4 accent-pink-500" />
                    COD Available
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input type="checkbox" name="freeShipping"
                      checked={shipping.freeShipping} onChange={handleShipping}
                      className="w-4 h-4 accent-pink-500" />
                    Free Shipping (seller absorbs cost)
                  </label>
                </div>
              </div>

              {/* Additional Details */}
              {additionalFields.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">Additional Details</h3>
                  <p className="text-xs text-gray-400 mb-4">Helps customers filter and find your product more easily.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {additionalFields.map(({ name, label, type, options }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        {type === 'text' ? (
                          <input {...register(name)} placeholder={label} className="input-field" />
                        ) : (
                          <select {...register(name)} className="input-field">
                            <option value="">Select...</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">

              {/* Images */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Product Images <span className="text-gray-400 font-normal normal-case">(max 8)</span>
                </h3>
                {existingImgs.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {existingImgs.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => removeExisting(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {previews.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={p.url} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => removePreview(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(previews.length + existingImgs.length) < 8 && (
                  <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all">
                    <FiUpload className="text-gray-400" size={22} />
                    <span className="text-sm text-gray-500">Click to upload images</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB each</span>
                    <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp"
                      className="hidden" onChange={handleImageChange} />
                  </label>
                )}
                {previews.length === 0 && existingImgs.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">At least 1 image is required</p>
                )}
              </div>

              {/* Pricing */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Pricing</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) <span className="text-red-400">*</span></label>
                    <input
                      {...register('mrp', { required: 'MRP required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })}
                      type="number" placeholder="999" className="input-field"
                    />
                    {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) <span className="text-red-400">*</span></label>
                    <input
                      {...register('sellingPrice', { required: 'Selling price required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })}
                      type="number" placeholder="799" className="input-field"
                    />
                    {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice.message}</p>}
                  </div>
                  {watch('mrp') > 0 && watch('sellingPrice') > 0 && watch('mrp') > watch('sellingPrice') && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                      <span className="text-xs text-green-700 font-medium">
                        {Math.round(((watch('mrp') - watch('sellingPrice')) / watch('mrp')) * 100)}% off
                      </span>
                      <span className="text-xs text-green-600">Customer saves ₹{watch('mrp') - watch('sellingPrice')}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <select {...register('gstPercent', { valueAsNumber: true })} className="input-field">
                      {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{gstHint}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{weightLabel}</label>
                    <input
                      {...register('weight', { valueAsNumber: true })}
                      type="number"
                      step={selectedItemType?.name === 'Jewellery' ? '0.01' : '0.1'}
                      placeholder={selectedItemType?.name === 'Jewellery' ? '5.00' : '0.5'}
                      className="input-field"
                    />
                    {selectedItemType?.name === 'Jewellery' && (
                      <p className="text-xs text-gray-400 mt-1">Net weight in grams (for hallmarking)</p>
                    )}
                  </div>
                </div>
              </div>
                {/* Shipping Payout Summary Card */}
              {watch('sellingPrice') > 0 && (
                <div className="card border border-orange-100 bg-gradient-to-b from-orange-50 to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTruck className="text-orange-500" size={14} />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Estimated Payout
                    </h3>
                  </div>
                  {(() => {
                    const sp          = Number(watch('sellingPrice')) || 0
                    const isCOD       = shipping.codAvailable
                    const weightG     = Math.max(
                      Math.round(shipping.shippingWeightKg * 1000),
                      Math.round(chargeableKg * 1000)
                    )
                    const slabs       = Math.ceil(weightG / 500)
                    const shippingFee = shipping.freeShipping ? 0 : (38 + Math.max(0, slabs - 1) * 10)
                    const codCharge   = isCOD ? Math.max(30, Math.round(sp * 1.5 / 100)) + 20 : 0
                    const commission  = Math.round(sp * 9 / 100)
                    const gstOnShip   = Math.round(shippingFee * 18 / 100)
                    const pgFee       = isCOD ? 0 : Math.round(sp * 2 / 100)
                    const tds         = Math.round(sp * 1 / 100)
                    const payout      = Math.max(0, sp - shippingFee - gstOnShip - commission - codCharge - pgFee - tds)
                    const rows = [
                      { label: 'Selling Price',           val: `₹${sp}`,          sign: '',  highlight: true },
                      { label: `Shipping (${weightG}g est.)`, val: shipping.freeShipping ? 'Free (you absorb)' : `₹${shippingFee}`, sign: '−', green: shipping.freeShipping },
                      { label: 'GST on Shipping 18%',     val: `₹${gstOnShip}`,   sign: '−' },
                      { label: 'Platform Commission 9%',  val: `₹${commission}`,  sign: '−' },
                      ...(isCOD ? [{ label: 'COD Charge', val: `₹${codCharge}`,   sign: '−' }] : []),
                      ...(!isCOD && pgFee > 0 ? [{ label: 'Payment Gateway 2%', val: `₹${pgFee}`, sign: '−' }] : []),
                      { label: 'TDS 1%',                  val: `₹${tds}`,         sign: '−' },
                    ]
                    return (
                      <div className="space-y-2 text-xs">
                        {rows.map(({ label, val, sign, highlight, green }) => (
                          <div key={label} className="flex justify-between">
                            <span className={highlight ? 'font-medium text-gray-700' : 'text-gray-500'}>{label}</span>
                            <span className={green ? 'text-green-600 font-medium' : highlight ? 'font-medium text-gray-800' : 'text-gray-600'}>
                              {sign && !green ? `${sign} ` : ''}{val}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-orange-200 pt-2 mt-1 flex justify-between items-center">
                          <span className="font-semibold text-gray-700 text-sm">Your Payout</span>
                          <span className={`font-bold text-lg ${payout > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            ₹{payout}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[10px] pt-1 leading-relaxed">
                          * Estimate for nonMetro zone. Actual varies by buyer location. Payout released 10 days after delivery.
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}

             


              {/* Submit mobile */}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all active:scale-95 lg:hidden">
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Submit for Approval'}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  )
}