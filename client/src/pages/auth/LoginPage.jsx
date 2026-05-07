import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import api from '../../api/axiosInstance.js'
import toast from 'react-hot-toast'

const f = 'Poppins, sans-serif'

export default function LoginPage() {
  const navigate   = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)
  const [form,    setForm]    = useState({ emailOrPhone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [focused, setFocused] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.emailOrPhone || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        emailOrPhone: form.emailOrPhone,
        password:     form.password,
      })
      storeLogin(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}! 👋`)
      const routes = { buyer: '/home', seller: '/seller/dashboard', admin: '/admin/dashboard' }
      navigate(routes[data.user.role] || '/home', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const inp = (name) => ({
    width: '100%', padding: '12px 16px', border: `1.5px solid ${focused === name ? '#E91E8C' : '#EBEBF0'}`,
    borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s', background: focused === name ? '#FDF0F8' : 'white',
    color: '#1A1A2E',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: f, background: '#F9F9FB' }}>

      {/* Left panel — branding */}
      <div style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', position: 'relative', overflow: 'hidden' }} className="auth-left">
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '60px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'white', fontSize: '26px', fontWeight: '800' }}>S</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 12px', lineHeight: '1.2' }}>
            Welcome<br />Back! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 48px', lineHeight: '1.7' }}>
            Sign in to continue shopping the latest fashion for kids, men & women.
          </p>

          {/* Feature pills */}
          {['🛍️ 1000+ fashion products', '🚚 Free delivery on ₹499+', '✅ Trusted sellers only', '🔒 Secure payments'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{text.split(' ')[0]}</div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>{text.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo (mobile) */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 6px' }}>Sign In</h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Welcome back to StyleHub</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B4B6B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email or Phone</label>
              <input type="text" value={form.emailOrPhone}
                onChange={e => setForm({ ...form, emailOrPhone: e.target.value })}
                onFocus={() => setFocused('ep')} onBlur={() => setFocused('')}
                placeholder="email@example.com or 9876543210"
                style={inp('ep')} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B4B6B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                  placeholder="Enter your password"
                  style={{ ...inp('pw'), paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#E91E8C', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#F8D0EC' : 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: loading ? '#C0C0D0' : 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.35)', transition: 'all 0.2s', letterSpacing: '0.3px' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#EBEBF0' }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#EBEBF0' }} />
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/signup/buyer" style={{ display: 'block', padding: '12px', border: '1.5px solid #EBEBF0', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#E91E8C', textDecoration: 'none', transition: 'all 0.2s', background: '#FDF0F8' }}>
              🛍️ New here? Create a buyer account
            </Link>
            <Link to="/signup/seller" style={{ display: 'block', padding: '12px', border: '1.5px solid #EBEBF0', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#7C3AED', textDecoration: 'none', transition: 'all 0.2s', background: '#F5F0FF' }}>
              🏪 Want to sell? Become a seller
            </Link>
          </div>

          {/* Dev hint */}
          <div style={{ marginTop: '24px', padding: '12px 16px', background: '#F9F9FB', borderRadius: '12px', border: '1px solid #EBEBF0' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Test Credentials</p>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>admin@garments.com / Admin@1234</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left { display: flex !important; flex-direction: column; }
        }
      `}</style>
    </div>
  )
}