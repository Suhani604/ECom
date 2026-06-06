import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import useAuthStore from '../../context/useAuthStore.js'

const f = '"DM Sans", Poppins, sans-serif'

const ALL_STATUSES = ['placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled']
const STATUS_FLOW  = ['placed','confirmed','packed','shipped','out_for_delivery','delivered']

const STATUS_STYLE = {
  placed:           { bg:'#EFF6FF', color:'#1D4ED8',  label:'Placed' },
  confirmed:        { bg:'#EEF2FF', color:'#4338CA',  label:'Confirmed' },
  packed:           { bg:'#FFFBEB', color:'#B45309',  label:'Packed' },
  shipped:          { bg:'#FFF7ED', color:'#C2410C',  label:'Shipped' },
  out_for_delivery: { bg:'#F5F3FF', color:'#6D28D9',  label:'Out for Delivery' },
  delivered:        { bg:'#F0FDF4', color:'#15803D',  label:'Delivered' },
  cancelled:        { bg:'#FFF1F2', color:'#BE123C',  label:'Cancelled' },
  return_requested: { bg:'#FDF4FF', color:'#A21CAF',  label:'Return Requested' },
  returned:         { bg:'#F8FAFC', color:'#64748B',  label:'Returned' },
}

const TABS = [
  { key:'',                label:'All' },
  { key:'placed',          label:'Placed' },
  { key:'confirmed',       label:'Confirmed' },
  { key:'packed',          label:'Packed' },
  { key:'shipped',         label:'Shipped' },
  { key:'out_for_delivery',label:'Out for Delivery' },
  { key:'delivered',       label:'Delivered' },
  { key:'cancelled',       label:'Cancelled' },
]

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [sideOpen,  setSideOpen]  = useState(false)
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [updating,  setUpdating]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [assigning, setAssigning] = useState(null)
  
  const LIMIT = 15

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (status) params.status = status
      if (search.trim()) params.search = search.trim()
      const { data } = await api.get('/admin/orders', { params })
      setOrders(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order marked as ${STATUS_STYLE[newStatus]?.label || newStatus}`)
      fetchOrders()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status update failed')
    } finally { setUpdating(null) }
  }
  const assignDelivery = async (orderId) => {
  setAssigning(orderId)
  try {
    const { data } = await api.put(`/admin/orders/${orderId}/assign-delivery`)
    toast.success(`Assigned to ${data.data?.deliveryPartner?.name}! OTP: ${data.data?.otp}`)
    fetchOrders()
  } catch (e) {
    toast.error(e.response?.data?.message || 'No delivery partner available')
  } finally { setAssigning(null) }
}

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: f }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .tab-btn { padding:7px 14px; border:1.5px solid #E2E8F0; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; font-family:${f}; white-space:nowrap; background:white; color:#64748B; transition:all 0.15s; }
        .tab-btn:hover { border-color:#7C3AED; color:#7C3AED; }
        .tab-btn.active { background:linear-gradient(135deg,#7C3AED,#E91E8C); color:white; border-color:transparent; box-shadow:0 2px 8px rgba(124,58,237,0.3); }
        .next-btn { border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; font-family:${f}; padding:7px 13px; transition:all 0.15s; white-space:nowrap; }
        .next-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
        .next-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .order-card { background:white; border-radius:14px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.06); border:1px solid #F1F5F9; transition:box-shadow 0.2s; }
        .order-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.1); }
        @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
        .shimmer { background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:400px 100%; animation:shimmer 1.2s infinite; }
        .search-input { width:100%; padding:10px 16px 10px 40px; border:1.5px solid #E2E8F0; border-radius:10px; font-size:14px; font-family:${f}; outline:none; background:#FAFAFA; box-sizing:border-box; transition:border-color 0.15s; }
        .search-input:focus { border-color:#7C3AED; background:white; }
      `}</style>

      {/* ── Sidebar ── */}
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar (matches Dashboard) ── */}
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">All Orders</h1>
              {total > 0 && <p className="text-xs text-gray-400 hidden sm:block">{total} total orders</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize:'11px', background:'#FEF3C7', color:'#B45309', padding:'4px 10px', borderRadius:'20px', fontWeight:'700', border:'1px solid #FDE68A' }}>
              🔧 Dev Mode
            </span>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <FiBell size={18} />
            </button>
            <button onClick={fetchOrders}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 text-base">
              ↻
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background:'linear-gradient(135deg,#ec4899,#f97316)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        {/* ── Page body ── */}
        <main className="flex-1 p-5 sm:p-7 space-y-5 max-w-5xl w-full mx-auto">

          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'#94A3B8' }}>🔍</span>
            <input className="search-input" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by order ID or buyer name..." />
          </div>

          {/* Status tabs */}
          <div style={{ display:'flex', gap:'7px', overflowX:'auto', paddingBottom:'4px' }}>
            {TABS.map(tab => (
              <button key={tab.key} className={`tab-btn${status === tab.key ? ' active' : ''}`}
                onClick={() => { setStatus(tab.key); setPage(1) }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary chips */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[
              { label:'🆕 New',        stat:'placed',    color:'#1D4ED8', bg:'#EFF6FF' },
              { label:'🚚 Shipped',    stat:'shipped',   color:'#C2410C', bg:'#FFF7ED' },
              { label:'✅ Delivered',  stat:'delivered', color:'#15803D', bg:'#F0FDF4' },
              { label:'❌ Cancelled',  stat:'cancelled', color:'#BE123C', bg:'#FFF1F2' },
            ].map(({ label, stat, color, bg }) => (
              <button key={stat} onClick={() => { setStatus(stat); setPage(1) }}
                style={{ padding:'6px 14px', background:bg, color, border:`1px solid ${color}30`, borderRadius:'20px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
                {label}
              </button>
            ))}
          </div>

          {/* Orders list */}
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background:'white', borderRadius:'14px', padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div className="shimmer" style={{ height:'12px', borderRadius:'6px', width:'30%', marginBottom:'12px' }} />
                  <div style={{ display:'flex', gap:'12px' }}>
                    <div className="shimmer" style={{ width:'56px', height:'68px', borderRadius:'10px', flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div className="shimmer" style={{ height:'12px', borderRadius:'6px', width:'70%', marginBottom:'10px' }} />
                      <div className="shimmer" style={{ height:'11px', borderRadius:'6px', width:'40%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'64px', marginBottom:'16px' }}>📋</div>
              <h3 style={{ fontSize:'20px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>No orders found</h3>
              <p style={{ color:'#64748B', margin:0, fontSize:'14px' }}>Try a different status filter or search query</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {orders.map(order => {
                const sc         = STATUS_STYLE[order.status] || STATUS_STYLE.placed
                const isUpdating = updating === order._id

                return (
                  <div key={order._id} className="order-card">

                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderBottom:'1px solid #F8FAFC', background:'#FAFBFF' }}>
                      <div>
                        <p style={{ fontSize:'11px', color:'#94A3B8', fontFamily:'monospace', margin:'0 0 2px', fontWeight:'700', letterSpacing:'0.5px' }}>#{order._id.slice(-8).toUpperCase()}</p>
                        <p style={{ fontSize:'12px', color:'#64748B', margin:0, fontWeight:'500' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                      <span style={{ fontSize:'11px', padding:'4px 12px', borderRadius:'20px', fontWeight:'700', background:sc.bg, color:sc.color }}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Buyer + items */}
                    <div style={{ padding:'13px 18px', display:'flex', gap:'14px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#7C3AED,#E91E8C)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'13px', fontWeight:'800', flexShrink:0 }}>
                            {order.buyer?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', margin:0 }}>{order.buyer?.name || 'Unknown Buyer'}</p>
                            <p style={{ fontSize:'11px', color:'#94A3B8', margin:0, fontWeight:'500' }}>{order.buyer?.email || ''}</p>
                          </div>
                        </div>
                        {order.items?.[0] && (
                          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                            <img src={order.items[0].image} alt="" style={{ width:'48px', height:'58px', objectFit:'cover', borderRadius:'8px', background:'#F1F5F9', flexShrink:0 }}
                              onError={e => { e.target.style.background='#F1F5F9'; e.target.src=''; }} />
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontSize:'13px', fontWeight:'600', color:'#0F172A', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.items[0].title}</p>
                              <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 2px', fontWeight:'500' }}>
                                {order.items[0].size && `Size: ${order.items[0].size} · `}Qty: {order.items[0].quantity}
                              </p>
                              {order.items.length > 1 && <p style={{ fontSize:'11px', color:'#94A3B8', margin:0, fontWeight:'500' }}>+{order.items.length - 1} more items</p>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:'17px', fontWeight:'800', color:'#0F172A', margin:'0 0 3px', letterSpacing:'-0.3px' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize:'11px', color:'#94A3B8', margin:0, fontWeight:'500' }}>
                          {order.paymentMethod === 'cod' ? '💵 COD' : '✅ Paid'}
                        </p>
                      </div>
                    </div>

                    {/* Status controls */}
                    <div style={{ padding:'10px 18px 13px', borderTop:'1px solid #F1F5F9', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'3px', flexWrap:'wrap' }}>
                        {STATUS_FLOW.map((s, i) => {
                          const idx = STATUS_FLOW.indexOf(order.status)
                          const done = i <= idx
                          const isCurrent = i === idx
                          const ss = STATUS_STYLE[s]
                          return (
                            <div key={s} style={{ display:'flex', alignItems:'center' }}>
                              <div style={{ fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px', background: isCurrent ? ss.bg : done ? '#F0FDF4' : '#F1F5F9', color: isCurrent ? ss.color : done ? '#16a34a' : '#CBD5E1', border: isCurrent ? `1px solid ${ss.color}40` : 'none', whiteSpace:'nowrap' }}>
                                {done && !isCurrent ? '✓ ' : ''}{ss.label}
                              </div>
                              {i < STATUS_FLOW.length - 1 && <span style={{ color:'#CBD5E1', fontSize:'10px', margin:'0 1px' }}>›</span>}
                            </div>
                          )
                        })}
                      </div>

                      {order.status === 'packed' && !order.deliveryBoy && (
                          <button className="next-btn"
                            disabled={assigning === order._id}
                            onClick={() => assignDelivery(order._id)}
                            style={{ background: assigning === order._id ? '#E2E8F0' : 'linear-gradient(135deg,#f97316,#ec4899)', color: assigning === order._id ? '#94A3B8' : 'white' }}>
                            {assigning === order._id ? '...' : '🛵 Assign Delivery'}
                          </button>
                        )}
                        {order.deliveryBoy && (
                          <span style={{ fontSize:'11px', background:'#F0FDF4', color:'#15803D', padding:'4px 10px', borderRadius:'20px', fontWeight:'700', border:'1px solid #BBF7D0' }}>
                            🛵 {order.deliveryBoy?.name || 'Assigned'}
                          </span>
                        )}
                      <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                        <button onClick={() => navigate(`/admin/orders/${order._id}`)}
                          style={{ padding:'7px 13px', background:'#F1F5F9', color:'#374151', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
                          View
                        </button>
                        {!['delivered','cancelled','returned'].includes(order.status) && (
                          <button className="next-btn" disabled={isUpdating}
                            onClick={() => updateStatus(order._id, 'cancelled')}
                            style={{ background:'#FFF1F2', color:'#BE123C' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', padding:'8px 0 24px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding:'9px 20px', border:'1.5px solid #E2E8F0', borderRadius:'10px', background:'white', cursor: page === 1 ? 'not-allowed':'pointer', opacity: page === 1 ? 0.4:1, fontFamily:f, fontSize:'13px', fontWeight:'600' }}>
                    ← Prev
                  </button>
                  <span style={{ fontSize:'13px', color:'#64748B', fontWeight:'600' }}>Page {page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding:'9px 20px', border:'1.5px solid #E2E8F0', borderRadius:'10px', background:'white', cursor: page === totalPages ? 'not-allowed':'pointer', opacity: page === totalPages ? 0.4:1, fontFamily:f, fontSize:'13px', fontWeight:'600' }}>
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}