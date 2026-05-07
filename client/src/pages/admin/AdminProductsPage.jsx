import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiCheck, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllProductsAdminAPI, approveProductAPI, rejectProductAPI } from '../../api/adminAPI.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import NotificationBell from '../../components/common/NotificationBell.jsx'

const STATUS_STYLE = {
  active:      { bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
  pending:     { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  rejected:    { bg: '#FEE2E2', color: '#DC2626', dot: '#F87171' },
  out_of_stock:{ bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
}
const CAT_STYLE = {
  men:   { bg: '#EFF6FF', color: '#1D4ED8' },
  women: { bg: '#FDF4FF', color: '#A21CAF' },
  kids:  { bg: '#FFF7ED', color: '#C2410C' },
}
const TABS = [
  { key: 'pending',  label: '⏳ Pending'  },
  { key: '',         label: 'All'          },
  { key: 'active',   label: '✅ Active'    },
  { key: 'rejected', label: '❌ Rejected'  },
]

const f = 'Poppins, sans-serif'

export default function AdminProductsPage() {
  const [sideOpen,    setSideOpen]    = useState(false)
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [status,      setStatus]      = useState('pending')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [selected,    setSelected]    = useState(null)
  const [imgIdx,      setImgIdx]      = useState(0)
  const [rejectModal, setRejectModal] = useState(null)
  const [reason,      setReason]      = useState('')
  const [actionLoad,  setActionLoad]  = useState(false)
  const LIMIT = 12

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllProductsAdminAPI({ page, limit: LIMIT, status: status || undefined, search: search || undefined })
      setProducts(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleApprove = async (id) => {
    setActionLoad(true)
    try { await approveProductAPI(id); toast.success('✅ Product approved!'); setSelected(null); fetchProducts() }
    catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActionLoad(false) }
  }

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Enter rejection reason')
    setActionLoad(true)
    try {
      await rejectProductAPI(rejectModal.productId, reason)
      toast.success('Product rejected')
      setRejectModal(null); setReason(''); setSelected(null); fetchProducts()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActionLoad(false) }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: f, background: '#F9F9FB' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: 'white', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBF0', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSideOpen(true)} style={{ background: '#F9F9FB', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex' }} className="lg:hidden">☰</button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Products</h1>
            <span style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', padding: '3px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{total} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' }}>AD</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>

          {/* Search */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#C0C0D0' }} size={15} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search products..."
                style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #EBEBF0', borderRadius: '12px', fontSize: '13px', fontFamily: f, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={fetchProducts} style={{ width: '42px', height: '42px', border: '1px solid #EBEBF0', borderRadius: '12px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              <FiRefreshCw size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => { setStatus(tab.key); setPage(1) }}
                style={{ padding: '8px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: f, transition: 'all 0.2s',
                  background: status === tab.key ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'white',
                  color: status === tab.key ? 'white' : '#6B7280',
                  boxShadow: status === tab.key ? '0 4px 12px rgba(233,30,140,0.25)' : '0 1px 3px rgba(0,0,0,0.06)' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBF0' }}>
                  <div style={{ height: '200px', background: '#F1F5F9' }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '80%', marginBottom: '8px' }} />
                    <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>👕</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 8px', fontFamily: f }}>No products found</h3>
              <p style={{ fontSize: '14px' }}>{status === 'pending' ? 'No products waiting for approval' : 'Products will appear here'}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
                {products.map(product => {
                  const sc = STATUS_STYLE[product.status] || STATUS_STYLE.pending
                  const cc = CAT_STYLE[product.category] || { bg: '#F1F5F9', color: '#64748B' }
                  const disc = product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
                  return (
                    <div key={product._id}
                      onClick={() => { setSelected(product); setImgIdx(0) }}
                      style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBF0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(233,30,140,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={product.images?.[0]} alt={product.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', background: '#F8FAFC', display: 'block' }}
                          onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                        {disc > 0 && <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>{disc}% OFF</span>}
                      </div>
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>{product.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                          {disc > 0 && <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '700', background: cc.bg, color: cc.color, textTransform: 'capitalize' }}>{product.category}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '700', background: sc.bg, color: sc.color }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot }} />{product.status}
                          </span>
                        </div>
                        {product.seller && <p style={{ fontSize: '10px', color: '#94A3B8', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>by {product.seller?.sellerDetails?.businessName || product.seller?.name}</p>}
                        {product.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleApprove(product._id)} disabled={actionLoad}
                              style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <FiCheck size={11} /> Approve
                            </button>
                            <button onClick={() => setRejectModal({ productId: product._id, productTitle: product.title })}
                              style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <FiX size={11} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '8px 18px', border: '1px solid #EBEBF0', borderRadius: '10px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontFamily: f, fontSize: '13px', fontWeight: '600' }}>← Prev</button>
                  <span style={{ fontSize: '13px', color: '#4B4B6B', fontWeight: '600' }}>Page {page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '8px 18px', border: '1px solid #EBEBF0', borderRadius: '10px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontFamily: f, fontSize: '13px', fontWeight: '600' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #EBEBF0' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Product Review</h2>
              <button onClick={() => setSelected(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {selected.images?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <img src={selected.images[imgIdx]} alt="" style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '14px', background: '#F1F5F9', display: 'block' }} />
                  {selected.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto' }}>
                      {selected.images.map((img, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          style={{ flexShrink: 0, width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${imgIdx === i ? '#E91E8C' : 'transparent'}`, cursor: 'pointer', padding: 0 }}>
                          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 6px', fontFamily: f }}>{selected.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 18px', lineHeight: '1.7' }}>{selected.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'MRP', val: `₹${selected.mrp}`, bg: '#F9F9FB', color: '#4B4B6B' },
                  { label: 'Selling', val: `₹${selected.sellingPrice}`, bg: '#F0FDF4', color: '#16A34A' },
                  { label: 'Discount', val: `${Math.round(((selected.mrp - selected.sellingPrice) / selected.mrp) * 100)}%`, bg: '#FDF0F8', color: '#E91E8C' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 4px' }}>{item.label}</p>
                    <p style={{ fontWeight: '700', color: item.color, margin: 0, fontSize: '16px' }}>{item.val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Category', value: `${selected.category} › ${selected.subCategory}` },
                  { label: 'Brand', value: selected.brand || '—' },
                  { label: 'GST', value: `${selected.gstPercent}%` },
                  { label: 'Seller', value: selected.seller?.sellerDetails?.businessName || selected.seller?.name },
                ].map(item => (
                  <div key={item.label} style={{ background: '#F9F9FB', borderRadius: '10px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: 0, textTransform: 'capitalize' }}>{item.value || '—'}</p>
                  </div>
                ))}
              </div>

              {selected.variants?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>Variants ({selected.variants.length})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selected.variants.map((v, i) => (
                      <span key={i} style={{ fontSize: '11px', background: '#F1F5F9', color: '#374151', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                        {v.size}{v.color ? ` / ${v.color}` : ''} — {v.stock} pcs
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #EBEBF0' }}>
                  <button onClick={() => handleApprove(selected._id)} disabled={actionLoad}
                    style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FiCheck size={16} /> {actionLoad ? 'Approving...' : 'Approve & Go Live'}
                  </button>
                  <button onClick={() => setRejectModal({ productId: selected._id, productTitle: selected.title })}
                    style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FiX size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', background: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertCircle size={22} color="#DC2626" />
              </div>
              <div>
                <p style={{ fontWeight: '700', color: '#1A1A2E', fontSize: '16px', margin: 0, fontFamily: f }}>Reject Product</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rejectModal.productTitle}</p>
              </div>
            </div>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason for rejection (seller will see this)..." rows={4}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #EBEBF0', borderRadius: '12px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: f, boxSizing: 'border-box', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setRejectModal(null); setReason('') }}
                style={{ flex: 1, padding: '12px', border: '1px solid #EBEBF0', background: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontFamily: f, fontSize: '13px', color: '#6B7280' }}>Cancel</button>
              <button onClick={handleReject} disabled={actionLoad}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontFamily: f, fontSize: '13px' }}>
                {actionLoad ? 'Rejecting...' : 'Reject Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}