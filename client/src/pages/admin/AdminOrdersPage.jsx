import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiRefreshCw, FiEye, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllOrdersAdminAPI } from '../../api/adminAPI.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import NotificationBell from '../../components/common/NotificationBell.jsx'

const STATUS_STYLE = {
  placed:            { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  confirmed:         { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' },
  packed:            { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  shipped:           { bg: '#F0FDFA', color: '#0F766E', dot: '#14B8A6' },
  delivered:         { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
  cancelled:         { bg: '#FEE2E2', color: '#DC2626', dot: '#F87171' },
  return_requested:  { bg: '#FDF4FF', color: '#A21CAF', dot: '#D946EF' },
}

const f = 'Poppins, sans-serif'

export default function AdminOrdersPage() {
  const [sideOpen,  setSideOpen]  = useState(false)
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [selected,  setSelected]  = useState(null)
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllOrdersAdminAPI({ page, limit: LIMIT, status: status || undefined, search: search || undefined })
      setOrders(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [page, status, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const totalPages = Math.ceil(total / LIMIT)

  const STATUS_TABS = [
    { key: '', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: f, background: '#F9F9FB' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: 'white', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBF0', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSideOpen(true)} style={{ background: '#F9F9FB', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex' }} className="lg:hidden">☰</button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>Orders</h1>
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
                placeholder="Search orders by buyer, product..."
                style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #EBEBF0', borderRadius: '12px', fontSize: '13px', fontFamily: f, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={fetchOrders} style={{ width: '42px', height: '42px', border: '1px solid #EBEBF0', borderRadius: '12px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
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
                    {['Order ID', 'Buyer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #EBEBF0' }}>
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '14px 16px' }}>
                          <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '6px', width: '75%' }} />
                        </td>
                      ))}
                    </tr>
                  )) : orders.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>No orders found
                    </td></tr>
                  ) : orders.map(order => {
                    const sc = STATUS_STYLE[order.status] || STATUS_STYLE.placed
                    return (
                      <tr key={order._id} style={{ borderTop: '1px solid #EBEBF0', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FDF6FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>#{order._id.slice(-8).toUpperCase()}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: '600', color: '#1A1A2E', margin: 0, fontSize: '13px' }}>{order.buyer?.name || 'Buyer'}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{order.buyer?.email || ''}</p>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B4B6B' }}>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1A1A2E' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600', background: order.paymentMethod === 'cod' ? '#FFF7ED' : '#EFF6FF', color: order.paymentMethod === 'cod' ? '#C2410C' : '#1D4ED8' }}>
                            {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: sc.bg, color: sc.color }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot }} />
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: '12px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => setSelected(order)}
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #EBEBF0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.color = '#E91E8C' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBF0'; e.currentTarget.style.color = '#6B7280' }}>
                            <FiEye size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #EBEBF0', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Showing {orders.length} of {total}</span>
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

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EBEBF0' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Order Details</h2>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, fontFamily: 'monospace' }}>#{selected._id.slice(-12).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {/* Status */}
              {(() => { const sc = STATUS_STYLE[selected.status] || STATUS_STYLE.placed; return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: sc.bg, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: sc.color, textTransform: 'capitalize' }}>{selected.status?.replace('_', ' ')}</span>
                  <span style={{ fontSize: '12px', color: sc.color }}>{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )})()}

              {/* Buyer */}
              <div style={{ background: '#F9F9FB', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>Buyer</p>
                <p style={{ fontWeight: '600', color: '#1A1A2E', margin: '0 0 2px', fontSize: '14px' }}>{selected.buyer?.name}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{selected.buyer?.email} · {selected.buyer?.phone}</p>
              </div>

              {/* Delivery address */}
              {selected.deliveryAddress && (
                <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#16A34A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>Delivery Address</p>
                  <p style={{ fontWeight: '600', color: '#1A1A2E', margin: '0 0 2px', fontSize: '13px' }}>{selected.deliveryAddress.name} · {selected.deliveryAddress.phone}</p>
                  <p style={{ fontSize: '12px', color: '#4B4B6B', margin: 0, lineHeight: '1.6' }}>{selected.deliveryAddress.line1}{selected.deliveryAddress.line2 ? `, ${selected.deliveryAddress.line2}` : ''}, {selected.deliveryAddress.city}, {selected.deliveryAddress.state} — {selected.deliveryAddress.pincode}</p>
                </div>
              )}

              {/* Items */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>Items ({selected.items?.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selected.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#F9F9FB', borderRadius: '10px' }}>
                      {item.image && <img src={item.image} style={{ width: '40px', height: '46px', objectFit: 'cover', borderRadius: '8px', background: '#E2E8F0', flexShrink: 0 }} alt="" />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p style={{ fontWeight: '700', color: '#1A1A2E', fontSize: '13px', flexShrink: 0 }}>₹{(item.sellingPrice * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: '#F9F9FB', borderRadius: '12px', padding: '14px 16px' }}>
                {[
                  { label: 'Subtotal', val: `₹${selected.subtotal?.toLocaleString('en-IN')}` },
                  { label: 'Shipping', val: selected.shippingFee === 0 ? 'FREE' : `₹${selected.shippingFee}` },
                  { label: 'Payment', val: selected.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online' },
                  { label: 'Payment Status', val: selected.paymentStatus },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#6B7280' }}>{item.label}</span>
                    <span style={{ fontWeight: '600', color: '#1A1A2E', textTransform: 'capitalize' }}>{item.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #EBEBF0', fontSize: '15px', fontWeight: '700', color: '#1A1A2E' }}>
                  <span>Total</span>
                  <span style={{ color: '#E91E8C' }}>₹{selected.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}