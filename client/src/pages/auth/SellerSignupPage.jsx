import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = '"DM Sans", Poppins, sans-serif'

export default function SellerSignupPage() {
  const navigate   = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId,  setUserId]  = useState(null)
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [focused, setFocused] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('All fields are required')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter valid 10-digit mobile number')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup/seller',{ name: form.name, email: form.email, phone: form.phone, password: form.password })
      setUserId(data.userId); setEmail(form.email); setStep(2)
      toast.success('OTP sent to your mobile number! 📱')
    } catch (err) { toast.error(err.response?.data?.message || 'Signup failed') }
    finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp })
      storeLogin(data.user, data.token)
      toast.success('Seller account created! Complete your profile 🏪')
      navigate('/seller/onboarding', { replace: true })
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const inp = (name) => ({
    width: '100%', padding: '12px 16px',
    border: `1.5px solid ${focused === name ? '#7C3AED' : '#E2E8F0'}`,
    borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s',
    background: focused === name ? '#F5F0FF' : '#FAFAFA', color: '#0F172A',
    boxShadow: focused === name ? '0 0 0 4px rgba(124,58,237,0.08)' : 'none',
  })

  const onboardingSteps = [
    { icon: '📋', label: 'Business Info', sub: 'GSTIN & business type' },
    { icon: '🏦', label: 'Bank Details', sub: 'Account & IFSC' },
    { icon: '📍', label: 'Pickup Address', sub: 'Where to collect orders' },
    { icon: '🚀', label: 'Start Selling', sub: 'Add products & go live' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: f, background: '#F1F5F9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(124,58,237,0.4) !important; }
        .top-nav-link:hover { background: rgba(255,255,255,0.12) !important; }
        .card-shadow { box-shadow: 0 20px 60px rgba(15,10,30,0.12), 0 4px 16px rgba(15,10,30,0.06); }
      `}</style>

      {/* ── TOP DARK BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A0E21 0%, #4A2040 0%, #8C5374 200%)',
        padding: '0 52px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 25% 50%, rgba(124,58,237,0.2) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(233,30,140,0.15) 0%, transparent 50%)' }} />

        {/* Main nav row */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 0' }}>
          {/* Brand */}
          <div 
            onClick={() => navigate('/home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#7C3AED,#E91E8C)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(124,58,237,0.4)', flexShrink: 0 }}>
              <span style={{ fontSize: '22px' }}>🎗️</span>
            </div>
            <span style={{ background: 'linear-gradient(90deg,#F472B6,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',fontSize: '23px', fontWeight: '700', letterSpacing: '-0.3px' }}>StyleHub Seller Panel</span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {[['2K+', 'Sellers'], ['₹0', 'Setup'], ['4.8★', 'Rating'], ['24hr', 'Approval']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '16px', margin: '0 0 1px' }}>{val}</p>
                <p style={{ color: 'white', fontSize: '12px', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── TOP-RIGHT NAV LINKS ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="top-nav-link" style={{
              color: 'rgba(0,204,255,0.75)', fontSize: '12px', fontWeight: '600',
              textDecoration: 'none', padding: '7px 14px', borderRadius: '8px',
              border: '1px solid rgba(124,58,237,0.3)', transition: 'all 0.2s',
              background: 'rgba(0,204,255,0.08)',
            }}>
              Sign In
            </Link>
            <Link to="/signup/buyer" className="top-nav-link" style={{
              color: 'rgba(244,114,182,0.9)', fontSize: '12px', fontWeight: '600',
              textDecoration: 'none', padding: '7px 14px', borderRadius: '8px',
              border: '1px solid rgba(233,30,140,0.25)', transition: 'all 0.2s',
              background: 'rgba(233,30,140,0.08)',
            }}>
              🛍️ Buy instead?
            </Link>
          </div>
        </div>

        {/* Onboarding roadmap strip */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '610px', margin: '0 auto', paddingBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: '8px' }}>After signup :</span>
          {onboardingSteps.map(({ icon, label }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px' }}>{icon}</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>{label}</span>
              {i < onboardingSteps.length - 1 && <span style={{ color: 'white', margin: '0 4px', fontSize: '10px' }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="card-shadow" style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '36px 32px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#7C3AED,#E91E8C)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
              <span style={{ fontSize: '22px' }}>🏪</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {step === 1 ? 'Become a Seller' : 'Verify your email'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, fontWeight: '500' }}>
              {step === 1 ? 'Start selling on StyleHub today' : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: '4px', borderRadius: '4px', transition: 'all 0.35s', width: step === s ? '32px' : '8px', background: step >= s ? '#7C3AED' : '#E2E8F0' }} />
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px', letterSpacing: '0.3px' }}>Business Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="business@example.com" style={inp('email')} />
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
                  style={{ width: '100%', padding: '13px', background: loading ? '#EDE9FE' : 'linear-gradient(135deg,#7C3AED 0%,#E91E8C 100%)', color: loading ? '#A78BFA' : 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(124,58,237,0.3)', transition: 'all 0.2s', marginTop: '2px' }}>
                  {loading ? 'Creating Account...' : 'Create Seller Account →'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ background: 'linear-gradient(135deg,#F5F0FF,#FDF0F8)', border: '1.5px dashed #7C3AED', borderRadius: '12px', padding: '18px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>📧</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 3px', fontWeight: '500' }}>We sent a 6-digit code to</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#7C3AED', margin: '0 0 6px' }}>{email}</p>
                
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    width: '44px', height: '50px',
                    border: `2px solid ${otp[i] ? '#7C3AED' : '#E2E8F0'}`,
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '800', color: '#0F172A',
                    background: otp[i] ? '#F5F0FF' : 'white',
                    boxShadow: otp[i] ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {otp[i] || ''}
                  </div>
                ))}
              </div>

              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} placeholder="Enter 6-digit OTP"
                onFocus={() => setFocused('otp')} onBlur={() => setFocused('')}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `1.5px solid ${focused === 'otp' ? '#7C3AED' : '#E2E8F0'}`,
                  borderRadius: '10px', fontSize: '20px', outline: 'none', fontFamily: f,
                  boxSizing: 'border-box', textAlign: 'center', letterSpacing: '10px', fontWeight: '800',
                  background: focused === 'otp' ? '#F5F0FF' : '#FAFAFA', marginBottom: '14px',
                  boxShadow: focused === 'otp' ? '0 0 0 4px rgba(124,58,237,0.08)' : 'none', transition: 'all 0.2s',
                }} />

              <button type="submit" disabled={loading || otp.length !== 6} className="submit-btn"
                style={{ width: '100%', padding: '13px', background: otp.length === 6 ? 'linear-gradient(135deg,#7C3AED,#E91E8C)' : '#F1F5F9', color: otp.length === 6 ? 'white' : '#94A3B8', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', fontFamily: f, boxShadow: otp.length === 6 ? '0 6px 20px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}>
                {loading ? 'Verifying...' : 'Verify & Start Selling ✓'}
              </button>

              <button type="button" onClick={() => setStep(1)}
                style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', marginTop: '6px', fontFamily: f, fontWeight: '600' }}>
                ← Back to form
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'none', border: 'none', color: '#94A3B8',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: f,
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
                borderRadius: '8px', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.background = '#F5F0FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none'; }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DARK BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A0A1A 0%, #0D0A2E 40%, #1E1060 100%)',
        padding: '14px 32px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.1) 0%, transparent 50%)' }} />
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