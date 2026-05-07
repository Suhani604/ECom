import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiUpload, FiX, FiPackage } from 'react-icons/fi'

import { addProductAPI, getCategoriesAPI, getProductAPI, updateProductAPI } from '../../api/sellerAPI.js'

// ─── Category & Sub-category config ──────────────────────────────────────────
const SUB_CATEGORIES = {
  men:         ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Jackets', 'Ethnic Wear'],
  women:       ['Kurtis', 'Sarees', 'Tops', 'Dresses', 'Leggings', 'Ethnic Wear', 'Jeans'],
  kids:        ['Boys Clothing', 'Girls Clothing', 'Baby Clothing', 'School Uniform', 'Party Wear'],
  watches:     ['Analog Watches', 'Digital Watches', 'Smart Watches', 'Chronograph', 'Luxury Watches', 'Sports Watches', 'Casual Watches'],
  shoes:       ['Sneakers', 'Formal Shoes', 'Loafers', 'Sports & Running', 'Sandals & Flip-flops', 'Boots', 'Ethnic Footwear'],
  jewellery:   ['Rings', 'Necklaces & Chains', 'Bracelets & Bangles', 'Earrings', 'Pendants', 'Anklets', 'Nose Pins', 'Brooches'],
  accessories: ['Belts', 'Wallets', 'Sunglasses', 'Caps & Hats', 'Scarves & Stoles', 'Bags & Backpacks', 'Ties & Pocket Squares', 'Socks'],
}

const CATEGORY_LABELS = {
  men:         'Men — Clothing',
  women:       'Women — Clothing',
  kids:        'Kids — Clothing',
  watches:     'Men\'s Watches',
  shoes:       'Men\'s Shoes',
  jewellery:   'Jewellery',
  accessories: 'Accessories',
}

