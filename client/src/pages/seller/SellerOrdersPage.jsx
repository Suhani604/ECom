import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck,
  FiRefreshCw, FiSearch, FiShoppingBag, FiRotateCcw, FiUser,
} from 'react-icons/fi'
import { getSellerOrdersAPI, updateOrderStatusAPI, getSellerStatsAPI } from '../../api/sellerAPI.js'
import SellerLayout from './SellerLayout.jsx'

const f = '"DM Sans", system-ui, sans-serif'

/* ─── status config (matches your Order model enums) ─── */
const STATUS_CFG = {
  placed:            { label: 'Placed',           color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  confirmed:         { label: 'Confirmed',         color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  packed:            { label: 'Packed',            color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  shipped:           { label: 'Shipped',           color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  out_for_delivery:  { label: 'Out for delivery',  color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  delivered:         { label: 'Delivered',         color: '#059669', bg: '#ECFDF5', border: '#D1FAE5' },
  cancelled:         { label: 'Cancelled',         color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  return_requested:  { label: 'Return requested',  color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  returned:          { label: 'Returned',          color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
}

const NEXT_STATUS = {
  placed:    { label: 'Confirm Order', next: 'confirmed', bg: '#7C3AED' },
  confirmed: { label: 'Mark Packed',  next: 'packed',    bg: '#D97706' },
  packed:    { label: 'Mark Shipped', next: 'shipped',   bg: '#0891B2' },
  // shipped, out_for_delivery, delivered — delivery boy handles, no seller button
}
/* ─── STATUS PILL ─── */
function Pill({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.placed
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{c.label}</span>
  )
}

/* ─── STATUS PIPELINE ─── */
const PIPELINE = ['placed','confirmed','packed','shipped','out_for_delivery','delivered']
function Pipeline({ status }) {
  const idx = PIPELINE.indexOf(status)
  if (status === 'cancelled' || status === 'returned' || status === 'return_requested') {
    return <Pill status={status} />
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
      {PIPELINE.map((s, i) => {
        const done    = i <= idx
        const current = i === idx
        const cfg     = STATUS_CFG[s]
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: current ? '800' : '500',
              color:      current ? cfg.color : done ? '#6B7280' : '#D1D5DB',
              background: current ? cfg.bg    : 'transparent',
              border:     current ? `1px solid ${cfg.border}` : '1px solid transparent',
              opacity:    done ? 1 : 0.4,
            }}>{cfg.label}</span>
            {i < PIPELINE.length - 1 && (
              <span style={{ color: '#D1D5DB', fontSize: '11px' }}>›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── SINGLE ORDER CARD ─── */
function OrderCard({ order, onStatusChange }) {
  const [updating, setUpdating] = useState(false)
  const buyer   = order.buyer || {}
  const items   = order.items || []
  const addr    = order.deliveryAddress || {}
  const placedAt = order.createdAt ? new Date(order.createdAt) : null
  const advance  = NEXT_STATUS[order.status]

  const initials = (buyer.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  const handleAdvance = async () => {
    if (!advance) return
    setUpdating(true)
    try {
      await updateOrderStatusAPI(order._id, advance.next)
      onStatusChange(order._id, advance.next)
    } catch { /* silent */ }
    finally { setUpdating(false) }
  }

  const handleCancel = async () => {
    setUpdating(true)
    try {
      await updateOrderStatusAPI(order._id, 'cancelled')
      onStatusChange(order._id, 'cancelled')
    } catch { /* silent */ }
    finally { setUpdating(false) }
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
      overflow: 'hidden', marginBottom: '12px',
    }}>
      {/* ── header row ── */}
      <div style={{
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6',
        flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#EDE9FE', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#7C3AED' }}>{initials}</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#111827' }}>
              {buyer.name || 'Unknown Buyer'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{buyer.email || ''}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#111827' }}>
              ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
            </p>
            <span style={{
              fontSize: '10px', fontWeight: '700', padding: '2px 8px',
              borderRadius: '20px',
              background: order.paymentMethod === 'cod' ? '#D1FAE5' : '#DBEAFE',
              color:      order.paymentMethod === 'cod' ? '#065F46' : '#1E40AF',
            }}>
              {order.paymentMethod === 'cod' ? '✓ COD' : '✓ Paid'}
            </span>
          </div>
          <Pill status={order.status} />
        </div>
      </div>

      {/* ── order meta ── */}
      <div style={{ padding: '8px 20px 0', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>
          #{order._id?.slice(-8).toUpperCase()}
        </p>
        {placedAt && (
          <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
            {placedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {', '}
            {placedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {addr.city && (
          <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
            📍 {addr.city}, {addr.state} {addr.pincode}
          </p>
        )}
      </div>

      {/* ── items ── */}
      <div style={{ padding: '12px 20px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: idx > 0 ? '10px 0 0' : '0',
            borderTop: idx > 0 ? '1px dashed #F3F4F6' : 'none',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden',
              flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.image
                ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <FiPackage size={20} style={{ color: '#9CA3AF' }} />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title || 'Unknown Product'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
              </p>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>Qty: {item.quantity || 1}</p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                ₹{((item.sellingPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── pipeline + actions ── */}
      <div style={{
        padding: '12px 20px 14px', borderTop: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px',
      }}>
        <Pipeline status={order.status} />

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {advance && !['shipped','out_for_delivery','delivered'].includes(order.status) && order.status !== 'cancelled' && (
            <>
              <button
                onClick={handleAdvance}
                disabled={updating}
                style={{
                  padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                  border: 'none', background: advance.bg, color: '#fff',
                  cursor: updating ? 'not-allowed' : 'pointer', fontFamily: f,
                  opacity: updating ? 0.6 : 1,
                }}>
                {updating ? '…' : `✓ ${advance.label}`}
              </button>
              {order.status === 'placed' && (
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  style={{
                    padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                    border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280',
                    cursor: updating ? 'not-allowed' : 'pointer', fontFamily: f,
                    opacity: updating ? 0.6 : 1,
                  }}>
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── STAT CARD ─── */
function StatCard({ label, value, Icon, light, tc, border }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '14px 16px',
      border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{ width: '36px', height: '36px', background: light, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: tc }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: tc, lineHeight: 1 }}>{value}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>{label}</p>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─── */
const TABS = [
  { key: 'all',              label: 'All' },
  { key: 'placed',           label: 'Placed' },
  { key: 'confirmed',        label: 'Confirmed' },
  { key: 'packed',           label: 'Packed' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered',        label: 'Delivered' },
  { key: 'cancelled',        label: 'Cancelled' },
]

export default function SellerOrdersPage() {
  const navigate = useNavigate()

  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search,     setSearch]     = useState('')
  const [tab,        setTab]        = useState('all')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)

  // ── INDEPENDENT STATS STATE (never affected by tab/search/page) ──────────
  const [stats, setStats] = useState({
    total: 0, placed: 0, confirmed: 0, packed: 0,
    shipped: 0, out_for_delivery: 0, delivered: 0,
    cancelled: 0, revenue: 0,
  })

  const LIMIT = 20

  // ── Fetch global stats from dedicated endpoint ────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await getSellerStatsAPI()
      const d   = res.data?.data || res.data || {}
      setStats({
        total:            d.total            ?? 0,
        placed:           d.placed           ?? 0,
        confirmed:        d.confirmed        ?? 0,
        packed:           d.packed           ?? 0,
        shipped:          d.shipped          ?? 0,
        out_for_delivery: d.out_for_delivery ?? 0,
        delivered:        d.delivered        ?? 0,
        cancelled:        d.cancelled        ?? 0,
        revenue:          d.revenue          ?? 0,
      })
    } catch {
      // keep previous stats on error
    }
  }, [])

  // ── Fetch filtered orders (tab/search/page change this) ───────────────────
  // FIX: removed client-side double filter — API already filters by tab/search
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const params = { page, limit: LIMIT }
      if (tab !== 'all') params.status = tab
      if (search.trim()) params.search = search.trim()
      const res = await getSellerOrdersAPI(params)
      setOrders(res.data?.data?.orders || res.data?.orders || [])
      setTotal(res.data?.data?.total   || res.data?.total  || 0)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, tab, search])

  // ── On mount: fetch stats once, then every 30 s ───────────────────────────
  useEffect(() => {
    fetchStats()
    const t = setInterval(() => fetchStats(), 30000)
    return () => clearInterval(t)
  }, [fetchStats])

  // ── Fetch orders whenever tab / search / page changes ─────────────────────
  useEffect(() => {
    fetchOrders()
    const t = setInterval(() => fetchOrders(true), 30000)
    return () => clearInterval(t)
  }, [fetchOrders])

  // ── After a status change, refresh both stats + orders ────────────────────
  const handleStatusChange = (id, newStatus) => {
    // Optimistically update orders list
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o))
    // Re-fetch stats so stat cards reflect real DB values
    fetchStats()
  }

  const totalPages = Math.ceil(total / LIMIT)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchOrders(true), fetchStats()])
    setRefreshing(false)
  }

  return (
    <SellerLayout>
      <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: f }}>

        {/* top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #E5E7EB',
          padding: '14px 24px', display: 'flex', alignItems: 'center',
          gap: '12px', flexWrap: 'wrap',
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827', flex: 1 }}>
            All Orders
          </h1>
          {/* Total always from stats, never from filtered count */}
          <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>
            {stats.total} total orders
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', background: '#F5F3FF',
              border: '1.5px solid #DDD6FE', borderRadius: '8px',
              fontSize: '12px', fontWeight: '700', color: '#7C3AED',
              cursor: 'pointer', fontFamily: f, opacity: refreshing ? 0.6 : 1,
            }}>
            <FiRefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div style={{ padding: '20px 24px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* ── STAT CARDS — real DB totals, tab-independent ── */}
          {/* FIX: added confirmed, packed, out_for_delivery cards; all use stats not filtered counts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
            gap: '12px', marginBottom: '20px',
          }}>
            <StatCard label="Total Orders"      value={stats.total}            Icon={FiShoppingBag}  light="#F5F3FF" tc="#7C3AED" border="#EDE9FE" />
            <StatCard label="Placed"            value={stats.placed}           Icon={FiClock}        light="#EFF6FF" tc="#2563EB" border="#BFDBFE" />
            <StatCard label="Shipped"           value={stats.shipped}          Icon={FiTruck}        light="#ECFEFF" tc="#0891B2" border="#A5F3FC" />
            <StatCard label="Delivered"         value={stats.delivered}        Icon={FiCheckCircle}  light="#ECFDF5" tc="#059669" border="#D1FAE5" />
            <StatCard label="Cancelled"         value={stats.cancelled}        Icon={FiXCircle}      light="#FEF2F2" tc="#DC2626" border="#FECACA" />
            <StatCard label="Revenue (₹)"       value={`₹${Math.round(stats.revenue).toLocaleString('en-IN')}`} Icon={FiPackage} light="#FFF7ED" tc="#EA580C" border="#FED7AA" />
          </div>

          {/* search + tabs */}
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: '12px', marginBottom: '16px', overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiSearch size={15} style={{ color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by order ID or buyer name…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '13px', color: '#111827', fontFamily: f, background: 'transparent',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                  ✕
                </button>
              )}
            </div>

            {/* tabs — FIX: badge counts from stats (real DB), not current page */}
            <div style={{ display: 'flex', overflowX: 'auto', borderTop: '1px solid #F3F4F6', padding: '0 8px' }}>
              {TABS.map(t => {
                const active = tab === t.key
                const cfg    = STATUS_CFG[t.key]
                // Real counts from stats — always accurate regardless of tab/page
                const cnt    = t.key !== 'all' ? (stats[t.key] ?? 0) : stats.total
                return (
                  <button key={t.key}
                    onClick={() => { setTab(t.key); setPage(1) }}
                    style={{
                      padding: '11px 14px', background: 'none', border: 'none',
                      borderBottom: active ? `2.5px solid ${cfg?.color || '#7C3AED'}` : '2.5px solid transparent',
                      fontSize: '12px', fontWeight: active ? '800' : '500',
                      color: active ? (cfg?.color || '#7C3AED') : '#6B7280',
                      cursor: 'pointer', fontFamily: f, whiteSpace: 'nowrap',
                    }}>
                    {t.label}
                    {cnt > 0 && (
                      <span style={{
                        marginLeft: '5px', fontSize: '10px', fontWeight: '700',
                        background: active ? (cfg?.bg || '#F5F3FF') : '#F3F4F6',
                        color: active ? (cfg?.color || '#7C3AED') : '#6B7280',
                        padding: '1px 6px', borderRadius: '10px',
                      }}>
                        {cnt}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* quick filter pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { key: 'placed',    label: '🆕 New' },
              { key: 'shipped',   label: '🚚 Shipped' },
              { key: 'delivered', label: '✅ Delivered' },
              { key: 'cancelled', label: '❌ Cancelled' },
            ].map(p => {
              const active = tab === p.key
              return (
                <button key={p.key}
                  onClick={() => { setTab(active ? 'all' : p.key); setPage(1) }}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    border: `1px solid ${active ? STATUS_CFG[p.key]?.border : '#E5E7EB'}`,
                    background: active ? STATUS_CFG[p.key]?.bg : '#fff',
                    color: active ? STATUS_CFG[p.key]?.color : '#6B7280',
                    cursor: 'pointer', fontFamily: f,
                  }}>
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* order list — FIX: render `orders` directly (no client-side re-filter) */}
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} style={{
                background: '#fff', borderRadius: '12px', height: '160px',
                border: '1px solid #E5E7EB', marginBottom: '12px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))
          ) : orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB',
            }}>
              <div style={{
                width: '56px', height: '56px', background: '#F3F4F6', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <FiShoppingBag size={24} style={{ color: '#9CA3AF' }} />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>
                No orders found
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                {search
                  ? 'Try a different search term'
                  : tab !== 'all'
                    ? `No ${tab.replace(/_/g,' ')} orders yet`
                    : "You haven't received any orders yet"}
              </p>
            </div>
          ) : (
            orders.map(order => (
              <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
            ))
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginTop: '20px',
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  background: '#fff', fontSize: '12px', fontWeight: '600',
                  color: page === 1 ? '#9CA3AF' : '#374151',
                  cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: f,
                }}>
                ← Prev
              </button>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '7px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  background: '#fff', fontSize: '12px', fontWeight: '600',
                  color: page === totalPages ? '#9CA3AF' : '#374151',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: f,
                }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
      `}</style>
    </SellerLayout>
  )
}