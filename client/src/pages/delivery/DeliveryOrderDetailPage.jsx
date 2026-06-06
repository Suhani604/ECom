import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyDeliveries, markPickedUp, markDelivered, resendOTP } from '../../api/deliveryAPI'

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

export default function DeliveryOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchOrder() }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await getMyDeliveries()
      const found = (res.data.orders || []).find(o => o._id === id)
      setOrder(found || null)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus()
  }

  const handlePickedUp = async () => {
    try {
      setActionLoading(true); setError('')
      await markPickedUp(id)
      setSuccess('Marked as picked up! 🛵')
      fetchOrder()
    } catch (err) { setError(err.response?.data?.message || 'Failed') }
    finally { setActionLoading(false) }
  }

  const handleDelivered = async () => {
    const otpStr = otp.join('')
    if (otpStr.length !== 4) return setError('Enter 4-digit OTP')
    try {
      setActionLoading(true); setError('')
      await markDelivered(id, otpStr)
      setSuccess('Order delivered successfully! ✅')
      fetchOrder()
    } catch (err) { setError(err.response?.data?.message || 'Wrong OTP') }
    finally { setActionLoading(false) }
  }

  const openMaps = () => {
    if (!order?.deliveryAddress) return
    const addr = `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`
    window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank')
  }

  const callCustomer = () => {
    const phone = order?.deliveryAddress?.phone || order?.buyer?.phone
    if (phone) window.open(`tel:${phone}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${G.border}`, borderTop: `3px solid ${G.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: G.muted, marginTop: 12, fontSize: 14 }}>Loading order...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Outfit','Nunito',sans-serif" }}>
      <div style={{ fontSize: 56 }}>📭</div>
      <p style={{ color: G.text, fontWeight: 800, fontSize: 16 }}>Order not found</p>
      <button onClick={() => navigate('/delivery/orders')}
        style={{ background: G.primary, color: '#fff', padding: '12px 24px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        ← Go Back
      </button>
    </div>
  )

  const isShipped = order.status === 'shipped'
  const isOutForDelivery = order.status === 'out_for_delivery'
  const isDelivered = order.status === 'delivered'

  const statusSteps = [
    { key: 'shipped', label: 'Assigned', icon: '📋' },
    { key: 'out_for_delivery', label: 'Picked Up', icon: '🛵' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ]
  const currentStep = statusSteps.findIndex(s => s.key === order.status)

  const sectionStyle = {
    background: G.card, borderRadius: 18, padding: '16px 16px',
    border: `1.5px solid ${G.border}`,
    boxShadow: '0 2px 12px rgba(26,158,63,0.07)',
  }
  const labelStyle = { color: G.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px', display: 'block' }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif", paddingBottom: 32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .otp-input:focus { border-color: ${G.primary} !important; box-shadow: 0 0 0 3px rgba(26,158,63,0.15); outline: none; background: #fff !important; }
        .action-btn:active:not(:disabled) { transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`,
        padding: '20px 16px 20px',
      }}>
        <button onClick={() => navigate('/delivery/orders')}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Orders
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>Order Detail</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0, fontWeight: 600 }}>
              #{order._id.slice(-10).toUpperCase()}
            </p>
          </div>
          <span style={{
            background: isDelivered ? '#d1fae5' : isOutForDelivery ? '#fff7ed' : '#fef9c3',
            color: isDelivered ? '#065f46' : isOutForDelivery ? '#9a3412' : '#854d0e',
            padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>
            {isDelivered ? '✅ Delivered' : isOutForDelivery ? '🚚 On the Way' : '📋 Assigned'}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ margin: '16px 14px 0' }}>
        <div style={{ ...sectionStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', top: 20, left: '16%', right: '16%', height: 3, background: G.border, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 20, left: '16%', width: `${Math.min((currentStep / 2) * 100, 100)}%`, height: 3, background: G.primary, zIndex: 1, transition: 'width 0.4s' }} />

            {statusSteps.map((step, idx) => (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: idx <= currentStep ? G.primary : G.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.3s',
                  border: idx === currentStep ? `3px solid ${G.primaryDark}` : '3px solid transparent',
                }}>
                  {step.icon}
                </div>
                <p style={{ fontSize: 11, margin: '6px 0 0', fontWeight: 700, color: idx <= currentStep ? G.primary : G.muted, textAlign: 'center' }}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Customer */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Customer</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, background: G.primaryLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: G.primary, border: `1.5px solid ${G.border}`,
            }}>
              {(order.buyer?.name || order.deliveryAddress?.name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: G.text, fontSize: 15 }}>
                {order.buyer?.name || order.deliveryAddress?.name}
              </p>
              <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 13 }}>
                {order.deliveryAddress?.phone || order.buyer?.phone}
              </p>
            </div>
          </div>
          <button onClick={callCustomer}
            className="action-btn"
            style={{
              width: '100%', background: G.primaryLight, border: `1.5px solid ${G.border}`,
              color: G.primary, padding: '12px', borderRadius: 12,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.18s',
            }}>
            📞 Call Customer
          </button>
        </div>

        {/* Address */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Delivery Address</span>
          <div style={{ background: G.primaryLight, borderRadius: 12, padding: '12px', marginBottom: 10, border: `1px solid ${G.border}` }}>
            <p style={{ margin: 0, color: G.text, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
              {order.deliveryAddress?.line1}
              {order.deliveryAddress?.line2 ? `, ${order.deliveryAddress.line2}` : ''}
            </p>
            <p style={{ margin: '4px 0 0', color: G.muted, fontSize: 13 }}>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
            </p>
          </div>
          <button onClick={openMaps}
            className="action-btn"
            style={{
              width: '100%', background: '#eff6ff', border: '1.5px solid #bfdbfe',
              color: '#1d4ed8', padding: '12px', borderRadius: 12,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.18s',
            }}>
            🗺️ Open in Google Maps
          </button>
        </div>

        {/* Order Items */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Items ({order.items?.length})</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, background: G.primaryLight, borderRadius: 12, padding: 10, border: `1px solid ${G.border}` }}>
                {item.image && (
                  <img src={item.image} alt={item.title} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: G.text, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  {(item.size || item.color) && (
                    <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 11 }}>
                      {item.size && `Size: ${item.size}`} {item.color && `• ${item.color}`}
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0', color: G.primary, fontSize: 13, fontWeight: 800 }}>
                    ₹{item.sellingPrice} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Payment</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: order.paymentMethod === 'cod' ? '#fef3c7' : G.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {order.paymentMethod === 'cod' ? '💵' : '✅'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: G.text, fontSize: 14 }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid'}
                </p>
                <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 12 }}>
                  {order.paymentMethod === 'cod' ? 'Collect from customer' : 'Already paid online'}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: order.paymentMethod === 'cod' ? '#d97706' : G.primary, margin: 0 }}>
              ₹{order.totalAmount}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fff1f1', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontWeight: 600 }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{ background: G.primaryLight, border: `1.5px solid ${G.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <p style={{ color: G.primary, fontSize: 13, margin: 0, fontWeight: 600 }}>{success}</p>
          </div>
        )}

        {/* Action */}
        {!isDelivered && (
          <div style={sectionStyle}>
            <span style={labelStyle}>Action Required</span>

            {isShipped && (
              <button onClick={handlePickedUp} disabled={actionLoading}
                className="action-btn"
                style={{
                  width: '100%', padding: '16px',
                  background: actionLoading ? '#9dcca9' : `linear-gradient(135deg,${G.primary},${G.primaryDark})`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 800, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: actionLoading ? 'none' : '0 4px 16px rgba(26,158,63,0.35)',
                  transition: 'all 0.18s',
                }}>
                {actionLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Updating...
                  </span>
                ) : '🛵 Mark as Picked Up'}
              </button>
            )}

            {isOutForDelivery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* OTP Section */}
                <div style={{ background: G.primaryLight, borderRadius: 14, padding: '16px', border: `1.5px solid ${G.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, background: G.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔐</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, color: G.text, fontSize: 14 }}>Enter Delivery OTP</p>
                      <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 12 }}>Ask customer for 4-digit code</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(e.target.value, idx)}
                        onKeyDown={e => handleOtpKeyDown(e, idx)}
                        className="otp-input"
                        style={{
                          width: 56, height: 60,
                          background: '#fff',
                          border: `2px solid ${digit ? G.primary : G.border}`,
                          borderRadius: 14, textAlign: 'center',
                          fontSize: 24, fontWeight: 900, color: G.text,
                          fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        setActionLoading(true)
                        await resendOTP(order._id)
                        setSuccess('OTP sent to customer via SMS! 📱')
                      } catch { setError('Failed to send OTP') }
                      finally { setActionLoading(false) }
                    }}
                    disabled={actionLoading}
                    style={{
                      width: '100%', background: '#fff', border: `1.5px solid ${G.border}`,
                      color: G.primary, padding: '10px', borderRadius: 12,
                      fontWeight: 700, fontSize: 13, cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.18s',
                    }}>
                    📱 Send OTP to Customer
                  </button>
                </div>

                <button onClick={handleDelivered}
                  disabled={actionLoading || otp.join('').length !== 4}
                  className="action-btn"
                  style={{
                    width: '100%', padding: '16px',
                    background: otp.join('').length === 4 && !actionLoading
                      ? `linear-gradient(135deg,${G.primary},${G.primaryDark})`
                      : '#9dcca9',
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontSize: 15, fontWeight: 800,
                    cursor: otp.join('').length === 4 && !actionLoading ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    boxShadow: otp.join('').length === 4 ? '0 4px 16px rgba(26,158,63,0.35)' : 'none',
                    transition: 'all 0.18s',
                  }}>
                  {actionLoading ? 'Verifying OTP...' : '✅ Mark as Delivered'}
                </button>
              </div>
            )}
          </div>
        )}

        {isDelivered && (
          <div style={{
            background: G.primaryLight, border: `2px solid ${G.border}`,
            borderRadius: 20, padding: '28px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ color: G.primary, fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>Delivered!</p>
            <p style={{ color: G.muted, fontSize: 14, margin: '0 0 16px' }}>+₹40 added to your earnings</p>
            <button onClick={() => navigate('/delivery/orders')}
              style={{
                background: G.primary, color: '#fff', padding: '12px 28px',
                borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              ← View All Orders
            </button>
          </div>
        )}

      </div>
    </div>
  )
}