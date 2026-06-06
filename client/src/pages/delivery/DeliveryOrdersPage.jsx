import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyDeliveries } from '../../api/deliveryAPI'
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

export default function DeliveryOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getMyDeliveries()
      setOrders(res.data.orders || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const activeOrders = orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status))
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const displayed = tab === 'active' ? activeOrders : deliveredOrders

  const statusConfig = {
    shipped:          { label: 'Assigned',        bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    out_for_delivery: { label: 'Out for Delivery', bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
    delivered:        { label: 'Delivered',        bg: '#d1fae5', color: '#065f46', dot: '#059669' },
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .order-row:active { transform: scale(0.99); opacity: 0.95; }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`,
        padding: '32px 20px 20px',
      }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>My Orders</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 16px', fontWeight: 500 }}>
          {orders.length} total orders assigned
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'active',    label: `Active (${activeOrders.length})` },
            { key: 'delivered', label: `Delivered (${deliveredOrders.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                background: tab === t.key ? '#fff' : 'rgba(255,255,255,0.2)',
                color: tab === t.key ? G.primary : '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${G.border}`, borderTop: `3px solid ${G.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: G.muted, fontSize: 14 }}>Loading orders...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <p style={{ color: G.text, fontWeight: 800, fontSize: 16, margin: '0 0 8px' }}>
              No {tab === 'active' ? 'active' : 'delivered'} orders
            </p>
            <p style={{ color: G.muted, fontSize: 13 }}>
              {tab === 'active' ? 'New orders will appear here' : 'Completed deliveries will show here'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map(order => {
              const sc = statusConfig[order.status] || statusConfig.shipped
              return (
                <button key={order._id}
                  onClick={() => navigate(`/delivery/orders/${order._id}`)}
                  className="order-row"
                  style={{
                    width: '100%', background: G.card, borderRadius: 18,
                    padding: '16px', border: `1.5px solid ${G.border}`,
                    boxShadow: '0 2px 12px rgba(26,158,63,0.07)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: G.primaryLight,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 900, color: G.primary,
                        border: `1.5px solid ${G.border}`,
                      }}>
                        {(order.buyer?.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: G.text, fontSize: 14 }}>
                          {order.buyer?.name || 'Customer'}
                        </p>
                        <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 11, fontWeight: 600 }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: sc.bg, color: sc.color,
                      padding: '5px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Address */}
                  <div style={{ background: G.primaryLight, borderRadius: 12, padding: '10px 12px', marginBottom: 12, border: `1px solid ${G.border}` }}>
                    <p style={{ margin: '0 0 3px', color: G.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>📍 Delivery Address</p>
                    <p style={{ margin: 0, color: G.text, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                      {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, color: G.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Payment</p>
                      <p style={{
                        margin: '2px 0 0', fontSize: 13, fontWeight: 700,
                        color: order.paymentMethod === 'cod' ? '#d97706' : G.primary,
                      }}>
                        {order.paymentMethod === 'cod' ? `💵 COD ₹${order.totalAmount}` : '✅ Prepaid'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: G.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Items</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: G.text }}>{order.items?.length} item(s)</p>
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: G.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: G.primary, fontSize: 14, fontWeight: 800,
                    }}>→</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="orders" />
    </div>
  )
}