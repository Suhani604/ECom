import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance.js'
import toast from 'react-hot-toast'

const f = 'Poppins, sans-serif'

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')

  const [form,    setForm]    = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [showCPw, setShowCPw] = useState(false)
  const [focused, setFocused] = useState('')
  const [done,    setDone]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password || !form.confirmPassword) return toast.error('Fill all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (!token) return toast.error('Invalid or missing reset token')

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: form.password })
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const inp = (name) => ({
    width: '100%', padding: '12px 44px 12px 16px',
    border: `1.5px solid ${focused === name ? '#E91E8C' : '#EBEBF0'}`,
    borderRadius: '0px', fontSize: '14px', outline: 'none', fontFamily: f,
    boxSizing: 'border-box', transition: 'all 0.2s',
    background: focused === name ? '#FDF0F8' : 'white', color: '#1A1A2E',
  })

  /* ── Invalid token state ── */
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F9FB', fontFamily: f, padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔗</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px' }}>Invalid Reset Link</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px', lineHeight: '1.6' }}>
            This link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" style={{ display: 'block', padding: '13px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', borderRadius: '0px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', boxShadow: '0 6px 20px rgba(233,30,140,0.35)' }}>
            Request New Link →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: f, background: '#F9F9FB' }}>

      {/* Left panel */}
      <div style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', position: 'relative', overflow: 'hidden' }} className="auth-left">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '60px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'white', fontSize: '26px', fontWeight: '800' }}>S</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0 0 12px', lineHeight: '1.2' }}>
            Create New<br />Password 🔑
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 48px', lineHeight: '1.7' }}>
            Choose a strong password to keep your StyleHub account secure.
          </p>
          {['🔐 Min. 6 characters', '🔡 Mix letters & numbers', '🚫 Avoid reusing old passwords', '✅ You\'re almost done!'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{text.split(' ')[0]}</div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>{text.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(233,30,140,0.3)' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>S</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 6px' }}>
              {done ? 'Password Updated!' : 'Set New Password'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
              {done ? 'You can now sign in with your new password' : 'Enter and confirm your new password'}
            </p>
          </div>

          {!done ? (
            <form onSubmit={handleSubmit}>
              {/* New password */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B4B6B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused('')}
                    placeholder="Min. 6 characters"
                    style={inp('pw')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px' }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B4B6B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCPw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    onFocus={() => setFocused('cpw')}
                    onBlur={() => setFocused('')}
                    placeholder="Re-enter your password"
                    style={inp('cpw')}
                  />
                  <button type="button" onClick={() => setShowCPw(!showCPw)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px' }}>
                    {showCPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Match indicator */}
                {form.confirmPassword && (
                  <p style={{ fontSize: '11px', marginTop: '6px', fontWeight: '600', color: form.password === form.confirmPassword ? '#16A34A' : '#DC2626' }}>
                    {form.password === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#F8D0EC' : 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: loading ? '#C0C0D0' : 'white', border: 'none', borderRadius: '0px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f, boxShadow: loading ? 'none' : '0 6px 20px rgba(233,30,140,0.35)', transition: 'all 0.2s' }}>
                {loading ? 'Updating...' : 'Update Password →'}
              </button>
            </form>
          ) : (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#E91E8C22,#7C3AED22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                ✅
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px', lineHeight: '1.6' }}>
                Your password has been updated successfully. Sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '0px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: f, boxShadow: '0 6px 20px rgba(233,30,140,0.35)' }}>
                Sign In Now →
              </button>
            </div>
          )}

          {!done && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', textDecoration: 'none' }}>
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