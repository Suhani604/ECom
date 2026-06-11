import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = '"DM Sans", Poppins, sans-serif'

// ── FIX: Vite uses import.meta.env.MODE, NOT process.env.NODE_ENV ─────────────
const isDev = import.meta.env.MODE !== 'production'

export default function BuyerSignupPage() {
  const navigate   = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)
  const redirectTo = new URLSearchParams(window.location.search).get('redirect')
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId,  setUserId]  = useState(null)
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [focused, setFocused] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' })

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password)
      return toast.error('All fields are required')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(form.phone))
      return toast.error('Enter valid 10-digit mobile number')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup/buyer', {
        name: form.name, email: form.email,
        phone: form.phone, password: form.password,
      }, { timeout: 60000 })
      setUserId(data.userId)
      setEmail(form.email)
      setStep(2)
      // ── FIX: isDev constant use karo ─────────────────────────────────────
      toast.success(
        isDev
          ? 'OTP hai: 123456 (dev mode) 🔑'
          : 'OTP bheja gaya! Email check karo 📧'
      )
    } catch (error) {
      // ── FIX: server ka exact message dikhao, generic nahi ────────────────
      const msg = error.response?.data?.message || error.message || 'Signup failed. Try again.'
      toast.error(msg)
      console.error('Signup error:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp })
      storeLogin(data.user, data.token)
      toast.success('Account created! Happy shopping 🛍️')
      navigate(redirectTo || '/home', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      await api.post('/auth/resend-otp', { userId })
      toast.success(isDev ? 'OTP: 123456 (dev mode)' : 'OTP resent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP')
    }
  }

  const inp = (name) => ({
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${focused === name ? '#E91E8C' : '#E2E8F0'}`,
    borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s',
    background: focused === name ? '#FDF0F8' : '#FAFAFA', color: '#0F172A',
    boxShadow: focused === name ? '0 0 0 4px rgba(233,30,140,0.08)' : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: f, background: '#F1F5F9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(233,30,140,0.4) !important; }
        .top-nav-link:hover { background: rgba(255,255,255,0.12) !important; color: white !important; }
        .card-shadow { box-shadow: 0 20px 60px rgba(15,10,30,0.12), 0 4px 16px rgba(15,10,30,0.06); }
        .resend-btn:hover { color: #E91E8C !important; }
      `}</style>

      {/* TOP DARK BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #1A0E21 0%, #4A2040 0%, #8C5374 200%)', padding: '0 42px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 15% 50%, rgba(233,30,140,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(124,58,237,0.2) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 0' }}>
          <div onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(233,30,140,0.4)', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '25px', fontWeight: '800' }}>S</span>
            </div>
            <span style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '23px', fontWeight: '700', letterSpacing: '-0.3px' }}>StyleHub</span>
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            {[['✨', 'Curated Collections'], ['🚚', 'Free ₹499+'], ['🔒', '100% Secure'], ['↩️', 'Easy Returns']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" className="top-nav-link" style={{ color: 'rgba(0,204,255,0.75)', fontSize: '16px', fontWeight: '600', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.2s', background: 'rgba(0,204,255,0.06)' }}>Sign In</Link>
            <Link to="/signup/seller" className="top-nav-link" style={{ color: 'rgba(167,139,250,0.9)', fontSize: '16px', fontWeight: '600', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)', transition: 'all 0.2s', background: 'rgba(124,58,237,0.1)' }}>🏪 Sell with us</Link>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', paddingBottom: '15px', display: 'flex', gap: '30px', alignItems: 'center' }}>
          {[['50K+','Shoppers'], ['1K+', 'Brands'], ['4.9★', 'Rating']].map(([val, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{val}</span>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
            </div>
          ))}
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>·</span>
          <p style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>Shop the latest fashion trends</span>
            {' '}— Join thousands in kids, men & women's garments.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="card-shadow" style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '36px 32px' }}>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              {step === 1 ? 'Join StyleHub and start shopping today' : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: '4px', borderRadius: '4px', transition: 'all 0.35s', width: step === s ? '32px' : '8px', background: step >= s ? '#E91E8C' : '#E2E8F0' }} />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px', letterSpacing: '0.3px' }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    placeholder="Your full name" style={inp('name')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px', letterSpacing: '0.3px' }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="email@example.com" style={inp('email')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px', letterSpacing: '0.3px' }}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#94A3B8', fontWeight: '600', borderRight: '1px solid #E2E8F0', paddingRight: '10px', zIndex: 1 }}>+91</div>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                      placeholder="10-digit number" maxLength={10}
                      style={{ ...inp('phone'), paddingLeft: '58px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px', letterSpacing: '0.3px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                      placeholder="Min. 6 characters" style={{ ...inp('pw'), paddingRight: '48px' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="submit-btn"
                  style={{ width: '100%', padding: '13px', background: loading ? '#F3E8F0' : 'linear-gradient(135deg,#E91E8C 0%,#9333EA 100%)', color: loading ? '#C084A0' : 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.3)', transition: 'all 0.2s', marginTop: '2px' }}>
                  {loading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ background: 'linear-gradient(135deg,#FDF0F8,#F5F0FF)', border: '1.5px dashed #E91E8C', borderRadius: '12px', padding: '18px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>📧</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 3px', fontWeight: '500' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#E91E8C', margin: '0 0 6px' }}>{email}</p>
                {/* ── FIX: dev mode mein OTP seedha dikhao ── */}
                {isDev && (
                  <p style={{ fontSize: '12px', color: '#7C3AED', fontWeight: '700', margin: 0, background: '#F5F0FF', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    🔑 Dev OTP: 123456
                  </p>
                )}
              </div>

              {/* OTP digit boxes */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: '44px', height: '50px', border: `2px solid ${otp[i] ? '#E91E8C' : '#E2E8F0'}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#0F172A', background: otp[i] ? '#FDF0F8' : 'white', boxShadow: otp[i] ? '0 0 0 3px rgba(233,30,140,0.1)' : 'none', transition: 'all 0.2s' }}>
                    {otp[i] || ''}
                  </div>
                ))}
              </div>

              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} placeholder="Enter 6-digit OTP"
                onFocus={() => setFocused('otp')} onBlur={() => setFocused('')}
                style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${focused === 'otp' ? '#E91E8C' : '#E2E8F0'}`, borderRadius: '10px', fontSize: '20px', outline: 'none', fontFamily: f, boxSizing: 'border-box', textAlign: 'center', letterSpacing: '10px', fontWeight: '800', background: focused === 'otp' ? '#FDF0F8' : '#FAFAFA', marginBottom: '14px', boxShadow: focused === 'otp' ? '0 0 0 4px rgba(233,30,140,0.08)' : 'none', transition: 'all 0.2s' }} />

              <button type="submit" disabled={loading || otp.length !== 6} className="submit-btn"
                style={{ width: '100%', padding: '13px', background: otp.length === 6 ? 'linear-gradient(135deg,#E91E8C,#9333EA)' : '#F1F5F9', color: otp.length === 6 ? 'white' : '#94A3B8', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', fontFamily: f, boxShadow: otp.length === 6 ? '0 6px 20px rgba(233,30,140,0.3)' : 'none', transition: 'all 0.2s' }}>
                {loading ? 'Verifying...' : 'Verify & Continue ✓'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>OTP nahi mila? </span>
                <button type="button" onClick={handleResendOTP} className="resend-btn"
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: f, textDecoration: 'underline', transition: 'color 0.2s' }}>
                  Resend OTP
                </button>
              </div>

              <button type="button" onClick={() => setStep(1)}
                style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontFamily: f, fontWeight: '600' }}>
                ← Back to form
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={() => navigate('/home')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: f, display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E91E8C'; e.currentTarget.style.background = '#FDF0F8' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none' }}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0F0A1E 0%, #1E0A3C 50%, #3B0764 100%)', padding: '14px 32px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 85% 50%, rgba(233,30,140,0.1) 0%, transparent 50%)' }} />
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