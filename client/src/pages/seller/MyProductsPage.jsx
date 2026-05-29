import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiPackage, FiSearch,
  FiRefreshCw, FiUploadCloud, FiFilter, FiChevronDown,
  FiAlertTriangle, FiInfo, FiGrid, FiList,
} from 'react-icons/fi'
import { getMyProductsAPI, deleteProductAPI } from '../../api/sellerAPI.js'

const f = 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'

/* ── Tab definitions ──────────────────────────────────────────────────────── */
const STATUS_TABS = [
  { key: 'active',    label: 'Active' },
  { key: 'pending',   label: 'Activation Pending' },
  { key: 'blocked',   label: 'Blocked' },
  { key: 'rejected',  label: 'Paused' },
]

const STOCK_TABS = [
  { key: '',            label: 'All Stock' },
  { key: 'out_of_stock',label: 'Out of Stock' },
  { key: 'low_stock',   label: 'Low Stock' },
]

const SORT_OPTIONS = [
  'Highest Estimated Orders',
  'Lowest Estimated Orders',
  'Newest First',
  'Oldest First',
  'Price: High to Low',
  'Price: Low to High',
]

const CATEGORIES = ['All Categories', 'Men', 'Women', 'Kids', 'Accessories', 'Footwear']

/* ── Status badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active:       { bg: '#DCFCE7', color: '#16A34A', label: 'Active' },
    pending:      { bg: '#FEF9C3', color: '#CA8A04', label: 'Pending' },
    rejected:     { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
    out_of_stock: { bg: '#FFEDD5', color: '#EA580C', label: 'Out of Stock' },
    blocked:      { bg: '#F3F4F6', color: '#6B7280', label: 'Blocked' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

const resolveName = (field) => {
  if (!field) return ''
  if (typeof field === 'object' && field.name) return field.name
  if (typeof field === 'string') return field
  return ''
}

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function MyProductsPage() {
  const navigate = useNavigate()

  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [statusTab,  setStatusTab]  = useState('active')
  const [stockTab,   setStockTab]   = useState('')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)
  const [counts,     setCounts]     = useState({ active: 0, pending: 0, blocked: 0, rejected: 0 })
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('All Categories')
  const [sort,       setSort]       = useState(SORT_OPTIONS[0])
  const [showSort,   setShowSort]   = useState(false)
  const [showCat,    setShowCat]    = useState(false)
  const [viewMode,   setViewMode]   = useState('grid')  // 'grid' | 'list'

  const LIMIT = 12

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT, status: statusTab || undefined }
      if (stockTab === 'out_of_stock') params.stock = 'out'
      if (stockTab === 'low_stock')    params.stock = 'low'
      const { data } = await getMyProductsAPI(params)
      setProducts(data.data || [])
      setTotal(data.pagination?.total || 0)
      // fetch counts for each tab
      const countRes = await Promise.allSettled(
        STATUS_TABS.map(t => getMyProductsAPI({ page: 1, limit: 1, status: t.key }))
      )
      const c = {}
      STATUS_TABS.forEach((t, i) => {
        c[t.key] = countRes[i].status === 'fulfilled' ? (countRes[i].value.data.pagination?.total || 0) : 0
      })
      setCounts(c)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, statusTab, stockTab])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    try {
      await deleteProductAPI(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch { toast.error('Failed to delete') }
  }

  const filtered = search
    ? products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()))
    : products

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: f }}>

      {/* ── Alert banner (like Meesho's E-Signature warning) ── */}
      <div style={{ background: '#FFF7F0', borderBottom: '1px solid #FDDCBC', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertTriangle size={15} style={{ color: '#EA580C', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Keep your product details updated!</span>
            <span style={{ fontSize: '12px', color: '#9A3412', marginLeft: '6px' }}>Accurate stock & pricing improves your order rate.</span>
          </div>
        </div>
        <button onClick={() => navigate('/seller/products/add')}
          style={{ fontSize: '12px', fontWeight: '700', color: '#7C3AED', background: 'none', border: '1.5px solid #7C3AED', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontFamily: f, whiteSpace: 'nowrap', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7C3AED' }}>
          Add Product
        </button>
      </div>

      {/* ── Page header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 28px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Inventory</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={14} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by Catalog ID/Style ID/SKU ID"
                style={{ paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', outline: 'none', width: '260px', fontFamily: f, color: '#374151', background: '#FAFAFA', transition: 'all 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.background = '#FAFAFA' }} />
            </div>
            {/* Catalog Upload */}
            <button onClick={() => navigate('/seller/products/add')}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: f, boxShadow: '0 2px 8px rgba(124,58,237,0.3)', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <FiUploadCloud size={15} /> Catalog Upload
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '0', marginTop: '12px', overflowX: 'auto' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab.key} onClick={() => { setStatusTab(tab.key); setPage(1); setStockTab('') }}
              style={{
                padding: '10px 18px', background: 'none', border: 'none',
                borderBottom: statusTab === tab.key ? '2.5px solid #7C3AED' : '2.5px solid transparent',
                cursor: 'pointer', fontSize: '13px', fontWeight: statusTab === tab.key ? '700' : '500',
                color: statusTab === tab.key ? '#7C3AED' : '#6B7280',
                whiteSpace: 'nowrap', transition: 'all 0.15s', fontFamily: f,
              }}
              onMouseEnter={e => { if (statusTab !== tab.key) e.currentTarget.style.color = '#374151' }}
              onMouseLeave={e => { if (statusTab !== tab.key) e.currentTarget.style.color = '#6B7280' }}>
              {tab.label}
              <span style={{ marginLeft: '5px', fontSize: '12px', color: statusTab === tab.key ? '#7C3AED' : '#9CA3AF', fontWeight: '600' }}>
                ({counts[tab.key] ?? 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sub header: stock tabs + filter + sort ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {/* Stock sub-tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {STOCK_TABS.map(tab => (
            <button key={tab.key} onClick={() => { setStockTab(tab.key); setPage(1) }}
              style={{
                padding: '9px 16px', background: 'none', border: 'none',
                borderBottom: stockTab === tab.key ? '2px solid #111827' : '2px solid transparent',
                cursor: 'pointer', fontSize: '12px', fontWeight: stockTab === tab.key ? '700' : '500',
                color: stockTab === tab.key ? '#111827' : '#6B7280',
                whiteSpace: 'nowrap', fontFamily: f, transition: 'all 0.15s',
              }}>
              {tab.label}
              {tab.key === '' && <span style={{ marginLeft: '4px', color: stockTab === tab.key ? '#111827' : '#9CA3AF' }}>({total})</span>}
            </button>
          ))}
        </div>

        {/* Right: Bulk update */}
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'none', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: f, transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}>
          <FiRefreshCw size={13} /> Bulk Stock Update
        </button>
      </div>

      {/* ── Filter + Sort bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Filter by category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Filter by :</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowCat(v => !v); setShowSort(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#374151', cursor: 'pointer', fontFamily: f, minWidth: '160px', justifyContent: 'space-between' }}>
              {category} <FiChevronDown size={13} style={{ transform: showCat ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showCat && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '180px', overflow: 'hidden' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => { setCategory(c); setShowCat(false) }}
                    style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: category === c ? '#F5F3FF' : 'none', border: 'none', fontSize: '12px', fontWeight: category === c ? '700' : '400', color: category === c ? '#7C3AED' : '#374151', cursor: 'pointer', fontFamily: f, transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (category !== c) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (category !== c) e.currentTarget.style.background = 'none' }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: view toggle + sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
            {[{ mode: 'grid', Icon: FiGrid }, { mode: 'list', Icon: FiList }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{ padding: '7px 10px', background: viewMode === mode ? '#F5F3FF' : '#fff', border: 'none', cursor: 'pointer', color: viewMode === mode ? '#7C3AED' : '#9CA3AF', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', whiteSpace: 'nowrap' }}>Sort catalogs by :</span>
            <button onClick={() => { setShowSort(v => !v); setShowCat(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#374151', cursor: 'pointer', fontFamily: f, minWidth: '220px', justifyContent: 'space-between' }}>
              {sort} <FiChevronDown size={13} style={{ transform: showSort ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showSort && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '240px', overflow: 'hidden' }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setSort(opt); setShowSort(false) }}
                    style={{ display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left', background: sort === opt ? '#F5F3FF' : 'none', border: 'none', fontSize: '12px', fontWeight: sort === opt ? '700' : '400', color: sort === opt ? '#7C3AED' : '#374151', cursor: 'pointer', fontFamily: f, transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (sort !== opt) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (sort !== opt) e.currentTarget.style.background = 'none' }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px 28px' }} onClick={() => { setShowSort(false); setShowCat(false) }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #F3F4F6' }}>
                <div style={{ height: viewMode === 'list' ? '0' : '180px', background: 'linear-gradient(90deg,#F9FAFB,#F3F4F6,#F9FAFB)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: '12px', display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column', gap: '8px', alignItems: viewMode === 'list' ? 'center' : 'stretch' }}>
                  {viewMode === 'list' && <div style={{ width: '64px', height: '64px', background: '#F3F4F6', flexShrink: 0, borderRadius: '6px' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '11px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '7px', width: '70%' }} />
                    <div style={{ height: '11px', background: '#F3F4F6', borderRadius: '4px', width: '45%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* ── Empty state (Meesho-style) ── */
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
            {/* Grid icon like Meesho */}
            <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
              {[0,0,0,1].map((round, i) => (
                <div key={i} style={{ width: '36px', height: '36px', border: '2px solid #D1D5DB', borderRadius: round ? '50%' : '4px', background: 'transparent' }} />
              ))}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '0 0 8px' }}>No Catalogs</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px', lineHeight: 1.6 }}>
              Upload catalogs through our website on the desktop.<br />Once done, you can view and manage them here.
            </p>
            <button onClick={() => navigate('/seller/products/add')}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: f, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              + Add First Product
            </button>
          </div>

        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
              {filtered.map(product => {
                const disc = product.mrp > product.sellingPrice
                  ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
                return (
                  <div key={product._id}
                    style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #F3F4F6', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}>

                    {/* Image */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img src={product.images?.[0] || ''} alt={product.title}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', background: '#F9FAFB', display: 'block' }}
                        onError={e => { e.target.style.background = '#F3F4F6'; e.target.src = '' }} />
                      {disc > 0 && (
                        <span style={{ position: 'absolute', top: '8px', left: '0', background: '#7C3AED', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px' }}>
                          {disc}% OFF
                        </span>
                      )}
                      {/* Hover actions */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        <button onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                          style={{ width: '34px', height: '34px', background: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <FiEdit2 size={14} style={{ color: '#7C3AED' }} />
                        </button>
                        <button onClick={() => handleDelete(product._id, product.title)}
                          style={{ width: '34px', height: '34px', background: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <FiTrash2 size={14} style={{ color: '#DC2626' }} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 3px' }}>
                        {product.brand || resolveName(product.category)}
                      </p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#111827', margin: '0 0 8px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                        {disc > 0 && <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <StatusBadge status={product.status} />
                        <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                          Stock: {product.stock ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', background: '#fff', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontFamily: f, color: '#374151' }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: page === p ? '800' : '500', border: page === p ? '1.5px solid #7C3AED' : '1px solid #E5E7EB', background: page === p ? '#EDE9FE' : '#fff', borderRadius: '6px', cursor: 'pointer', color: page === p ? '#7C3AED' : '#374151', fontFamily: f }}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', background: '#fff', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontFamily: f, color: '#374151' }}>
                  Next →
                </button>
              </div>
            )}
          </>

        ) : (
          /* ── LIST VIEW ── */
          <>
            <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
              {/* List header */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 100px 80px 100px', gap: '0', padding: '10px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                {['', 'Product', 'Category', 'Price', 'MRP', 'Stock', 'Status'].map((h, i) => (
                  <p key={i} style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</p>
                ))}
              </div>

              {filtered.map((product, idx) => {
                const disc = product.mrp > product.sellingPrice
                  ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
                return (
                  <div key={product._id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 100px 80px 100px', gap: '0', padding: '12px 16px', borderBottom: idx < filtered.length - 1 ? '1px solid #F9FAFB' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <img src={product.images?.[0] || ''} alt={product.title}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: '#F3F4F6', display: 'block' }}
                      onError={e => { e.target.src = ''; e.target.style.background = '#F3F4F6' }} />
                    <div style={{ paddingRight: '12px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111827', lineHeight: 1.4 }}>{product.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#9CA3AF' }}>{product.brand}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                          style={{ fontSize: '10px', fontWeight: '600', color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontFamily: f }}>Edit</button>
                        <button onClick={() => handleDelete(product._id, product.title)}
                          style={{ fontSize: '10px', fontWeight: '600', color: '#DC2626', background: '#FEE2E2', border: 'none', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontFamily: f }}>Delete</button>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'capitalize' }}>{resolveName(product.category)}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.mrp}</span>
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>{product.stock ?? '—'}</span>
                    <StatusBadge status={product.status} />
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', background: '#fff', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontFamily: f, color: '#374151' }}>← Prev</button>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', border: '1px solid #D1D5DB', background: '#fff', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontFamily: f, color: '#374151' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}