import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axiosInstance.js'
import toast from 'react-hot-toast'

const f = 'Poppins, sans-serif'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: f, background: '#F9F9FB' }}>

      {/* Left panel — branding */}
      <div
        style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', position: 'relative', overflow: 'hidden' }}
        className="auth-left"
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '60px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'white', fontSize: '26px', fontWeight: '800' }}>S</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 12px', lineHeight: '1.2' }}>
            Forgot<br />Password? 🔐
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 48px', lineHeight: '1.7' }}>
            No worries! Enter your registered email and we'll send you a reset link.
          </p>
          {['🔒 Secure password reset', '📧 Email verification', '⚡ Reset in under 2 minutes', '✅ Your account stays safe'].map((text, i) => (
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

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 6px' }}>Reset Password</h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>We'll send a reset link to your email</p>
          </div>

          {!sent ? (
            <>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B4B6B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="email@example.com"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `1.5px solid ${focused ? '#E91E8C' : '#EBEBF0'}`,
                      borderRadius: '0px', fontSize: '14px', outline: 'none', fontFamily: f,
                      boxSizing: 'border-box', transition: 'all 0.2s',
                      background: focused ? '#FDF0F8' : 'white', color: '#1A1A2E',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#F8D0EC' : 'linear-gradient(135deg,#E91E8C,#7C3AED)',
                    color: loading ? '#C0C0D0' : 'white',
                    border: 'none', borderRadius: '0px', fontSize: '15px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f,
                    boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.35)',
                    transition: 'all 0.2s', letterSpacing: '0.3px',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#EBEBF0' }} />
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#EBEBF0' }} />
              </div>

              <Link
                to="/login"
                style={{ display: 'block', padding: '12px', border: '1.5px solid #EBEBF0', borderRadius: '0px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#E91E8C', textDecoration: 'none', background: '#FDF0F8' }}
              >
                ← Back to Sign In
              </Link>
            </>
          ) : (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#E91E8C22,#7C3AED22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                📧
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px' }}>Check Your Inbox!</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 8px' }}>
                We've sent a password reset link to
              </p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#E91E8C', margin: '0 0 24px', wordBreak: 'break-all' }}>
                {email}
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 28px', lineHeight: '1.6' }}>
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: '#E91E8C', fontWeight: '700', cursor: 'pointer', fontSize: '12px', fontFamily: f, padding: 0 }}
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                style={{ display: 'block', padding: '12px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '0px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: 'white', textDecoration: 'none', boxShadow: '0 6px 20px rgba(233,30,140,0.35)' }}
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
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