// ─── Size options per category ────────────────────────────────────────────────
const SIZES_MEN_WOMEN   = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const SIZES_KIDS        = ['0-6M', '6-12M', '1Y', '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '10Y', '12Y', '14Y']
const SIZES_SHOES       = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12']
const SIZES_WATCHES_ACC = ['Free Size', 'Small', 'Medium', 'Large']
const SIZES_JEWELLERY   = ['Free Size', '5', '6', '7', '8', '9', '10', '11', '12']

const getSizesForCategory = (cat) => {
  if (cat === 'kids')        return SIZES_KIDS
  if (cat === 'shoes')       return SIZES_SHOES
  if (cat === 'jewellery')   return SIZES_JEWELLERY
  if (cat === 'watches' || cat === 'accessories') return SIZES_WATCHES_ACC
  return SIZES_MEN_WOMEN
}

// ─── Color options per category ───────────────────────────────────────────────
const COLORS_CLOTHING = [
  'Black', 'White', 'Grey', 'Charcoal', 'Off White', 'Cream', 'Beige',
  'Navy Blue', 'Royal Blue', 'Sky Blue', 'Light Blue', 'Teal', 'Turquoise',
  'Red', 'Maroon', 'Burgundy', 'Brick Red', 'Coral', 'Peach',
  'Pink', 'Hot Pink', 'Baby Pink', 'Magenta', 'Rose',
  'Yellow', 'Mustard', 'Golden Yellow', 'Lemon Yellow',
  'Orange', 'Rust', 'Burnt Orange',
  'Green', 'Olive', 'Bottle Green', 'Mint Green', 'Sage', 'Forest Green', 'Lime Green',
  'Purple', 'Lavender', 'Violet', 'Indigo', 'Lilac',
  'Brown', 'Tan', 'Camel', 'Chocolate', 'Khaki',
  'Multi-colour', 'Tie-Dye', 'Printed', 'Striped', 'Checked',
  'Other',
]

const COLORS_SHOES = [
  'Black', 'White', 'Brown', 'Tan', 'Beige', 'Camel', 'Chocolate',
  'Navy Blue', 'Royal Blue', 'Grey', 'Charcoal',
  'Red', 'Maroon', 'Burgundy',
  'Green', 'Olive', 'Khaki',
  'Orange', 'Yellow', 'Multi-colour',
  'Other',
]

const COLORS_WATCHES = [
  'Black Dial', 'White Dial', 'Silver Dial', 'Blue Dial', 'Grey Dial',
  'Gold Dial', 'Rose Gold Dial', 'Champagne Dial', 'Brown Dial',
  'Green Dial', 'Navy Dial', 'Red Dial', 'Orange Dial',
  'Black Strap', 'Brown Strap', 'Blue Strap', 'Silver Bracelet',
  'Gold Bracelet', 'Rose Gold Bracelet', 'Mesh Band', 'Rubber Band',
  'Black / Silver', 'Black / Gold', 'Blue / Silver',
  'Other',
]

const COLORS_JEWELLERY = [
  '22K Gold', '18K Gold', '14K Gold', 'Gold Plated',
  '925 Sterling Silver', 'Silver Plated',
  'Rose Gold', 'Rose Gold Plated',
  'White Gold',
  'Rhodium Plated',
  'Antique Gold', 'Antique Silver',
  'Two-Tone (Gold & Silver)',
  'Platinum',
  'Oxidised Silver',
  'Copper',
  'Other',
]

const COLORS_ACCESSORIES = [
  'Black', 'Brown', 'Tan', 'Navy Blue', 'Grey', 'White', 'Beige',
  'Olive', 'Khaki', 'Maroon', 'Burgundy',
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple',
  'Camouflage', 'Multi-colour', 'Printed',
  'Transparent / Clear',
  'Other',
]

const getColorsForCategory = (cat) => {
  if (cat === 'shoes')       return COLORS_SHOES
  if (cat === 'watches')     return COLORS_WATCHES
  if (cat === 'jewellery')   return COLORS_JEWELLERY
  if (cat === 'accessories') return COLORS_ACCESSORIES
  return COLORS_CLOTHING   // men, women, kids
}

// ─── GST rates ────────────────────────────────────────────────────────────────
const GST_RATES = [3, 5, 12, 18]

// ─── Component ───────────────────────────────────────────────────────────────
export default function AddProductPage() {
  const navigate     = useNavigate()
  const { id }       = useParams()
  const isEdit       = Boolean(id)
  const fileInputRef = useRef()

  const [loading,      setLoading]      = useState(false)
  const [previews,     setPreviews]     = useState([])
  const [existingImgs, setExistingImgs] = useState([])
  const [category,     setCategory]     = useState('')

  // Track "Other" custom color inputs per variant row
  const [customColors, setCustomColors] = useState({})

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors }, reset,
  } = useForm({
    defaultValues: {
      variants: [{ size: '', color: '', stock: 1, sku: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const watchCategory = watch('category')

  // ── Load product for editing ───────────────────────────────────────────────
  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        try {
          const { data } = await getProductAPI(id)
          const p = data.product
          reset({
            title:        p.title,
            description:  p.description,
            brand:        p.brand,
            category:     p.category,
            subCategory:  p.subCategory,
            mrp:          p.mrp,
            sellingPrice: p.sellingPrice,
            gstPercent:   p.gstPercent,
            weight:       p.weight,
            tags:         p.tags?.join(', ') || '',
            variants:     p.variants.length ? p.variants : [{ size: '', color: '', stock: 1, sku: '' }],
          })
          setCategory(p.category)
          setExistingImgs(p.images || [])
        } catch { toast.error('Failed to load product') }
      }
      load()
    }
  }, [id])

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const total = previews.length + existingImgs.length + files.length
    if (total > 8) { toast.error('Max 8 images allowed'); return }
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPreviews((prev) => [...prev, { file, url }])
    })
  }

  const removePreview  = (idx) => { URL.revokeObjectURL(previews[idx].url); setPreviews((p) => p.filter((_, i) => i !== idx)) }
  const removeExisting = (idx) => setExistingImgs((p) => p.filter((_, i) => i !== idx))

  // ── Add all sizes shortcut ─────────────────────────────────────────────────
  const addAllSizes = () => {
    const sizes   = getSizesForCategory(watchCategory)
    const current = fields.map((f) => f.size)
    sizes.forEach((size) => {
      if (!current.includes(size)) append({ size, color: '', stock: 0, sku: '' })
    })
  }

  // ── Handle "Other" color selection ────────────────────────────────────────
  const handleColorSelect = (i, value) => {
    setValue(`variants.${i}.color`, value === 'Other' ? '' : value)
    setCustomColors((prev) => ({ ...prev, [i]: value === 'Other' }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (form) => {
    if (previews.length === 0 && existingImgs.length === 0)
      return toast.error('Add at least 1 product image')
    if (!form.variants || form.variants.length === 0)
      return toast.error('Add at least 1 size/variant')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title',        form.title)
      fd.append('description',  form.description)
      fd.append('brand',        form.brand || '')
      fd.append('category',     form.category)
      fd.append('subCategory',  form.subCategory)
      fd.append('mrp',          form.mrp)
      fd.append('sellingPrice', form.sellingPrice)
      fd.append('gstPercent',   form.gstPercent || 5)
      fd.append('weight',       form.weight || 0.5)
      fd.append('variants',     JSON.stringify(form.variants))

      const tagsArr = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      fd.append('tags', JSON.stringify(tagsArr))

      previews.forEach((p) => fd.append('images', p.file))
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

  // ── Derived lists ──────────────────────────────────────────────────────────
  const availableSizes  = getSizesForCategory(watchCategory)
  const availableColors = getColorsForCategory(watchCategory)

  // ── GST hint per category ──────────────────────────────────────────────────
  const gstHint = {
    jewellery:   'Gold/silver: 3% | Imitation: 5%',
    watches:     'Typically 18%',
    accessories: 'Typically 12–18%',
    shoes:       'Footwear ≤₹1000: 5% | Above: 12%',
  }[watchCategory] || 'Most garments: 5% or 12%'

  // Color column label
  const colorLabel = {
    jewellery: 'Metal / Finish',
    watches:   'Dial / Strap',
    shoes:     'Color',
  }[watchCategory] || 'Color / Finish'

  // ─────────────────────────────────────────────────────────────────────────
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

              {/* Basic Info */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Product Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'Min 10 characters' } })}
                      placeholder="e.g. Men's Stainless Steel Analog Watch"
                      className="input-field"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                      rows={4}
                      placeholder="Material, dimensions, features, care instructions..."
                      className="input-field resize-none"
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input {...register('brand')} placeholder="e.g. Titan, Fossil, Malabar" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input {...register('tags')} placeholder="gold, casual, gift" className="input-field" />
                      <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register('category', { required: 'Select category' })}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setValue('subCategory', '')
                        setCustomColors({})
                      }}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <optgroup label="Clothing">
                        <option value="men">Men — Clothing</option>
                        <option value="women">Women — Clothing</option>
                        <option value="kids">Kids — Clothing</option>
                      </optgroup>
                      <optgroup label="Footwear & Accessories">
                        <option value="shoes">Men's Shoes</option>
                        <option value="watches">Men's Watches</option>
                        <option value="accessories">Accessories</option>
                      </optgroup>
                      <optgroup label="Jewellery">
                        <option value="jewellery">Jewellery</option>
                      </optgroup>
                    </select>
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-category <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register('subCategory', { required: 'Select sub-category' })}
                      className="input-field"
                      disabled={!watchCategory}
                    >
                      <option value="">Select...</option>
                      {(SUB_CATEGORIES[watchCategory] || []).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
                  </div>
                </div>

                {watchCategory && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-xs text-blue-600 font-medium">
                      {CATEGORY_LABELS[watchCategory]}
                    </span>
                    <span className="text-xs text-blue-400">
                      — {(SUB_CATEGORIES[watchCategory] || []).length} sub-categories available
                    </span>
                  </div>
                )}
              </div>

              {/* Variants / Sizes */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {['watches', 'jewellery', 'accessories'].includes(watchCategory)
                      ? 'Variants & Stock'
                      : 'Sizes & Stock'}
                  </h3>
                  <div className="flex gap-2">
                    {watchCategory && (
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

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2 px-1">
                  <div className="col-span-3">
                    {['watches', 'accessories'].includes(watchCategory) ? 'Variant' : 'Size'}
                  </div>
                  <div className="col-span-3">{colorLabel}</div>
                  <div className="col-span-3">Stock qty</div>
                  <div className="col-span-2">SKU</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2">
                  {fields.map((field, i) => (
                    <div key={field.id} className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 items-center">

                        {/* Size / Variant */}
                        <div className="col-span-3">
                          {watchCategory ? (
                            <select
                              {...register(`variants.${i}.size`, { required: true })}
                              className="input-field text-sm py-2"
                            >
                              <option value="">
                                {['watches', 'accessories'].includes(watchCategory) ? 'Variant' : 'Size'}
                              </option>
                              {availableSizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              {...register(`variants.${i}.size`, { required: true })}
                              placeholder="Size"
                              className="input-field text-sm py-2"
                            />
                          )}
                        </div>

                        {/* Color / Finish — dropdown when category selected */}
                        <div className="col-span-3">
                          {watchCategory ? (
                            <select
                              className="input-field text-sm py-2"
                              defaultValue=""
                              onChange={(e) => handleColorSelect(i, e.target.value)}
                            >
                              <option value="">{colorLabel}</option>
                              {availableColors.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              {...register(`variants.${i}.color`)}
                              placeholder="Color / Finish"
                              className="input-field text-sm py-2"
                            />
                          )}
                        </div>

                        {/* Stock */}
                        <div className="col-span-3">
                          <input
                            {...register(`variants.${i}.stock`, { required: true, min: 0, valueAsNumber: true })}
                            type="number" min="0" placeholder="0"
                            className="input-field text-sm py-2"
                          />
                        </div>

                        {/* SKU */}
                        <div className="col-span-2">
                          <input
                            {...register(`variants.${i}.sku`)}
                            placeholder="SKU"
                            className="input-field text-sm py-2"
                          />
                        </div>

                        {/* Delete */}
                        <div className="col-span-1">
                          <button type="button" onClick={() => {
                            remove(i)
                            setCustomColors((prev) => {
                              const next = { ...prev }
                              delete next[i]
                              return next
                            })
                          }} disabled={fields.length === 1}
                            className="text-red-400 hover:text-red-600 disabled:opacity-30 p-1">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Custom color input when "Other" is selected */}
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

                {/* Jewellery material note */}
                {watchCategory === 'jewellery' && (
                  <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    💡 Select the metal type from the <strong>Metal / Finish</strong> dropdown (e.g. 22K Gold, 925 Silver, Rose Gold). Choose <em>Other</em> to type a custom value.
                  </p>
                )}
              </div>
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MRP (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('mrp', { required: 'MRP required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })}
                      type="number" placeholder="999"
                      className="input-field"
                    />
                    {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('sellingPrice', { required: 'Selling price required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })}
                      type="number" placeholder="799"
                      className="input-field"
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
                      {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{gstHint}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {watchCategory === 'jewellery' ? 'Weight (grams)' : 'Shipping Weight (kg)'}
                    </label>
                    <input
                      {...register('weight', { valueAsNumber: true })}
                      type="number"
                      step={watchCategory === 'jewellery' ? '0.01' : '0.1'}
                      placeholder={watchCategory === 'jewellery' ? '5.00' : '0.5'}
                      className="input-field"
                    />
                    {watchCategory === 'jewellery' && (
                      <p className="text-xs text-gray-400 mt-1">Net weight in grams (for hallmarking)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit (mobile) */}
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