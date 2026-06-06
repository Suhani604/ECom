import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginDelivery } from '../../api/deliveryAPI'
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
}

export default function DeliveryLoginPage() {
  const navigate = useNavigate()
  const loginSuccess = useDeliveryStore((s) => s.loginSuccess)
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    if (!form.phone || !form.password) return setError('Please fill all fields')
    try {
      setLoading(true)
      setError('')
      const res = await loginDelivery(form)
      loginSuccess(res.data.token, res.data.deliveryPartner)
      navigate('/delivery/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit', 'Nunito', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .del-input { transition: all 0.2s; }
        .del-input:focus { outline: none; border-color: ${G.primary} !important; box-shadow: 0 0 0 3px rgba(26,158,63,0.15); background: white !important; }
        .del-btn-main { transition: all 0.18s; }
        .del-btn-main:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,158,63,0.4) !important; }
        .del-btn-main:active:not(:disabled) { transform: translateY(0); }
        .ripple { position: relative; overflow: hidden; }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(160deg, ${G.primaryDark} 0%, ${G.primary} 55%, #2ec95e 100%)`,
        padding: '48px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: 30, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}>🛵</div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Delivery Partner</div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginTop: 1 }}>Partner App</div>
            </div>
          </div>

          <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>
            Welcome Back!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0, fontWeight: 500 }}>
            Login to start delivering orders
          </p>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '0 16px 32px', marginTop: -24 }}>
        <div style={{
          background: G.card,
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 8px 40px rgba(26,158,63,0.1)',
          border: `1px solid ${G.border}`,
        }}>

          <h2 style={{ color: G.text, fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Login to Account</h2>
          <p style={{ color: G.muted, fontSize: 13, margin: '0 0 24px', fontWeight: 500 }}>Enter your registered details</p>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: G.text, fontSize: 13, fontWeight: 700, marginBottom: 7 }}>
              📱 Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: G.muted, fontSize: 13, fontWeight: 600,
              }}>+91</span>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="del-input"
                style={{
                  width: '100%', padding: '14px 14px 14px 44px',
                  border: `1.5px solid ${G.border}`, borderRadius: 14,
                  fontSize: 15, background: G.primaryLight, color: G.text,
                  fontFamily: 'inherit', fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: G.text, fontSize: 13, fontWeight: 700, marginBottom: 7 }}>
              🔒 Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="del-input"
                style={{
                  width: '100%', padding: '14px 44px 14px 14px',
                  border: `1.5px solid ${G.border}`, borderRadius: 14,
                  fontSize: 15, background: G.primaryLight, color: G.text,
                  fontFamily: 'inherit', fontWeight: 600,
                }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff1f1', border: '1.5px solid #fca5a5',
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="del-btn-main ripple"
            style={{
              width: '100%', padding: '16px',
              background: loading ? '#9dcca9' : `linear-gradient(135deg, ${G.primary}, ${G.primaryDark})`,
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(26,158,63,0.35)',
              letterSpacing: 0.3,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Logging in...
              </span>
            ) : 'Login →'}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: G.muted, fontSize: 14, margin: 0, fontWeight: 500 }}>
            New delivery partner?{' '}
            <span
              onClick={() => navigate('/delivery/register')}
              style={{ color: G.primary, fontWeight: 800, cursor: 'pointer' }}
            >
              Register here →
            </span>
          </p>
        </div>

        {/* Help */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: G.primaryLight, borderRadius: 14,
          border: `1px solid ${G.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🤝</span>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: G.text }}>Need Help?</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: G.muted }}>Contact support for login issues</p>
          </div>
        </div>
      </div>
    </div>
  )
}