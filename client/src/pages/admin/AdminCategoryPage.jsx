import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiMenu, FiBell, FiLayers, FiPlus, FiTrash2,
  FiSave, FiEdit2, FiX, FiChevronDown, FiCheck,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import useAuthStore from '../../context/useAuthStore.js'
import {
  getCategoriesAPI,
  getItemTypesAPI,
  getAdminAdditionalDetailsAPI,
  upsertAdditionalDetailsAPI,
} from '../../api/categoryAPI.js'

const FIELD_TYPES = ['select', 'text']

const DEFAULT_FIELD = { name: '', label: '', type: 'select', options: [], sortOrder: 0 }

export default function AdminCategoryPage() {
  const navigate          = useNavigate()
  const { user }          = useAuthStore()
  const [sideOpen,  setSideOpen]  = useState(false)

  // ── Data ─────────────────────────────────────────────────────
  const [allDetails,   setAllDetails]   = useState([])   // existing docs
  const [categories,   setCategories]   = useState([])
  const [itemTypes,    setItemTypes]    = useState([])
  const [loading,      setLoading]      = useState(true)

  // ── Form state ────────────────────────────────────────────────
  const [selCatId,     setSelCatId]     = useState('')
  const [selTypeId,    setSelTypeId]    = useState('')
  const [fields,       setFields]       = useState([{ ...DEFAULT_FIELD }])
  const [saving,       setSaving]       = useState(false)
  const [editingDoc,   setEditingDoc]   = useState(null)   // doc being edited

  // ── Options input per field ───────────────────────────────────
  const [optInput,     setOptInput]     = useState({})    // { fieldIdx: 'current text' }

  // ── Load on mount ─────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      getCategoriesAPI(),
      getAdminAdditionalDetailsAPI(),
    ]).then(([catRes, detRes]) => {
      setCategories(catRes.data.data)
      setAllDetails(detRes.data.data)
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  // ── Load item types when category changes ─────────────────────
  useEffect(() => {
    if (!selCatId) { setItemTypes([]); setSelTypeId(''); return }
    getItemTypesAPI(selCatId)
      .then(({ data }) => setItemTypes(data.data))
      .catch(() => toast.error('Failed to load item types'))
  }, [selCatId])

  // ── Load existing fields when cat+type selected ───────────────
  useEffect(() => {
    if (!selCatId || !selTypeId) return
    const existing = allDetails.find(
      d => d.categoryId?._id === selCatId && d.itemTypeId?._id === selTypeId
    )
    if (existing) {
      setFields(existing.fields.map(f => ({ ...f, options: f.options || [] })))
      setEditingDoc(existing)
    } else {
      setFields([{ ...DEFAULT_FIELD }])
      setEditingDoc(null)
    }
  }, [selCatId, selTypeId, allDetails])

  // ── Field helpers ─────────────────────────────────────────────
  const addField = () =>
    setFields(prev => [...prev, { ...DEFAULT_FIELD, sortOrder: prev.length }])

  const removeField = (idx) =>
    setFields(prev => prev.filter((_, i) => i !== idx))

  const updateField = (idx, key, value) =>
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f))

  const addOption = (idx) => {
    const val = (optInput[idx] || '').trim()
    if (!val) return
    setFields(prev => prev.map((f, i) =>
      i === idx ? { ...f, options: [...(f.options || []), val] } : f
    ))
    setOptInput(prev => ({ ...prev, [idx]: '' }))
  }

  const removeOption = (fieldIdx, optIdx) =>
    setFields(prev => prev.map((f, i) =>
      i === fieldIdx ? { ...f, options: f.options.filter((_, j) => j !== optIdx) } : f
    ))

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selCatId)  return toast.error('Select a category')
    if (!selTypeId) return toast.error('Select an item type')
    if (fields.some(f => !f.name || !f.label))
      return toast.error('All fields must have name and label')

    setSaving(true)
    try {
      const { data } = await upsertAdditionalDetailsAPI({
        categoryId: selCatId,
        itemTypeId: selTypeId,
        fields: fields.map((f, i) => ({ ...f, sortOrder: i })),
      })
      toast.success(editingDoc ? 'Updated successfully!' : 'Created successfully!')
      // Refresh list
      const detRes = await getAdminAdditionalDetailsAPI()
      setAllDetails(detRes.data.data)
      setEditingDoc(data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Quick edit from existing list ─────────────────────────────
  const handleEdit = (doc) => {
    setSelCatId(doc.categoryId._id)
    // itemTypes will load via useEffect, then we set type
    setTimeout(() => setSelTypeId(doc.itemTypeId._id), 300)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Derived ───────────────────────────────────────────────────
  const selectedCatName  = categories.find(c => c._id === selCatId)?.name  || ''
  const selectedTypeName = itemTypes.find(t => t._id === selTypeId)?.name  || ''

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar ── */}
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>
              <FiLayers className="text-white" size={15} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Category Manager</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Manage additional fields per category</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <FiBell size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#ec4899,#f97316)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 space-y-6 max-w-6xl w-full mx-auto">

          {/* ── Form Card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#fdf0f8,#f5f0ff)' }}>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">
                  {editingDoc ? '✏️ Edit Additional Fields' : '➕ Add Additional Fields'}
                </h2>
                {editingDoc && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingDoc.categoryId?.name} → {editingDoc.itemTypeId?.name}
                  </p>
                )}
              </div>
              {editingDoc && (
                <button onClick={() => {
                  setSelCatId(''); setSelTypeId('')
                  setFields([{ ...DEFAULT_FIELD }]); setEditingDoc(null)
                }}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  <FiX size={12} /> Clear
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">

              {/* Category + Item Type selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selCatId}
                      onChange={e => { setSelCatId(e.target.value); setSelTypeId('') }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                    >
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 text-gray-400" size={14} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Item Type <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selTypeId}
                      onChange={e => setSelTypeId(e.target.value)}
                      disabled={!selCatId}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 disabled:opacity-50"
                    >
                      <option value="">Select type...</option>
                      {itemTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 text-gray-400" size={14} />
                  </div>
                </div>
              </div>

              {/* Breadcrumb pill */}
              {selectedCatName && selectedTypeName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-600 font-medium">
                  <FiCheck size={11} />
                  {selectedCatName} → {selectedTypeName}
                  {editingDoc ? ' (editing)' : ' (new)'}
                </div>
              )}

              {/* Fields */}
              {selCatId && selTypeId && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fields</p>
                    <button onClick={addField}
                      className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 border border-pink-200 px-3 py-1.5 rounded-xl hover:bg-pink-50 transition-all">
                      <FiPlus size={12} /> Add Field
                    </button>
                  </div>

                  {fields.map((field, idx) => (
                    <div key={idx}
                      className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50 hover:border-pink-100 transition-all">

                      {/* Row 1: name, label, type, delete */}
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-500 mb-1 font-medium">Field Name</label>
                          <input
                            value={field.name}
                            onChange={e => updateField(idx, 'name', e.target.value.replace(/\s/g, ''))}
                            placeholder="e.g. sleeveType"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs text-gray-500 mb-1 font-medium">Display Label</label>
                          <input
                            value={field.label}
                            onChange={e => updateField(idx, 'label', e.target.value)}
                            placeholder="e.g. Sleeve Type"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-500 mb-1 font-medium">Type</label>
                          <select
                            value={field.type}
                            onChange={e => updateField(idx, 'type', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
                          >
                            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button onClick={() => removeField(idx)}
                            disabled={fields.length === 1}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Options (only for select type) */}
                      {field.type === 'select' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-2 font-medium">Options</label>

                          {/* Existing options */}
                          {field.options?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {field.options.map((opt, oi) => (
                                <span key={oi}
                                  className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs px-2 py-0.5 rounded-full text-gray-600">
                                  {opt}
                                  <button onClick={() => removeOption(idx, oi)}
                                    className="text-gray-300 hover:text-red-400 ml-0.5">
                                    <FiX size={9} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Add option input */}
                          <div className="flex gap-2">
                            <input
                              value={optInput[idx] || ''}
                              onChange={e => setOptInput(prev => ({ ...prev, [idx]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption(idx))}
                              placeholder="Type option and press Enter..."
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                            <button onClick={() => addOption(idx)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-pink-50 hover:text-pink-600 text-gray-500 text-xs rounded-lg font-medium transition-all">
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Save button */}
                  <div className="flex justify-end pt-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>
                      <FiSave size={14} />
                      {saving ? 'Saving...' : editingDoc ? 'Update Fields' : 'Save Fields'}
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholder when nothing selected */}
              {(!selCatId || !selTypeId) && (
                <div className="text-center py-10 text-gray-300">
                  <FiLayers size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Select Category + Item Type to manage fields</p>
                </div>
              )}

            </div>
          </div>

          {/* ── Existing Additional Details List ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm">Existing Additional Details</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-semibold">
                {allDetails.length} entries
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : allDetails.length === 0 ? (
              <div className="p-8 text-center text-gray-300">
                <FiLayers size={28} className="mx-auto mb-2" />
                <p className="text-sm">No entries yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {allDetails.map((doc) => (
                  <div key={doc._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                    <div className="flex-1 min-w-0">
                      {/* Breadcrumb */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-gray-700">
                          {doc.categoryId?.name}
                        </span>
                        <span className="text-gray-300 text-xs">→</span>
                        <span className="text-xs font-semibold text-pink-600">
                          {doc.itemTypeId?.name}
                        </span>
                      </div>
                      {/* Field pills */}
                      <div className="flex flex-wrap gap-1">
                        {doc.fields?.map((f, i) => (
                          <span key={i}
                            className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-medium">
                            {f.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="ml-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-pink-600 border border-gray-100 hover:border-pink-200 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                      <FiEdit2 size={11} /> Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}