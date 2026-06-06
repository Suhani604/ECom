import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDeliveryProfile,
  toggleOnlineStatus,
  getMyDeliveries,
  getEarnings,
} from '../../api/deliveryAPI'
import useDeliveryStore from '../../context/useDeliveryStore'

const G = {
  primary: '#1a9e3f',
  primaryDark: '#157a32',
  primaryLight: '#e8f5ec',
  accent: '#f5a623',
  bg: '#f4f6f4',
  card: '#ffffff',
  text: '#1a2e1a',
  muted: '#6b7c6b',
  border: '#d4e8d4',
  danger: '#e53e3e',
}

export function BottomNav({ active }) {
  const navigate = useNavigate()
  const tabs = [
    { id: 'home',     label: 'Home',     icon: '🏠', path: '/delivery/dashboard' },
    { id: 'orders',   label: 'Orders',   icon: '📦', path: '/delivery/orders'    },
    { id: 'earnings', label: 'Earnings', icon: '💰', path: '/delivery/earnings'  },
    { id: 'profile',  label: 'Profile',  icon: '👤', path: '/delivery/profile'   },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: `2px solid ${G.border}`,
      display: 'flex',
      boxShadow: '0 -4px 20px rgba(26,158,63,0.1)',
      zIndex: 50,
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => navigate(tab.path)} style={{
          flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: active === tab.id ? G.primary : '#9ca3af',
            fontFamily: "'Outfit','Nunito',sans-serif",
          }}>{tab.label}</span>
          {active === tab.id && (
            <div style={{ width: 20, height: 3, borderRadius: 2, background: G.primary }} />
          )}
        </button>
      ))}
    </nav>
  )
}

// ── Weekly Bar Chart ──────────────────────────────────────────────────────────
function WeeklyChart({ orders }) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const today = new Date().getDay()
  const weekData = days.map((d, i) => {
    const dayOrders = orders.filter(o => {
      if (o.status !== 'delivered' || !o.deliveredAt) return false
      const dd = new Date(o.deliveredAt).getDay()
      return dd === (i + 1) % 7
    })
    return { day: d, count: dayOrders.length, earning: dayOrders.length * 40 }
  })
  const maxEarning = Math.max(...weekData.map(d => d.earning), 1)

  return (
    <div style={{ background: G.card, borderRadius: 16, padding: '16px', marginBottom: 16, border: `1.5px solid ${G.border}`, boxShadow: '0 2px 12px rgba(26,158,63,0.07)' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 12 }}>📊 Weekly Earnings</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {weekData.map((d, i) => {
          const isToday = (i + 1) % 7 === today
          const height = maxEarning > 0 ? Math.max((d.earning / maxEarning) * 60, 4) : 4
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: d.earning > 0 ? G.primary : '#d1d5db' }}>
                {d.earning > 0 ? `₹${d.earning}` : ''}
              </div>
              <div style={{
                width: '100%', height: height, borderRadius: 4,
                background: isToday ? G.primary : d.earning > 0 ? '#86efac' : '#f3f4f6',
                transition: 'height 0.3s',
              }} />
              <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? G.primary : G.muted }}>{d.day}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Performance Ring ──────────────────────────────────────────────────────────
function PerformanceRing({ completed, total }) {
  const pct = total > 0 ? Math.min((completed / total) * 100, 100) : 0
  const r = 28, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ background: G.card, borderRadius: 16, padding: '16px', marginBottom: 16, border: `1.5px solid ${G.border}`, boxShadow: '0 2px 12px rgba(26,158,63,0.07)' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 12 }}>🎯 Today's Performance</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
          <svg width={70} height={70} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={35} cy={35} r={r} fill="none" stroke={G.border} strokeWidth={7} />
            <circle cx={35} cy={35} r={r} fill="none"
              stroke={G.primary} strokeWidth={7}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
          </svg>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 70, height: 70,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: G.primary }}>{completed}</div>
            <div style={{ fontSize: 9, color: G.muted, fontWeight: 600 }}>of {total}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>Orders Completed</div>
          <div style={{ fontSize: 11, color: G.muted, fontWeight: 600, marginTop: 2 }}>{Math.round(pct)}% done today</div>
          <div style={{ fontSize: 11, color: G.primary, fontWeight: 700, marginTop: 4 }}>{completed} delivered ✓</div>
        </div>
      </div>
    </div>
  )
}

