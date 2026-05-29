import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { getMyOrdersAPI, cancelOrderAPI } from '../../api/orderAPI.js'

const f = '"DM Sans", Poppins, sans-serif'

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']

const STATUS_STYLE = {
  placed:           { color: '#7C3AED', label: 'Order Placed' },
  confirmed:        { color: '#4338CA', label: 'Order Confirmed' },
  packed:           { color: '#B45309', label: 'Being Packed' },
  shipped:          { color: '#C2410C', label: 'Shipped' },
  out_for_delivery: { color: '#6D28D9', label: 'Out for Delivery' },
  delivered:        { color: '#15803D', label: 'Delivered' },
  cancelled:        { color: '#BE123C', label: 'Order Cancelled' },
  return_requested: { color: '#A21CAF', label: 'Return Requested' },
  returned:         { color: '#64748B', label: 'Returned' },
}

const STEP_LABELS = {
  placed:           'Placed',
  confirmed:        'Confirmed',
  packed:           'Packed',
  shipped:          'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered:        'Delivered',
}

const TABS = [
  { key: '',          label: 'All' },
  { key: 'placed',    label: 'Placed' },
  { key: 'shipped',   label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

/* ── Tracking Pipeline ─────────────────────────────────────────────────────── */
function TrackingPipeline({ status }) {
  if (['cancelled', 'return_requested', 'returned'].includes(status)) return null

  const currentIdx = STATUS_STEPS.indexOf(status)

  return (
    <div style={{
      padding: '14px 16px 12px',
      borderTop: '1px solid #F1F5F9',
      background: '#FAFBFF',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {/* connector line behind circles */}
        <div style={{
          position: 'absolute',
          top: '13px',
          left: '13px',
          right: '13px',
          height: '2px',
          background: '#E2E8F0',
          zIndex: 0,
        }} />
        {/* filled connector up to current step */}
        <div style={{
          position: 'absolute',
          top: '13px',
          left: '13px',
          width: currentIdx === 0
            ? '0%'
            : `calc(${(currentIdx / (STATUS_STEPS.length - 1)) * 100}% - 13px)`,
          height: '2px',
          background: '#7C3AED',
          zIndex: 0,
          transition: 'width 0.4s ease',
        }} />

        {STATUS_STEPS.map((step, idx) => {
          const done    = idx <= currentIdx
          const current = idx === currentIdx
          return (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: done ? '#7C3AED' : '#fff',
                border: `2px solid ${done ? '#7C3AED' : '#E2E8F0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: current ? '0 0 0 3px #EDE9FE' : 'none',
              }}>
                {done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p style={{
                margin: '5px 0 0',
                fontSize: '9px',
                fontWeight: current ? '800' : '500',
                color: done ? '#7C3AED' : '#CBD5E1',
                textAlign: 'center',
                lineHeight: 1.3,
                maxWidth: '52px',
              }}>
                {STEP_LABELS[step]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Star rating row (delivered orders) ────────────────────────────────────── */
function StarRow({ orderId, productId, navigate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9' }}>
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 8px' }}>How was the product?</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['Very Bad', 'Bad', 'Ok-Ok', 'Good', 'Very Good'].map((label, i) => (
            <div key={i} style={{ textAlign: 'center', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => navigate(`/review/${orderId}/${productId}`)}>
              <svg width="28" height="28" viewBox="0 0 24 24"
                fill={hovered >= i + 1 ? '#f59e0b' : 'none'}
                stroke={hovered >= i + 1 ? '#f59e0b' : '#CBD5E1'}
                strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, fontWeight: '500' }}>{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate(`/review/${orderId}/${productId}`)}
          style={{ padding: '8px 16px', background: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: f }}>
          Rate &amp; Review
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getMyOrdersAPI({ page, limit: LIMIT, status: status || undefined })
      setOrders(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // ── Socket.io: real-time order status updates ──────────────────────────────
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      withCredentials: true,
    })

    // Join personal room so server can emit to this user
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?._id) socket.emit('join', user._id)

    // Any status update — refresh orders list + toast
    socket.on('order_status_update', ({ status: newStatus, message }) => {
      toast.success(`📦 ${message}`, { duration: 4000 })
      fetchOrders()
    })

    // Out for delivery — show toast with Track link
    socket.on('out_for_delivery', ({ trackingUrl, message }) => {
      toast(
        (t) => (
          <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <p style={{ margin: '0 0 8px', fontWeight: '700' }}>{message}</p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#ec4899', fontWeight: '600', fontSize: '13px' }}
              onClick={() => toast.dismiss(t.id)}
            >
              Track your order →
            </a>
          </div>
        ),
        { duration: 8000, icon: '🚚' }
      )
      fetchOrders()
    })

    return () => socket.disconnect()
  }, [fetchOrders])
  // ──────────────────────────────────────────────────────────────────────────

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await cancelOrderAPI(id)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot cancel')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  const filteredOrders = orders.filter(o => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o._id.toLowerCase().includes(q) ||
      o.items?.some(i => i.title?.toLowerCase().includes(q))
    )
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: f }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .tab-btn { padding:8px 18px; border:1.5px solid #E2E8F0; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:${f}; white-space:nowrap; background:white; color:#64748B; transition:all 0.15s; }
        .tab-btn:hover { border-color:#7C3AED; color:#7C3AED; }
        .tab-btn.active { background:#7C3AED; color:white; border-color:transparent; }
        .order-row { background:white; border-bottom:8px solid #F8FAFC; }
        @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
        .shimmer { background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:400px 100%; animation:shimmer 1.2s infinite; }
        .search-box { width:100%; padding:11px 16px 11px 42px; border:1.5px solid #E2E8F0; border-radius:24px; font-size:14px; font-family:${f}; outline:none; background:#F8FAFC; box-sizing:border-box; }
        .search-box:focus { border-color:#7C3AED; background:white; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'white', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#374151', padding: '4px' }}>←</button>
          <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Orders</h1>
        </div>
        <button onClick={fetchOrders} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#7C3AED' }}>↻</button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '16px' }}>🔍</span>
          <input className="search-box" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        {TABS.map(tab => (
          <button key={tab.key} className={`tab-btn${status === tab.key ? ' active' : ''}`}
            onClick={() => { setStatus(tab.key); setPage(1) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ padding: '16px', borderBottom: '8px solid #F8FAFC', display: 'flex', gap: '12px' }}>
              <div className="shimmer" style={{ width: '88px', height: '108px', borderRadius: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="shimmer" style={{ height: '12px', borderRadius: '4px', width: '60%', marginBottom: '10px' }} />
                <div className="shimmer" style={{ height: '12px', borderRadius: '4px', width: '40%', marginBottom: '10px' }} />
                <div className="shimmer" style={{ height: '12px', borderRadius: '4px', width: '30%' }} />
              </div>
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>No orders found</h3>
            <p style={{ color: '#64748B', margin: '0 0 24px', fontSize: '14px' }}>
              {status ? `No ${status} orders yet` : 'Start shopping to see your orders here'}
            </p>
            <button onClick={() => navigate('/home')}
              style={{ padding: '12px 28px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: f }}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div>
            {filteredOrders.map(order => {
              const sc          = STATUS_STYLE[order.status] || STATUS_STYLE.placed
              const isDelivered = order.status === 'delivered'
              const isCancelled = order.status === 'cancelled'
              const isReturned  = ['return_requested', 'returned'].includes(order.status)
              const canCancel   = ['placed', 'confirmed', 'packed'].includes(order.status)
              const dateStr     = new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

              return (
                <div key={order._id} className="order-row">
                  {order.items?.map((item, idx) => (
                    <div key={idx}
                      onClick={() => navigate(`/order/${order._id}`)}
                      style={{ display: 'flex', gap: '12px', padding: '14px 16px', cursor: 'pointer', alignItems: 'flex-start', borderTop: idx > 0 ? '1px dashed #F1F5F9' : 'none' }}>

                      <img
                        src={item.image} alt={item.title}
                        style={{ width: '88px', height: '108px', objectFit: 'cover', borderRadius: '6px', background: '#F1F5F9', flexShrink: 0 }}
                        onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 2px',
                          color: isCancelled ? '#BE123C' : isReturned ? '#A21CAF' : isDelivered ? '#15803D' : '#7C3AED' }}>
                          {isCancelled ? '✕ ' : isDelivered ? '✓ ' : ''}{sc.label}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 6px', fontWeight: '500' }}>{dateStr}</p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 6px', fontWeight: '500' }}>
                          {item.size && `Size: ${item.size}`}{item.size ? ' • ' : ''}Qty: {item.quantity}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                          ₹{(item.sellingPrice * item.quantity).toLocaleString('en-IN')}
                        </p>

                        {/* Track button shown inline when out for delivery */}
                        {order.status === 'out_for_delivery' && order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ display: 'inline-block', marginTop: '8px', padding: '5px 12px', background: '#fdf2f8', color: '#ec4899', border: '1px solid #ec4899', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>
                            📍 Track Order
                          </a>
                        )}
                      </div>

                      <span style={{ color: '#CBD5E1', fontSize: '20px', alignSelf: 'center' }}>›</span>
                    </div>
                  ))}

                  <TrackingPipeline status={order.status} />

                  {isDelivered && (
                    <StarRow
                      orderId={order._id}
                      productId={order.items?.[0]?.product}
                      navigate={navigate}
                    />
                  )}

                  {canCancel && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 14px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleCancel(order._id) }}
                        style={{ padding: '8px 18px', background: 'white', color: '#BE123C', border: '1.5px solid #BE123C', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: f }}>
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '8px 18px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontFamily: f, fontSize: '13px', fontWeight: '600' }}>
                  ← Prev
                </button>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '8px 18px', border: '1.5px solid #E2E8F0', borderRadius: '8px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontFamily: f, fontSize: '13px', fontWeight: '600' }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}