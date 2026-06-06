import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerDelivery } from '../../api/deliveryAPI'

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

export default function DeliveryRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    vehicleNumber: '', licenseNumber: '',
    pincode: '', city: '', state: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.vehicleNumber || !form.licenseNumber || !form.pincode || !form.city || !form.state)
      return setError('Please fill all fields')
    try {
      setLoading(true)
      setError('')
      await registerDelivery(form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 14px',
    border: `1.5px solid ${G.border}`, borderRadius: 12,
    fontSize: 14, background: G.primaryLight, color: G.text,
    fontFamily: 'inherit', fontWeight: 600, boxSizing: 'border-box',
    transition: 'all 0.2s',
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Outfit','Nunito',sans-serif" }}>
      <div style={{ background: G.card, borderRadius: 24, padding: '48px 28px', textAlign: 'center', boxShadow: '0 8px 40px rgba(26,158,63,0.12)', maxWidth: 380, width: '100%' }}>
        <div style={{ width: 80, height: 80, background: G.primaryLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px' }}>✅</div>
        <h2 style={{ color: G.primary, fontSize: 24, fontWeight: 900, margin: '0 0 10px' }}>Application Sent!</h2>
        <p style={{ color: G.muted, fontSize: 14, margin: '0 0 8px', lineHeight: 1.6 }}>
          Your registration is under review. Admin will approve your account shortly.
        </p>
        <div style={{ background: G.primaryLight, borderRadius: 12, padding: '12px 16px', margin: '20px 0', border: `1px solid ${G.border}` }}>
          <p style={{ color: G.text, fontSize: 13, margin: 0, fontWeight: 600 }}>
            📱 You'll receive SMS once approved
          </p>
        </div>
        <button onClick={() => navigate('/delivery/login')}
          style={{ width: '100%', padding: 15, background: `linear-gradient(135deg,${G.primary},${G.primaryDark})`, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
          Go to Login →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .reg-i:focus { outline: none; border-color: ${G.primary} !important; background: white !important; box-shadow: 0 0 0 3px rgba(26,158,63,0.12); }
        .reg-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${G.primaryDark}, ${G.primary})`,
        padding: '20px 20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => step === 1 ? navigate('/delivery/login') : setStep(1)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </button>
          <div>
            <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>Become a Partner</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Step {step} of 2 • {step === 1 ? 'Personal Info' : 'Vehicle & Area'}</p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 12px' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>🛵 Rider</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: step >= s ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px 40px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ background: G.card, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 24px rgba(26,158,63,0.1)', border: `1px solid ${G.border}` }}>

          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <div style={{ width: 40, height: 40, background: G.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                <div>
                  <h2 style={{ color: G.text, fontSize: 16, fontWeight: 800, margin: 0 }}>Personal Information</h2>
                  <p style={{ color: G.muted, fontSize: 12, margin: 0 }}>Fill your basic details</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name', icon: '👤' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit mobile number', icon: '📱' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'email@example.com', icon: '📧' },
                  { label: 'Password', key: 'password', type: 'password', placeholder: 'Create strong password', icon: '🔒' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 6 }}>
                      {field.icon} {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                      className="reg-i"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
                  <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
                </div>
              )}

              <button
                className="reg-btn"
                onClick={() => {
                  if (!form.name || !form.phone || !form.email || !form.password)
                    return setError('Please fill all fields')
                  setError(''); setStep(2)
                }}
                style={{
                  width: '100%', marginTop: 22, padding: 15,
                  background: `linear-gradient(135deg,${G.primary},${G.primaryDark})`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(26,158,63,0.35)', transition: 'all 0.2s',
                }}>
                Next → Vehicle Details
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <div style={{ width: 40, height: 40, background: G.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏍️</div>
                <div>
                  <h2 style={{ color: G.text, fontSize: 16, fontWeight: 800, margin: 0 }}>Vehicle & Service Area</h2>
                  <p style={{ color: G.muted, fontSize: 12, margin: 0 }}>Vehicle and area details</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Vehicle Number', key: 'vehicleNumber', placeholder: 'MH12AB1234', icon: '🏍️' },
                  { label: 'License Number', key: 'licenseNumber', placeholder: 'DL number', icon: '📄' },
                  { label: 'Service Pincode', key: 'pincode', placeholder: '440001', icon: '📍' },
                  { label: 'City', key: 'city', placeholder: 'Amravati', icon: '🏙️' },
                  { label: 'State', key: 'state', placeholder: 'Maharashtra', icon: '🗺️' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 6 }}>
                      {field.icon} {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                      className="reg-i"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
                  <p style={{ color: '#dc2626', fontSize: 13, margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button onClick={() => setStep(1)}
                  style={{ flex: 1, padding: 14, background: G.primaryLight, color: G.primary, border: `1.5px solid ${G.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ← Back
                </button>
                <button
                  className="reg-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 2, padding: 14,
                    background: loading ? '#9dcca9' : `linear-gradient(135deg,${G.primary},${G.primaryDark})`,
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(26,158,63,0.35)', transition: 'all 0.2s',
                  }}>
                  {loading ? 'Submitting...' : '✅ Register Now'}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: G.muted, fontSize: 13, marginTop: 20, fontWeight: 500 }}>
          Already registered?{' '}
          <span onClick={() => navigate('/delivery/login')}
            style={{ color: G.primary, fontWeight: 800, cursor: 'pointer' }}>
            Login here →
          </span>
        </p>
      </div>
    </div>
  )
}