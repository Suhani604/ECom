import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiBell, FiPlus, FiTrash2, FiEdit2, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import useAuthStore from '../../context/useAuthStore.js'

const TYPES = [
  { key: 'hero',     label: '🖼️ Hero Slider',    desc: 'Full-width banner on homepage' },
  { key: 'promo',    label: '🏷️ Promo Strip',     desc: 'Small offer banners' },
  { key: 'category', label: '📂 Category Banner', desc: 'Men, Women, Kids banners' },
]
const CATEGORIES = [
  { key: '', label: 'All / Home' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'kids', label: 'Kids' },
  { key: 'jewellery', label: 'Jewellery' },
]

const f = 'Poppins, sans-serif'

export default function AdminBannersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [sideOpen,  setSideOpen]  = useState(false)
  const [banners,   setBanners]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const fileRef = useRef()

  const [form, setForm] = useState({
    title: '', subtitle: '', imageUrl: '', link: '',
    type: 'hero', category: '', sortOrder: 0, isActive: true,
  })

  // ── Fetch all banners (admin) ──────────────────────────────────────────────
  const fetchBanners = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/banners/admin')
      setBanners(data.banners || [])          // successResponse spreads flat
    } catch {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [])

  // ── Image upload → Cloudinary ──────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setUploading(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
      })
      const { data } = await api.post('/banners/admin/upload', { image: base64 })
      setForm(f => ({ ...f, imageUrl: data.imageUrl }))   // flat response
      toast.success('Image uploaded!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Create / Update banner ─────────────────────────────────────────────────
  const handleSubmit = async () => {
if (!form.imageUrl && form.type !== 'promo') {
  toast.error('Banner image required')
  return
}
    try {
      if (editing) {
        await api.put(`/banners/admin/${editing}`, form)
        toast.success('Banner updated!')
      } else {
        await api.post('/banners/admin', form)
        toast.success('Banner created!')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ title: '', subtitle: '', imageUrl: '', link: '', type: 'hero', category: '', sortOrder: 0, isActive: true })
      fetchBanners()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
    }
  }

  const handleEdit = (banner) => {
    setEditing(banner._id)
    setForm({
      title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl,
      link: banner.link, type: banner.type, category: banner.category,
      sortOrder: banner.sortOrder, isActive: banner.isActive,
    })
    setShowForm(true)
  }

  const handleToggle = async (id) => {
    try {
      await api.patch(`/banners/admin/${id}/toggle`)
      fetchBanners()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await api.delete(`/banners/admin/${id}`)
      toast.success('Deleted')
      fetchBanners()
    } catch { toast.error('Failed') }
  }

  const filtered = activeTab === 'all' ? banners : banners.filter(b => b.type === activeTab)

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: f }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">Banner Management</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{banners.length} banners total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <FiBell size={18} />
            </button>
            <button
              onClick={() => {
                setShowForm(true); setEditing(null)
                setForm({ title: '', subtitle: '', imageUrl: '', link: '', type: 'hero', category: '', sortOrder: 0, isActive: true })
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>
              <FiPlus size={16} /> Add Banner
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#ec4899,#f97316)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 max-w-6xl w-full mx-auto">

          {/* Type tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {[{ key: 'all', label: 'All Banners' }, ...TYPES].map(t => (
              <button key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-4 py-2 rounded-xl text-sm border transition-all"
                style={{
                  background: activeTab === t.key ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'white',
                  color: activeTab === t.key ? 'white' : '#64748B',
                  border: activeTab === t.key ? 'transparent' : '1.5px solid #E2E8F0',
                  fontWeight: 600,
                }}>
                {t.label || '🌐 All Banners'}
              </button>
            ))}
          </div>

          {/* Banner grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div style={{ fontSize: 64, marginBottom: 16 }}>🖼️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No banners yet</h3>
              <p className="text-gray-400 mb-6">Click "Add Banner" to create your first banner</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(banner => (
                <div key={banner._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="relative h-40 bg-gray-100">
                    <img src={banner.imageUrl} alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                    <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ background: banner.type === 'hero' ? '#7C3AED' : banner.type === 'promo' ? '#E91E8C' : '#0ea5e9', color: 'white' }}>
                      {banner.type}
                    </span>
                    <button onClick={() => handleToggle(banner._id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg"
                      style={{ background: banner.isActive ? '#F0FDF4' : '#FFF1F2' }}
                      title={banner.isActive ? 'Active — click to hide' : 'Hidden — click to show'}>
                      {banner.isActive
                        ? <FiEye size={14} color="#16a34a" />
                        : <FiEyeOff size={14} color="#BE123C" />}
                    </button>
                    {!banner.isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-lg">HIDDEN</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-sm mb-1 truncate">{banner.title}</p>
                    {banner.subtitle && <p className="text-xs text-gray-400 mb-2 truncate">{banner.subtitle}</p>}
                    <div className="flex items-center gap-2 mb-3">
                      {banner.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium capitalize">
                          {banner.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">Order: {banner.sortOrder}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(banner)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                        <FiEdit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(banner._id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border border-red-100 text-red-500 hover:bg-red-50 transition-all">
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', fontFamily: f }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {editing ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditing(null) }}
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Image upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>BANNER IMAGE *</label>
                {form.imageUrl ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                    <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <button onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>×</button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                    {uploading ? (
                      <p style={{ color: '#7C3AED', fontSize: '13px', fontWeight: '600' }}>Uploading...</p>
                    ) : (
                      <>
                        <FiUpload size={24} color="#94A3B8" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', margin: 0 }}>Click to upload image</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>JPG, PNG up to 5MB — recommended 1200×450px</p>
                      </>
                    )}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Or paste image URL..."
                  style={{ width: '100%', marginTop: '8px', padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Title */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}> TITLE (optional)</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer Sale — Up to 70% Off"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Subtitle */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>SUBTITLE</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="e.g. Shop the latest trends"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Type + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>TYPE *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none' }}>
                    {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>CATEGORY</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none' }}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Link + Sort Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>LINK (optional)</label>
                  <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="/home or external URL"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>SORT ORDER</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.isActive ? '#7C3AED' : '#E2E8F0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: form.isActive ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                  {form.isActive ? 'Active — visible to buyers' : 'Hidden — not shown'}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowForm(false); setEditing(null) }}
                  style={{ flex: 1, padding: '11px', background: '#F1F5F9', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: f }}>
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: f }}>
                  {editing ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}