import { useEffect, useState } from 'react'
import { getEarnings, getMyDeliveries } from '../../api/deliveryAPI'
import { BottomNav } from './DeliveryDashboardPage'

const G = {
  primary: '#1a9e3f',
  primaryDark: '#157a32',
  primaryLight: '#e8f5ec',
  bg: '#f4f6f4',
  card: '#ffffff',
  text: '#1a2e1a',
  muted: '#6b7c6b',
  border: '#d4e8d4',
}

export default function DeliveryEarningsPage() {
  const [earnings, setEarnings] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('today')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [earnRes, ordersRes] = await Promise.all([getEarnings(), getMyDeliveries()])
      setEarnings(earnRes.data)
      setOrders(ordersRes.data.orders || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const now = new Date()
  const getFilteredOrders = () => {
    return orders.filter(o => {
      if (o.status !== 'delivered') return false
      const d = new Date(o.deliveredAt || o.updatedAt)
      if (tab === 'today') {
        const today = new Date(); today.setHours(0, 0, 0, 0); return d >= today
      }
      if (tab === 'week') {
        const w = new Date(); w.setDate(now.getDate() - 7); return d >= w
      }
      if (tab === 'month') {
        const m = new Date(); m.setDate(now.getDate() - 30); return d >= m
      }
      return false
    })
  }

  const filtered = getFilteredOrders()
  const filteredEarning = filtered.length * 40

  const sectionStyle = {
    background: G.card, borderRadius: 18, padding: '16px',
    border: `1.5px solid ${G.border}`,
    boxShadow: '0 2px 12px rgba(26,158,63,0.07)',
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`,
        padding: '32px 20px 24px',
      }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>💰 Earnings</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, fontWeight: 500 }}>Track your delivery income</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${G.border}`, borderTop: `3px solid ${G.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: G.muted, fontSize: 14 }}>Loading earnings...</p>
        </div>
      ) : (
        <div style={{ padding: '16px 14px' }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Earned',      value: `₹${earnings?.totalEarnings || 0}`, icon: '🏦', color: G.primary,  bg: G.primaryLight,  sub: 'Lifetime' },
              { label: 'Today',             value: `₹${earnings?.todayEarnings || 0}`, icon: '📅', color: '#d97706',  bg: '#fef3c7',  sub: `${earnings?.todayOrders || 0} deliveries` },
              { label: 'Total Deliveries',  value: earnings?.totalOrders || 0,          icon: '📦', color: '#0369a1',  bg: '#e0f2fe',  sub: 'All time' },
              { label: 'Per Delivery',      value: '₹40',                               icon: '💵', color: '#059669',  bg: '#d1fae5',  sub: 'Fixed rate' },
            ].map(s => (
              <div key={s.label} style={{ ...sectionStyle, border: `1.5px solid ${s.bg}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                </div>
                <p style={{ margin: '0 0 3px', color: G.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
                <p style={{ margin: '0 0 2px', color: s.color, fontSize: 24, fontWeight: 900 }}>{s.value}</p>
                <p style={{ margin: 0, color: G.muted, fontSize: 11 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Withdrawal Banner */}
          <div style={{
            background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`,
            borderRadius: 18, padding: '20px', marginBottom: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 4px', fontWeight: 600 }}>Pending Withdrawal</p>
                <p style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: '0 0 4px' }}>₹{earnings?.pendingWithdrawal || 0}</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0 }}>Available to withdraw</p>
              </div>
              <div style={{ fontSize: 40, opacity: 0.8 }}>💰</div>
            </div>
            <button style={{
              width: '100%', marginTop: 16, padding: '12px',
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 12,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              backdropFilter: 'blur(8px)',
            }}>
              Request Withdrawal →
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'week',  label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding: '8px 14px', borderRadius: 20,
                  background: tab === t.key ? G.primary : G.primaryLight,
                  color: tab === t.key ? '#fff' : G.muted,
                  border: `1.5px solid ${tab === t.key ? G.primary : G.border}`,
                  cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Period Summary */}
          <div style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <p style={{ margin: '0 0 4px', color: G.muted, fontSize: 12, fontWeight: 700 }}>
                {tab === 'today' ? "Today's" : tab === 'week' ? 'This Week' : 'This Month'} Earnings
              </p>
              <p style={{ margin: 0, color: G.primary, fontSize: 26, fontWeight: 900 }}>₹{filteredEarning}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px', color: G.muted, fontSize: 12, fontWeight: 700 }}>Deliveries</p>
              <p style={{ margin: 0, color: G.text, fontSize: 26, fontWeight: 900 }}>{filtered.length}</p>
            </div>
          </div>

          {/* History List */}
          <p style={{ color: G.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Delivery History
          </p>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: G.text, fontWeight: 800, fontSize: 15, margin: '0 0 6px' }}>No deliveries</p>
              <p style={{ color: G.muted, fontSize: 13 }}>No deliveries in this period</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(order => (
                <div key={order._id} style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 42, height: 42, background: G.primaryLight, borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, border: `1px solid ${G.border}`,
                    }}>✅</div>
                    <div>
                      <p style={{ margin: 0, color: G.text, fontSize: 14, fontWeight: 700 }}>
                        {order.buyer?.name || 'Customer'}
                      </p>
                      <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 11 }}>
                        #{order._id.slice(-8).toUpperCase()} •{' '}
                        {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, color: G.primary, fontWeight: 900, fontSize: 15 }}>+₹40</p>
                    {order.paymentMethod === 'cod' && (
                      <p style={{ margin: '2px 0 0', color: '#d97706', fontSize: 11, fontWeight: 600 }}>COD ₹{order.totalAmount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav active="earnings" />
    </div>
  )
}