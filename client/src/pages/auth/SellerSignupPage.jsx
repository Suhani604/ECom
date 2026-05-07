import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = 'Poppins, sans-serif'

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
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter valid 10-digit mobile number')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup/seller', { name: form.name, email: form.email, phone: form.phone, password: form.password })
      setUserId(data.userId); setEmail(form.email); setStep(2)
      toast.success('OTP sent! Use 123456 in dev mode.')
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
    width: '100%', padding: '11px 16px', border: `1.5px solid ${focused === name ? '#7C3AED' : '#EBEBF0'}`,
    borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s', background: focused === name ? '#F5F0FF' : 'white', color: '#1A1A2E',
  })

  const steps = [
    { num: 1, icon: '📋', label: 'Business Info', sub: 'GSTIN & business type' },
    { num: 2, icon: '🏦', label: 'Bank Details',  sub: 'Account & IFSC' },
    { num: 3, icon: '📍', label: 'Pickup Address', sub: 'Where to collect orders' },
    { num: 4, icon: '🚀', label: 'Start Selling',  sub: 'Add products & go live' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: f, background: '#F9F9FB' }}>

      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(160deg,#7C3AED,#E91E8C)', position: 'relative', overflow: 'hidden', display: 'none' }} className="auth-left">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '28px' }}>🏪</div>
          <h1 style={{ color: 'white', fontSize: '34px', fontWeight: '800', margin: '0 0 14px', lineHeight: '1.2' }}>
            Start Selling<br />Today!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 40px', lineHeight: '1.8' }}>
            Join thousands of sellers on StyleHub and reach millions of fashion-forward buyers.
          </p>

          {/* Onboarding steps */}
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', margin: '0 0 20px' }}>After signup, you'll complete:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map(({ num, icon, label, sub }) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '40px' }}>
            {[['1000+', 'Products Listed'], ['4.8★', 'Seller Rating'], ['₹0', 'Setup Cost'], ['24hr', 'Approval Time']].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '18px', margin: '0 0 2px' }}>{val}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#7C3AED,#E91E8C)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
              <span style={{ fontSize: '22px' }}>🏪</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 4px' }}>
              {step === 1 ? 'Become a Seller' : 'Verify Email'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
              {step === 1 ? 'Start selling on StyleHub today' : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: '5px', borderRadius: '3px', transition: 'all 0.35s', width: step === s ? '28px' : '8px', background: step >= s ? '#7C3AED' : '#EBEBF0' }} />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    placeholder="Your full name" style={inp('name')} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Business Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="business@example.com" style={inp('email')} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#94A3B8', fontWeight: '600', borderRight: '1px solid #EBEBF0', paddingRight: '10px' }}>+91</div>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                      placeholder="10-digit number" maxLength={10}
                      style={{ ...inp('phone'), paddingLeft: '54px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                      placeholder="Min. 6 characters" style={{ ...inp('pw'), paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Confirm Password</label>
                  <input type="password" value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    onFocus={() => setFocused('cpw')} onBlur={() => setFocused('')}
                    placeholder="Repeat password" style={inp('cpw')} />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ fontSize: '11px', color: '#DC2626', margin: '4px 0 0' }}>Passwords don't match</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? '#E9D5FF' : 'linear-gradient(135deg,#7C3AED,#E91E8C)', color: loading ? '#A78BFA' : 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(124,58,237,0.3)', transition: 'all 0.2s', marginTop: '4px' }}>
                  {loading ? 'Creating Account...' : 'Create Seller Account →'}
                </button>
              </div>

              {/* What happens next (mobile) */}
              <div style={{ marginTop: '20px', background: 'linear-gradient(135deg,#F5F0FF,#FDF0F8)', border: '1px solid #DDD6FE', borderRadius: '14px', padding: '16px' }} className="auth-left-hide">
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>After signup you'll complete:</p>
                {steps.map(({ icon, label, sub }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ background: 'linear-gradient(135deg,#F5F0FF,#FDF0F8)', border: '1.5px dashed #7C3AED', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 6px' }}>Enter the 6-digit OTP sent to</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#7C3AED', margin: '0 0 8px' }}>{email}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, background: '#FFF', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontWeight: '600' }}>Dev mode: use 123456</p>
              </div>

              {/* OTP visual boxes */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: '44px', height: '52px', border: `2px solid ${otp[i] ? '#7C3AED' : '#EBEBF0'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#1A1A2E', background: otp[i] ? '#F5F0FF' : 'white', transition: 'all 0.2s' }}>
                    {otp[i] || ''}
                  </div>
                ))}
              </div>

              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} placeholder="Enter 6-digit OTP"
                style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${focused === 'otp' ? '#7C3AED' : '#EBEBF0'}`, borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: f, boxSizing: 'border-box', textAlign: 'center', letterSpacing: '8px', fontWeight: '700', background: focused === 'otp' ? '#F5F0FF' : 'white', marginBottom: '16px' }}
                onFocus={() => setFocused('otp')} onBlur={() => setFocused('')} />

              <button type="submit" disabled={loading || otp.length !== 6}
                style={{ width: '100%', padding: '14px', background: otp.length === 6 ? 'linear-gradient(135deg,#7C3AED,#E91E8C)' : '#F1F5F9', color: otp.length === 6 ? 'white' : '#94A3B8', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', fontFamily: f, boxShadow: otp.length === 6 ? '0 6px 20px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}>
                {loading ? 'Verifying...' : 'Verify & Start Selling ✓'}
              </button>

              <button type="button" onClick={() => setStep(1)}
                style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontFamily: f, fontWeight: '500' }}>
                ← Back to form
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', marginTop: '20px' }}>
            Already a seller?{' '}
            <Link to="/login" style={{ color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
            {' · '}
            <Link to="/signup/buyer" style={{ color: '#E91E8C', fontWeight: '700', textDecoration: 'none' }}>Buy instead?</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left { display: flex !important; flex-direction: column; }
          .auth-left-hide { display: none !important; }
        }
      `}</style>
    </div>
  )
}