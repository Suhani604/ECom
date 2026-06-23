import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import useCartStore from '../../context/useCartStore.js'
import api from '../../api/axiosInstance.js'
import toast from 'react-hot-toast'

const f = '"DM Sans", Poppins, sans-serif'

export default function LoginPage() {
 const navigate   = useNavigate()
const storeLogin = useAuthStore((s) => s.login)
const reloadCart = useCartStore((s) => s.reloadCart)
const [searchParams] = useSearchParams()
const redirectTo = searchParams.get('redirect')
  const [form,    setForm]    = useState({ emailOrPhone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [role, setRole] = useState('buyer')
  const [focused, setFocused] = useState('')
  const { t } = useTranslation()

  const handleLogin = async (e) => {
    console.log('redirectTo:', redirectTo)
    e.preventDefault()
    if (!form.emailOrPhone || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        emailOrPhone: form.emailOrPhone,
        password:     form.password,
      })
  
      if (data.user.role !== role) {
        toast.error(`This account is not registered as a ${role.charAt(0).toUpperCase() + role.slice(1)}. Please select the correct tab.`)
        setLoading(false)
        return
      }
      storeLogin(data.user, data.token)
reloadCart()
toast.success(`Welcome back, ${data.user.name}! 👋`)
     if (redirectTo && data.user.role === 'buyer') {
  navigate(redirectTo, { replace: true })
} else {
  const routes = { buyer: '/home', seller: '/seller/dashboard', admin: '/admin/dashboard' }
  navigate(routes[data.user.role] || '/home', { replace: true })
}
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const inp = (name) => ({
    width: '100%',
    padding: '12px 16px',
    border: `1.5px solid ${focused === name ? '#E91E8C' : '#E2E8F0'}`,
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: f,
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    background: focused === name ? '#FDF0F8' : '#FAFAFA',
    color: '#0F172A',
    boxShadow: focused === name ? '0 0 0 4px rgba(233,30,140,0.08)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: f, background: '#F1F5F9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .sign-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(233,30,140,0.4) !important; }
        .sign-btn:active { transform: translateY(0); }
        .nav-link:hover { border-color: #E91E8C !important; color: #E91E8C !important; background: #FDF0F8 !important; }
        .card-shadow { box-shadow: 0 20px 60px rgba(15,10,30,0.12), 0 4px 16px rgba(15,10,30,0.06); }
      `}</style>

      {/* ── TOP DARK BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A0E21 0%, #4A2040 0%, #8C5374 200%)',
        padding: '0 82px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 10% 50%, rgba(233,30,140,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(124,58,237,0.22) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '20%', width: '200px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '5%', width: '220px', height: '120px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '70px 0' }}>
          {/* Brand */}

           
          <div
              onClick={() => navigate('/home')} 
             style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(233,30,140,0.4)', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>S</span>
            </div>
            <span style={{  background: 'linear-gradient(90deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',fontSize: '23px', fontWeight: '700', letterSpacing: '-0.3px' }}>StyleHub</span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {[['50K+', 'Happy Buyers'], ['2K+', 'Sellers'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '17px', margin: '0 0 2px', letterSpacing: '-0.3px' }}>{val}</p>
                <p style={{ color: 'white', fontSize: '13px', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {[['🚀', '1000+ styles'], ['🚚', 'Free delivery ₹499+'], ['🔒', 'Secure payments'], ['↩️', '7-day returns']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>{icon}</span>
                <span style={{ color: 'white', fontSize: '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline strip */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', paddingBottom: '20px' }}>
          <p style={{ margin: 0, color: 'white', fontSize: '12px', fontWeight: '500' }}>
            <span style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>Fashion that speaks for you</span>
            {' '}— Discover curated collections in kids, men & women's fashion.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <div className="card-shadow" style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '40px 36px' }}>

          {/* Logo icon */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '54px', height: '54px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 5px', letterSpacing: '-0.5px' }}>{t('welcomeBack')}</h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, fontWeight: '500' }}>{t('signInSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Role Tabs */}
                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '0px', padding: '4px', marginBottom: '20px' }}>
                  {['admin', 'seller', 'buyer'].map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      style={{
                        flex: 1, padding: '9px', border: 'none', borderRadius: '0px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: '700', fontFamily: f, transition: 'all 0.2s',
                        background: role === r ? 'white' : 'transparent',
                        color: role === r ? (r === 'admin' ? '#7C3AED' : r === 'seller' ? '#E91E8C' : '#0891B2') : '#94A3B8',
                        boxShadow: role === r ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                      }}>
                      {r === 'admin' ? '⚙️ Admin' : r === 'seller' ? '🏪 Seller' : '🛍️ Buyer'}
                    </button>
                  ))}
                </div>
            <div style={{ marginBottom: '14px' }}> 
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', letterSpacing: '0.3px' }}>{t('emailOrPhone')}</label>
              <input
                type="text"
                value={form.emailOrPhone}
                onChange={e => setForm({ ...form, emailOrPhone: e.target.value })}
                onFocus={() => setFocused('ep')} onBlur={() => setFocused('')}
                placeholder={t('emailPlaceholder')}
                style={inp('ep')}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', letterSpacing: '0.3px' }}>{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                 placeholder={t('passwordPlaceholder')}
                  style={{ ...inp('pw'), paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '22px' }}>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#E91E8C', fontWeight: '600', textDecoration: 'none' }}>
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sign-btn"
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#F3E8F0' : 'linear-gradient(135deg,#E91E8C 0%,#9333EA 100%)',
                color: loading ? '#C084A0' : 'white',
                border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f,
                boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.3)',
                transition: 'all 0.2s', letterSpacing: '0.2px',
              }}>
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.3px' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to={`/signup/buyer${redirectTo ? `?redirect=${redirectTo}` : ''}`} className="nav-link" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
              fontSize: '13px', fontWeight: '600', color: '#E91E8C', textDecoration: 'none',
              transition: 'all 0.2s', background: 'white',
            }}>
             🛍️ {t('createBuyerAccount')}
            </Link>
            <Link to="/signup/seller" className="nav-link" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
              fontSize: '13px', fontWeight: '600', color: '#7C3AED', textDecoration: 'none',
              transition: 'all 0.2s', background: 'white',
            }}>
              🏪 {t('becomeASeller')}
            </Link>
          </div>
              <Link to="/delivery/login" className="nav-link" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '10px',
                fontSize: '13px', fontWeight: '600', color: '#f97316', textDecoration: 'none',
                transition: 'all 0.2s', background: 'white',
              }}>
                🛵 {t('deliveryPartnerLogin')}
              </Link>


          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'none', border: 'none', color: '#94A3B8',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: f,
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
                borderRadius: '8px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E91E8C'; e.currentTarget.style.background = '#FDF0F8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none'; }}
            >
              ← {t('backToHome')}
            </button>
          </div>

          {/* Dev credentials */}
          <div style={{ marginTop: '16px', padding: '10px 14px', background: '#F1F5F9', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dev Credentials</p>
            <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '500' }}>admin@garments.com / Admin@1234</p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DARK BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0A1E 0%, #1E0A3C 50%, #3B0764 100%)',
        padding: '14px 32px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 90% 50%, rgba(233,30,140,0.12) 0%, transparent 55%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: '500' }}>© 2025 StyleHub. All rights reserved.</span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>·</span>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}>Privacy</Link>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>·</span>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}>Terms</Link>
        </div>
      </div>
    </div>
  )
}