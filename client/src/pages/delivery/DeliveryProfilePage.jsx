import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeliveryProfile, toggleOnlineStatus } from '../../api/deliveryAPI'
import useDeliveryStore from '../../context/useDeliveryStore'
import { BottomNav } from './DeliveryDashboardPage'

const G = {
  primary: '#1a9e3f',
  primaryDark: '#157a32',
  primaryLight: '#e8f5ec',
  bg: '#f4f6f4',
  card: '#ffffff',
  text: '#1a2e1a',
  muted: '#6b7c6b',
  border: '#d4e8d4',
}

export default function DeliveryProfilePage() {
  const navigate = useNavigate()
  const { deliveryPartner, logout, setOnlineStatus, updateProfile } = useDeliveryStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getDeliveryProfile()
      const dp = res.data.deliveryPartner
      setProfile(dp)
      updateProfile(dp)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleToggleOnline = async () => {
    try {
      setToggling(true)
      const res = await toggleOnlineStatus()
      setOnlineStatus(res.data.isOnline)
      setProfile(prev => ({ ...prev, isOnline: res.data.isOnline }))
    } catch (err) { console.error(err) }
    finally { setToggling(false) }
  }

  const handleLogout = () => {
    logout()
    navigate('/delivery/login')
  }

  const dp = profile || deliveryPartner

  const sectionStyle = {
    background: G.card, borderRadius: 18, padding: '16px',
    border: `1.5px solid ${G.border}`,
    boxShadow: '0 2px 12px rgba(26,158,63,0.07)',
  }

  const infoRows = [
    { label: 'Phone',           value: dp?.phone,                   icon: '📱' },
    { label: 'Email',           value: dp?.email,                   icon: '📧' },
    { label: 'Vehicle No.',     value: dp?.vehicleNumber || '—',    icon: '🏍️' },
    { label: 'License No.',     value: dp?.licenseNumber || '—',    icon: '📄' },
    { label: 'Service City',    value: dp?.serviceArea?.city || '—', icon: '🏙️' },
    { label: 'Service Pincode', value: dp?.serviceArea?.pincode || '—', icon: '📍' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Outfit','Nunito',sans-serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease; }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${G.primaryDark} 0%, ${G.primary} 60%, #2ec95e 100%)`,
        padding: '32px 20px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: 0 }}>My Profile</h1>
          <button onClick={() => setShowLogout(true)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Logout
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ width: 120, height: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ width: 80, height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 6 }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '3px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 900, color: '#fff', overflow: 'hidden',
              }}>
                {dp?.photo
                  ? <img src={dp.photo} alt={dp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : dp?.name?.[0]?.toUpperCase() || '?'
                }
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 18, height: 18, borderRadius: '50%',
                background: dp?.isOnline ? '#86efac' : '#e5e7eb',
                border: `2.5px solid ${G.primary}`,
              }} />
            </div>

            <div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>{dp?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: '#fbbf24', fontSize: 14 }}>★</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700 }}>{dp?.rating?.toFixed(1) || '5.0'}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>• {dp?.totalOrders || 0} deliveries</span>
              </div>
              <span style={{
                background: dp?.isApproved ? 'rgba(134,239,172,0.25)' : 'rgba(251,191,36,0.25)',
                color: dp?.isApproved ? '#86efac' : '#fbbf24',
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                border: `1px solid ${dp?.isApproved ? 'rgba(134,239,172,0.4)' : 'rgba(251,191,36,0.4)'}`,
              }}>
                {dp?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Online Toggle */}
        <div style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontWeight: 800, color: G.text, fontSize: 14 }}>Online Status</p>
            <p style={{ margin: 0, color: G.muted, fontSize: 13 }}>
              {dp?.isOnline ? '🟢 Receiving orders' : '🔴 Offline — not receiving'}
            </p>
          </div>
          <button onClick={handleToggleOnline} disabled={toggling}
            style={{
              position: 'relative', width: 52, height: 28, borderRadius: 14,
              background: dp?.isOnline ? G.primary : '#e5e7eb',
              border: 'none', cursor: toggling ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s', flexShrink: 0,
            }}>
            <div style={{
              position: 'absolute', top: 4, left: dp?.isOnline ? 27 : 4,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 0.3s',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { value: dp?.totalOrders || 0,             label: 'Deliveries', color: G.primary, bg: G.primaryLight },
            { value: `₹${dp?.totalEarnings || 0}`,     label: 'Earned',     color: '#0369a1', bg: '#e0f2fe' },
            { value: `★${dp?.rating?.toFixed(1) || '5.0'}`, label: 'Rating', color: '#d97706', bg: '#fef3c7' },
          ].map(s => (
            <div key={s.label} style={{ ...sectionStyle, textAlign: 'center', border: `1.5px solid ${s.bg}` }}>
              <p style={{ margin: '0 0 4px', color: s.color, fontSize: 18, fontWeight: 900 }}>{s.value}</p>
              <p style={{ margin: 0, color: G.muted, fontSize: 11, fontWeight: 700 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Personal Info */}
        <div style={sectionStyle}>
          <p style={{ margin: '0 0 14px', color: G.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Personal Info</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {infoRows.map((row, idx) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: idx < infoRows.length - 1 ? `1px solid ${G.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{row.icon}</span>
                  <p style={{ margin: 0, color: G.muted, fontSize: 13, fontWeight: 600 }}>{row.label}</p>
                </div>
                <p style={{ margin: 0, color: G.text, fontSize: 13, fontWeight: 700, maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.value || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div style={sectionStyle}>
          <p style={{ margin: '0 0 14px', color: G.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Documents</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Driving License', icon: '🪪', value: dp?.licenseNumber },
              { label: 'Vehicle RC',      icon: '🚗', value: dp?.vehicleNumber },
            ].map(doc => (
              <div key={doc.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: G.primaryLight, borderRadius: 12, padding: '12px',
                border: `1px solid ${G.border}`,
              }}>
                <span style={{ fontSize: 24 }}>{doc.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: G.text, fontSize: 13, fontWeight: 700 }}>{doc.label}</p>
                  <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 12 }}>{doc.value || 'Not uploaded'}</p>
                </div>
                <span style={{
                  background: doc.value ? G.primaryLight : '#f3f4f6',
                  color: doc.value ? G.primary : G.muted,
                  border: `1.5px solid ${doc.value ? G.border : '#e5e7eb'}`,
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>
                  {doc.value ? '✓ Added' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Area */}
        <div style={sectionStyle}>
          <p style={{ margin: '0 0 14px', color: G.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Service Area</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: G.primaryLight, borderRadius: 12, padding: '12px', border: `1px solid ${G.border}` }}>
            <div style={{ width: 44, height: 44, background: G.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📍</div>
            <div>
              <p style={{ margin: 0, color: G.text, fontSize: 15, fontWeight: 800 }}>{dp?.serviceArea?.city || 'Not set'}</p>
              <p style={{ margin: '2px 0 0', color: G.muted, fontSize: 12 }}>
                {dp?.serviceArea?.state} — PIN: {dp?.serviceArea?.pincode || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* App info */}
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <p style={{ color: G.muted, fontSize: 11, margin: '0 0 4px' }}>Delivery Partner App v1.0</p>
          <p style={{ color: G.border, fontSize: 11, margin: 0 }}>For support, contact admin</p>
        </div>

      </div>
      
      {/* Logout Confirm Modal */}
      {showLogout && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 100, padding: 16,
        }}
          onClick={() => setShowLogout(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: G.card, borderRadius: 24, padding: '24px 20px',
            width: '100%', maxWidth: 420,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
              <h3 style={{ color: G.text, fontWeight: 900, fontSize: 18, margin: '0 0 6px' }}>Logout?</h3>
              <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>Are you sure you want to logout?</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowLogout(false)}
                style={{ flex: 1, padding: 14, background: G.primaryLight, color: G.primary, border: `1.5px solid ${G.border}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                style={{ flex: 1, padding: 14, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="profile" />
    </div>
  )
}