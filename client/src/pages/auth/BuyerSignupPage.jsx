import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = 'Poppins, sans-serif'

export default function BuyerSignupPage() {
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
      const { data } = await api.post('/auth/signup/buyer', { name: form.name, email: form.email, phone: form.phone, password: form.password })
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
      toast.success('Account created! Happy shopping 🛍️')
      navigate('/home', { replace: true })
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const inp = (name) => ({
    width: '100%', padding: '11px 16px', border: `1.5px solid ${focused === name ? '#E91E8C' : '#EBEBF0'}`,
    borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s', background: focused === name ? '#FDF0F8' : 'white', color: '#1A1A2E',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: f, background: '#F9F9FB' }}>

      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(160deg,#E91E8C,#7C3AED)', position: 'relative', overflow: 'hidden', display: 'none' }} className="auth-left">
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '28px' }}>🛍️</div>
          <h1 style={{ color: 'white', fontSize: '34px', fontWeight: '800', margin: '0 0 14px', lineHeight: '1.2' }}>
            Shop the<br />Best Fashion!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '0 0 44px', lineHeight: '1.8' }}>
            Join thousands of shoppers discovering the latest in kids, men & women garments.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { emoji: '✨', title: 'Curated Collections', sub: 'Hand-picked fashion just for you' },
              { emoji: '🚚', title: 'Free Delivery', sub: 'On all orders above ₹499' },
              { emoji: '🔒', title: '100% Secure', sub: 'Encrypted payments & data' },
              { emoji: '↩️', title: 'Easy Returns', sub: '7-day hassle-free returns' },
            ].map(({ emoji, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{emoji}</div>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: '0 0 2px' }}>{title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{sub}</p>
                </div>
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
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 4px' }}>
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
              {step === 1 ? 'Join StyleHub and start shopping' : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: '5px', borderRadius: '3px', transition: 'all 0.35s', width: step === s ? '28px' : '8px', background: step >= s ? '#E91E8C' : '#EBEBF0' }} />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gap: '14px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    placeholder="Your full name" style={inp('name')} />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B4B6B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="email@example.com" style={inp('email')} />
                </div>

                {/* Phone */}
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

                {/* Password */}
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

                {/* Confirm Password */}
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
                  style={{ width: '100%', padding: '14px', background: loading ? '#F8D0EC' : 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: loading ? '#C0C0D0' : 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.3)', transition: 'all 0.2s', marginTop: '4px' }}>
                  {loading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              {/* OTP info box */}
              <div style={{ background: 'linear-gradient(135deg,#FDF0F8,#F5F0FF)', border: '1.5px dashed #E91E8C', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 6px' }}>Enter the 6-digit OTP sent to</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#E91E8C', margin: '0 0 8px' }}>{email}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, background: '#FFF', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontWeight: '600' }}>Dev mode: use 123456</p>
              </div>

              {/* OTP boxes */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ width: '44px', height: '52px', border: `2px solid ${otp[i] ? '#E91E8C' : '#EBEBF0'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#1A1A2E', background: otp[i] ? '#FDF0F8' : 'white', transition: 'all 0.2s' }}>
                    {otp[i] || ''}
                  </div>
                ))}
              </div>

              {/* Hidden input to capture OTP */}
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} placeholder="Enter 6-digit OTP"
                style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${focused === 'otp' ? '#E91E8C' : '#EBEBF0'}`, borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: f, boxSizing: 'border-box', textAlign: 'center', letterSpacing: '8px', fontWeight: '700', background: focused === 'otp' ? '#FDF0F8' : 'white', marginBottom: '16px' }}
                onFocus={() => setFocused('otp')} onBlur={() => setFocused('')} />

              <button type="submit" disabled={loading || otp.length !== 6}
                style={{ width: '100%', padding: '14px', background: otp.length === 6 ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : '#F1F5F9', color: otp.length === 6 ? 'white' : '#94A3B8', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', fontFamily: f, boxShadow: otp.length === 6 ? '0 6px 20px rgba(233,30,140,0.3)' : 'none', transition: 'all 0.2s' }}>
                {loading ? 'Verifying...' : 'Verify & Continue ✓'}
              </button>

              <button type="button" onClick={() => setStep(1)}
                style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', marginTop: '8px', fontFamily: f, fontWeight: '500' }}>
                ← Back to form
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#E91E8C', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
            {' · '}
            <Link to="/signup/seller" style={{ color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>Sell with us</Link>
          </p>
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