export default function DeliveryDashboardPage() {
  const navigate = useNavigate()
  const { deliveryPartner, setOnlineStatus } = useDeliveryStore()
  const [profile, setProfile] = useState(null)
  const [earnings, setEarnings] = useState({ todayEarnings: 0, totalEarnings: 0, todayOrders: 0 })
  const [orders, setOrders] = useState([])
  const [toggling, setToggling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newOrder, setNewOrder] = useState(null)
  const [shiftStart] = useState(Date.now())
  const [shiftTime, setShiftTime] = useState('0h 0m')

  useEffect(() => { fetchAll() }, [])

  // Shift timer
  useEffect(() => {
    const iv = setInterval(() => {
      const diff = Date.now() - shiftStart
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setShiftTime(`${h}h ${m}m`)
    }, 30000)
    return () => clearInterval(iv)
  }, [shiftStart])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [profileRes, earningsRes, ordersRes] = await Promise.all([
        getDeliveryProfile(), getEarnings(), getMyDeliveries(),
      ])
      setProfile(profileRes.data.deliveryPartner)
      setEarnings(earningsRes.data)
      const allOrders = ordersRes.data.orders || []
      setOrders(allOrders)
      // Check for newly assigned order
      const newest = allOrders.find(o => o.status === 'shipped')
      if (newest) setNewOrder(newest)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleToggle = async () => {
    try {
      setToggling(true)
      const res = await toggleOnlineStatus()
      setOnlineStatus(res.data.isOnline)
      setProfile(p => ({ ...p, isOnline: res.data.isOnline }))
    } catch (err) { console.error(err) }
    finally { setToggling(false) }
  }

  const isOnline = profile?.isOnline ?? false
  const yetToDeliver = orders.filter(o => o.status !== 'delivered')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const activeOrders = orders.filter(o => ['shipped', 'out_for_delivery', 'confirmed', 'packed'].includes(o.status))
  const codOrders = yetToDeliver.filter(o => o.paymentMethod === 'cod')
  const codTotal = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const rating = profile?.rating || 5.0
  const name = deliveryPartner?.name || profile?.name || 'Partner'
  const initial = name.charAt(0).toUpperCase()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛵</div>
        <div style={{
          width: 40, height: 40, border: `3px solid ${G.border}`, borderTop: `3px solid ${G.primary}`,
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: G.primary, fontWeight: 700, marginTop: 14, fontSize: 14 }}>Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.85} }
        .order-card:active { transform: scale(0.98); }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(160deg, ${G.primaryDark} 0%, ${G.primary} 60%, #2ec95e 100%)`,
        padding: '28px 20px 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>Welcome back 👋</div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, marginTop: 2, lineHeight: 1.2 }}>{name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 12px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#86efac' : '#fca5a5', display: 'inline-block' }} />
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              {/* Shift Timer */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ fontSize: 11 }}>⏱️</span>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{shiftTime}</span>
              </div>
            </div>
          </div>
          {/* Avatar + Rating */}
          <div style={{ textAlign: 'center' }}>
            <div onClick={() => navigate('/delivery/profile')} style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              border: '2.5px solid rgba(255,255,255,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 22, cursor: 'pointer', margin: '0 auto',
            }}>{initial}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 11 }}>⭐</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 14px', marginTop: -24 }}>

        {/* ── New Order Alert ── */}
        {newOrder && (
          <div style={{
            background: G.primary, borderRadius: 18, padding: '16px',
            marginBottom: 16, boxShadow: '0 8px 32px rgba(26,158,63,0.35)',
            animation: 'pulse 2s infinite',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>🔔 New Order Assigned!</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, marginTop: 4 }}>{newOrder.buyer?.name || 'Customer'}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                  {newOrder.deliveryAddress?.city} • ₹{newOrder.totalAmount}
                  {newOrder.paymentMethod === 'cod' && ' • 💵 COD'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => { navigate(`/delivery/orders/${newOrder._id}`); setNewOrder(null) }} style={{
                  background: '#fff', border: 'none', borderRadius: 12, padding: '8px 14px',
                  fontSize: 12, fontWeight: 800, color: G.primary, cursor: 'pointer',
                }}>Accept →</button>
                <button onClick={() => setNewOrder(null)} style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12, padding: '6px 14px',
                  fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toggle Card ── */}
        <div style={{
          background: G.card, borderRadius: 18, padding: '16px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 24px rgba(26,158,63,0.13)',
          marginBottom: 16, border: `1.5px solid ${G.border}`,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>
              {isOnline ? '🟢 Receiving Orders' : '🔴 Not Receiving Orders'}
            </div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 3, fontWeight: 600 }}>
              {isOnline ? 'Tap to go offline' : 'Tap to start receiving'}
            </div>
          </div>
          <button onClick={handleToggle} disabled={toggling} style={{
            width: 56, height: 30, borderRadius: 15,
            background: isOnline ? G.primary : '#e5e7eb',
            border: 'none', cursor: toggling ? 'not-allowed' : 'pointer',
            position: 'relative', transition: 'background 0.3s', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 4, left: isOnline ? 29 : 4,
              width: 22, height: 22, borderRadius: '50%',
              background: '#fff', transition: 'left 0.3s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: "Today's Earnings", value: `₹${earnings.todayEarnings || 0}`, icon: '💸', color: G.primary,  bg: G.primaryLight },
            { label: 'Total Earnings',   value: `₹${earnings.totalEarnings || 0}`, icon: '🏦', color: '#0369a1', bg: '#e0f2fe' },
            { label: 'Active Orders',    value: activeOrders.length,               icon: '🚀', color: '#d97706', bg: '#fef3c7' },
            { label: 'Delivered Today',  value: earnings.todayOrders || 0,         icon: '✅', color: '#059669', bg: '#d1fae5' },
          ].map(s => (
            <div key={s.label} style={{
              background: G.card, borderRadius: 16, padding: '16px 14px',
              boxShadow: '0 2px 12px rgba(26,158,63,0.07)',
              border: `1.5px solid ${s.bg}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              </div>
              <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── COD Alert ── */}
        {codTotal > 0 && (
          <div style={{
            background: G.card, borderRadius: 16, padding: '14px 16px', marginBottom: 16,
            border: '2px solid #fbbf24', boxShadow: '0 2px 12px rgba(251,191,36,0.15)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 32 }}>💵</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>COD Collection Pending</div>
              <div style={{ fontSize: 11, color: G.muted, fontWeight: 600, marginTop: 2 }}>
                Collect <span style={{ color: '#d97706', fontWeight: 900, fontSize: 15 }}>₹{codTotal}</span> from {codOrders.length} order{codOrders.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* ── Performance Ring ── */}
        <PerformanceRing
          completed={earnings.todayOrders || 0}
          total={Math.max((earnings.todayOrders || 0) + yetToDeliver.length, 1)}
        />

        {/* ── Weekly Chart ── */}
        <WeeklyChart orders={orders} />

        {/* ── Orders Overview ── */}
        <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          📋 Orders Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>

          {/* Yet to Deliver */}
          <div style={{ background: G.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,158,63,0.07)', border: `1.5px solid ${G.border}` }}>
            <div style={{ background: G.primary, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>📦</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>Pending</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 800, color: '#fff' }}>{yetToDeliver.length}</span>
            </div>
            <div style={{ padding: 10, maxHeight: 200, overflowY: 'auto' }}>
              {yetToDeliver.length === 0
                ? <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: '16px 0', fontWeight: 600 }}>No pending 🎉</div>
                : yetToDeliver.map(o => (
                  <div key={o._id} onClick={() => navigate(`/delivery/orders/${o._id}`)}
                    className="order-card"
                    style={{ padding: '8px 10px', borderRadius: 10, background: G.primaryLight, marginBottom: 7, cursor: 'pointer', borderLeft: `3px solid ${G.primary}`, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>{o.buyer?.name || 'Customer'}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2, fontWeight: 600 }}>{o.deliveryAddress?.city} • ₹{o.totalAmount}</div>
                    {o.paymentMethod === 'cod' && <div style={{ fontSize: 10, marginTop: 2, fontWeight: 700, color: '#d97706' }}>💵 COD</div>}
                    <div style={{ fontSize: 10, marginTop: 3, fontWeight: 700, color: G.primary, textTransform: 'uppercase' }}>{o.status?.replace(/_/g, ' ')}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Delivered */}
          <div style={{ background: G.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(5,150,105,0.08)', border: '1.5px solid #d1fae5' }}>
            <div style={{ background: '#059669', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>✅</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>Delivered</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 800, color: '#fff' }}>{deliveredOrders.length}</span>
            </div>
            <div style={{ padding: 10, maxHeight: 200, overflowY: 'auto' }}>
              {deliveredOrders.length === 0
                ? <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: '16px 0', fontWeight: 600 }}>None yet</div>
                : deliveredOrders.map(o => (
                  <div key={o._id} style={{ padding: '8px 10px', borderRadius: 10, background: '#d1fae5', marginBottom: 7, borderLeft: '3px solid #059669' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>{o.buyer?.name || 'Customer'}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2, fontWeight: 600 }}>{o.deliveryAddress?.city} • ₹{o.totalAmount}</div>
                    <div style={{ fontSize: 10, marginTop: 3, fontWeight: 700, color: '#059669' }}>DELIVERED ✓</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 10 }}>⚡ Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '📦', label: 'My Orders',  path: '/delivery/orders',   color: G.primary,  bg: G.primaryLight },
            { icon: '💰', label: 'Earnings',   path: '/delivery/earnings', color: '#0369a1',  bg: '#e0f2fe' },
            { icon: '👤', label: 'Profile',    path: '/delivery/profile',  color: '#d97706',  bg: '#fef3c7' },
            { icon: '🗺️', label: 'Navigate',   path: '/delivery/orders',   color: '#059669',  bg: '#d1fae5' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              style={{
                background: G.card, borderRadius: 16, padding: '18px 14px',
                border: `1.5px solid ${a.bg}`, cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 2px 12px rgba(26,158,63,0.07)', transition: 'all 0.18s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ width: 40, height: 40, background: a.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: a.color }}>{a.label}</div>
            </button>
          ))}
        </div>

      </div>
      <BottomNav active="home" />
    </div>
  )
}