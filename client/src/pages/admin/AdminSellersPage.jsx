import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiCheck, FiX, FiEye, FiAlertCircle, FiMenu, FiRefreshCw, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllSellersAPI, approveSellerAPI, rejectSellerAPI, suspendSellerAPI, getSellerByIdAPI } from '../../api/adminAPI.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import NotificationBell from '../../components/common/NotificationBell.jsx'

const STATUS_TABS = [
  { key: '',          label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'approved',  label: 'Approved'  },
  { key: 'rejected',  label: 'Rejected'  },
  { key: 'suspended', label: 'Suspended' },
]

const STATUS_STYLE = {
  pending:   { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  approved:  { bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
  rejected:  { bg: '#FEE2E2', color: '#DC2626', dot: '#F87171' },
  suspended: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminSellersPage() {
  const [sideOpen,    setSideOpen]    = useState(false)
  const [sellers,     setSellers]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [status,      setStatus]      = useState('pending')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [selected,    setSelected]    = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [reason,      setReason]      = useState('')
  const [actionLoad,  setActionLoad]  = useState(false)
  const LIMIT = 10

  const fetchSellers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllSellersAPI({ page, limit: LIMIT, status: status || undefined, search: search || undefined })
      setSellers(data.data)
      setTotal(data.pagination.total)
    } catch { toast.error('Failed to load sellers') }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { fetchSellers() }, [fetchSellers])

  const openDetail = async (id) => {
    try { const { data } = await getSellerByIdAPI(id); setSelected(data) }
    catch { toast.error('Failed to load seller details') }
  }

  const handleApprove = async (id) => {
    setActionLoad(true)
    try { await approveSellerAPI(id); toast.success('Seller approved!'); setSelected(null); fetchSellers() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoad(false) }
  }

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Enter rejection reason')
    setActionLoad(true)
    try {
      await rejectSellerAPI(rejectModal.sellerId, reason)
      toast.success('Seller rejected')
      setRejectModal(null); setReason(''); setSelected(null); fetchSellers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoad(false) }
  }

  const handleSuspend = async (id) => {
    setActionLoad(true)
    try { await suspendSellerAPI(id); toast.success('Status updated'); fetchSellers() }
    catch { toast.error('Failed') }
    finally { setActionLoad(false) }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const f = 'Poppins, sans-serif'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: f, background: '#F9F9FB' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: 'white', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBF0', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSideOpen(true)} style={{ background: '#F9F9FB', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex' }} className="lg:hidden">☰</button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Sellers</h1>
            <span style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', padding: '3px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{total} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' }}>AD</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>

          {/* Search + refresh */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#C0C0D0' }} size={15} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, email, business, GSTIN..."
                style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #EBEBF0', borderRadius: '12px', fontSize: '13px', outline: 'none', fontFamily: f, boxSizing: 'border-box', background: 'white' }} />
            </div>
            <button onClick={fetchSellers} style={{ width: '42px', height: '42px', border: '1px solid #EBEBF0', borderRadius: '12px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              <FiRefreshCw size={15} />
            </button>
          </div>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {STATUS_TABS.map(tab => (
              <button key={tab.key} onClick={() => { setStatus(tab.key); setPage(1) }}
                style={{ padding: '8px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: f, transition: 'all 0.2s',
                  background: status === tab.key ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'white',
                  color: status === tab.key ? 'white' : '#6B7280',
                  boxShadow: status === tab.key ? '0 4px 12px rgba(233,30,140,0.25)' : '0 1px 3px rgba(0,0,0,0.06)' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #EBEBF0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#FCFCFE' }}>
                    {['Seller', 'Business', 'GSTIN', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #EBEBF0' }}>
                      {Array(7).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '14px 16px' }}>
                          <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '6px', width: '75%', animation: 'pulse 1.5s infinite' }} />
                        </td>
                      ))}
                    </tr>
                  )) : sellers.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
                      No sellers found
                    </td></tr>
                  ) : sellers.map(seller => {
                    const st = seller.sellerDetails?.approvalStatus || 'pending'
                    const sc = STATUS_STYLE[st] || STATUS_STYLE.pending
                    return (
                      <tr key={seller._id} style={{ borderTop: '1px solid #EBEBF0', transition: 'background 0.15s', cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FDF6FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#FCE4F3,#EDD6FD)', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                              {getInitials(seller.name)}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', color: '#1A1A2E', margin: 0, fontSize: '13px' }}>{seller.name}</p>
                              <p style={{ fontSize: '11px', color: '#B0B0C0', margin: 0 }}>{seller.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B4B6B', fontSize: '13px' }}>{seller.sellerDetails?.businessName || '—'}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>{seller.sellerDetails?.gstin || '—'}</td>
                        <td style={{ padding: '14px 16px', color: '#4B4B6B' }}>{seller.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: sc.bg, color: sc.color }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot }} />
                            {st}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: '12px' }}>{new Date(seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => openDetail(seller._id)}
                              style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #EBEBF0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.color = '#E91E8C' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.color = '#6B7280' }}>
                              <FiEye size={13} />
                            </button>
                            {st === 'pending' && <>
                              <button onClick={() => handleApprove(seller._id)}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#DCFCE7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                                <FiCheck size={13} />
                              </button>
                              <button onClick={() => setRejectModal({ sellerId: seller._id, sellerName: seller.name })}
                                style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                                <FiX size={13} />
                              </button>
                            </>}
                            {st === 'approved' && (
                              <button onClick={() => handleSuspend(seller._id)}
                                style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#F1F5F9', color: '#64748B', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: f }}>
                                Suspend
                              </button>
                            )}
                            {st === 'suspended' && (
                              <button onClick={() => handleSuspend(seller._id)}
                                style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#DCFCE7', color: '#16A34A', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: f }}>
                                Unsuspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #EBEBF0', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Showing {sellers.length} of {total}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '6px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '12px', fontFamily: f }}>← Prev</button>
                  <span style={{ padding: '6px 14px', fontSize: '12px', color: '#4B4B6B', fontWeight: '600' }}>Page {page}/{totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '6px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '12px', fontFamily: f }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Seller Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EBEBF0' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Seller Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6B7280' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                {[
                  { label: 'Name', value: selected.seller?.name },
                  { label: 'Email', value: selected.seller?.email },
                  { label: 'Phone', value: selected.seller?.phone },
                  { label: 'Business', value: selected.seller?.sellerDetails?.businessName },
                  { label: 'Business Type', value: selected.seller?.sellerDetails?.businessType },
                  { label: 'Status', value: selected.seller?.sellerDetails?.approvalStatus },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: 0, textTransform: 'capitalize' }}>{item.value || '—'}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#EFF6FF', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#1D4ED8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tax & Bank</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  {[
                    { label: 'GSTIN', value: selected.seller?.sellerDetails?.gstin, mono: true },
                    { label: 'PAN', value: selected.seller?.sellerDetails?.pan, mono: true },
                    { label: 'Bank', value: selected.seller?.sellerDetails?.bankName },
                    { label: 'IFSC', value: selected.seller?.sellerDetails?.ifscCode, mono: true },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontWeight: '600', color: '#1A1A2E', margin: 0, fontFamily: item.mono ? 'monospace' : 'inherit', fontSize: item.mono ? '11px' : '12px' }}>{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selected.seller?.sellerDetails?.pickupAddress?.city && (
                <div style={{ background: '#F0FDF4', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pickup Address</p>
                  <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 4px' }}>{selected.seller.sellerDetails.pickupAddress.line1}, {selected.seller.sellerDetails.pickupAddress.city}, {selected.seller.sellerDetails.pickupAddress.state} — {selected.seller.sellerDetails.pickupAddress.pincode}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Contact: {selected.seller.sellerDetails.pickupAddress.contactName} · {selected.seller.sellerDetails.pickupAddress.contactPhone}</p>
                </div>
              )}

              {selected.products?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Recent Products ({selected.products.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selected.products.slice(0, 5).map(p => (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#F9F9FB', borderRadius: '10px' }}>
                        {p.images?.[0] && <img src={p.images[0]} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px', background: '#E2E8F0' }} alt="" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A2E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>₹{p.sellingPrice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.seller?.sellerDetails?.approvalStatus === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #EBEBF0' }}>
                  <button onClick={() => handleApprove(selected.seller._id)} disabled={actionLoad}
                    style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FiCheck size={15} /> Approve Seller
                  </button>
                  <button onClick={() => setRejectModal({ sellerId: selected.seller._id, sellerName: selected.seller.name })}
                    style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', fontFamily: f, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FiX size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', background: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertCircle size={22} color="#DC2626" />
              </div>
              <div>
                <p style={{ fontWeight: '700', color: '#1A1A2E', fontSize: '16px', margin: 0, fontFamily: f }}>Reject Seller</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{rejectModal.sellerName}</p>
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
                {actionLoad ? 'Rejecting...' : 'Reject Seller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}