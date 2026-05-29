import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerProfileAPI } from '../../api/sellerAPI.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = 'Poppins, sans-serif'

// ── Reusable read-only field ─────────────────────────────────────────────────
function FieldBox({ label, value, disabled = true, type = 'text', onChange, masked }) {
  const display = masked && value ? 'XXXX XXXX ' + value.slice(-4) : value
  return (
    <div style={{ flex: '0 0 calc(50% - 8px)', minWidth: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: f }}>{label}</p>
      <input
        type={type}
        value={display || ''}
        disabled={disabled}
        onChange={onChange}
        style={{
          width: '100%', padding: '11px 14px', background: disabled ? '#F8FAFC' : 'white',
          border: `1.5px solid ${disabled ? '#E2E8F0' : '#C4B5FD'}`,
          borderRadius: '10px', fontSize: '13px', fontWeight: '600',
          color: value ? '#1E293B' : '#CBD5E1', fontFamily: f,
          outline: 'none', boxSizing: 'border-box',
          cursor: disabled ? 'default' : 'text',
          transition: 'border 0.15s',
        }}
        placeholder="—"
      />
    </div>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, badge, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1E293B', fontFamily: f }}>{title}</h3>
        </div>
        {badge && (
          <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', border: '1.5px solid #BBF7D0', fontFamily: f }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

// ── Info alert box ───────────────────────────────────────────────────────────
function InfoAlert({ children }) {
  return (
    <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <span style={{ fontSize: '14px', flexShrink: 0 }}>ℹ️</span>
      <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8', fontWeight: '600', fontFamily: f }}>{children}</p>
    </div>
  )
}

export default function SellerProfilePage() {
  const navigate          = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [seller,  setSeller]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)

  // Editable personal fields
  const [form, setForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    getSellerProfileAPI()
      .then(({ data }) => {
        setSeller(data.user)
        setForm({ name: data.user?.name || '', phone: data.user?.phone || '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sd             = seller?.sellerDetails || {}
  const approvalStatus = sd.approvalStatus || 'pending'
  const initials = (sd.businessName || user?.name || 'S')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const memberSince = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'

  const statusStyles = {
    approved: { bg: '#DCFCE7', color: '#16A34A', label: 'Approved',     icon: '✅' },
    pending:  { bg: '#FEF9C3', color: '#CA8A04', label: 'Under Review', icon: '⏳' },
    rejected: { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected',     icon: '❌' },
  }
  const status = statusStyles[approvalStatus] || statusStyles.pending

  const sideNavItems = [
    { id: 'personal',  label: 'Personal Info',   icon: '👤' },
    { id: 'business',  label: 'Business Details', icon: '🏢' },
    { id: 'address',   label: 'Address',          icon: '📍' },
    { id: 'bank',      label: 'Bank Details',     icon: '🏦' },
  ]

  const quickLinks = [
    { label: 'My Products', icon: '📦', path: '/seller/products' },
    { label: 'My Orders',   icon: '📋', path: '/seller/orders' },
    { label: 'Dashboard',   icon: '📊', path: '/seller/dashboard' },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 800)) // simulate
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #EDE9FE', borderTop: '3px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: f }}>

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '900', color: '#0F172A', fontFamily: f }}>My Profile</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', fontFamily: f }}>Manage your seller account and business information</p>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div>
          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
            {/* Avatar */}
            <div style={{ padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '26px', fontFamily: f }}>{initials}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '800', color: '#1E293B', fontFamily: f }}>{seller?.name || user?.name || 'Seller'}</p>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#94A3B8', fontFamily: f }}>{sd.businessName || 'Your Store'}</p>
              <div style={{ background: status.bg, border: `1.5px solid ${status.color}33`, borderRadius: '20px', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '11px' }}>{status.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: status.color, fontFamily: f }}>{status.label}</span>
              </div>
            </div>

            {/* MY ACCOUNT nav */}
            <div style={{ padding: '10px 0' }}>
              <p style={{ margin: '8px 16px 4px', fontSize: '9px', fontWeight: '800', color: '#CBD5E1', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: f }}>MY ACCOUNT</p>
              {sideNavItems.map(item => (
                <button key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: activeTab === item.id ? '#FDF2F8' : 'none',
                    border: 'none', borderLeft: activeTab === item.id ? '3px solid #E91E8C' : '3px solid transparent',
                    cursor: 'pointer', fontFamily: f, fontSize: '13px',
                    fontWeight: activeTab === item.id ? '700' : '500',
                    color: activeTab === item.id ? '#E91E8C' : '#475569',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'none' }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Quick links */}
            <div style={{ padding: '10px 0' }}>
              <p style={{ margin: '8px 16px 4px', fontSize: '9px', fontWeight: '800', color: '#CBD5E1', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: f }}>QUICK LINKS</p>
              {quickLinks.map(item => (
                <button key={item.label} onClick={() => navigate(item.path)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: '500', color: '#475569', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
              <button onClick={() => { useAuthStore.getState().logout(); navigate('/') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: '600', color: '#EF4444', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderLeft = '3px solid #EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderLeft = '3px solid transparent' }}>
                🚪 Logout
              </button>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* ── Stats (moved to bottom) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F1F5F9' }}>
              {[
                { label: 'PRODUCTS', value: seller?.productCount ?? '—' },
                { label: 'ORDERS',   value: seller?.orderCount   ?? '—' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: '14px', textAlign: 'center', borderRight: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: f }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.5px', fontFamily: f }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {[
                { label: 'REVENUE', value: seller?.revenue ? `₹${seller.revenue.toLocaleString('en-IN')}` : '₹0' },
                { label: 'RATING',  value: seller?.rating  ? `${seller.rating}★` : '0.0★' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: '14px', textAlign: 'center', borderRight: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: '#0F172A', fontFamily: f }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.5px', fontFamily: f }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div>
          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#15803D', fontFamily: f }}>
              Welcome back, <span style={{ color: '#0F172A' }}>{seller?.name || user?.name || 'Test Seller'}</span>!
            </p>
          </div>

          {/* ── PERSONAL INFO TAB ─────────────────────────────────────── */}
          {activeTab === 'personal' && (
            <SectionCard icon="👤" title="Personal Information">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <FieldBox label="Full Name"     value={seller?.name || user?.name} />
                <FieldBox label="Email Address" value={seller?.email || user?.email} />
                <FieldBox label="Phone Number"  value={seller?.phone || user?.phone} />
                <FieldBox label="Member Since"  value={memberSince} />
              </div>
            </SectionCard>
          )}

          {/* ── BUSINESS DETAILS TAB ─────────────────────────────────── */}
          {activeTab === 'business' && (
            <SectionCard icon="🏢" title="Business Details" badge={status.label}>
              <InfoAlert>GST &amp; PAN are verified documents. Contact support to update them.</InfoAlert>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <FieldBox label="Business / Store Name" value={sd.businessName} />
                <FieldBox label="Business Type"         value={sd.businessType
                  ? sd.businessType.charAt(0).toUpperCase() + sd.businessType.slice(1)
                  : ''} />
                <FieldBox label="GSTIN"      value={sd.gstin} />
                <FieldBox label="PAN Number" value={sd.pan}   />
              </div>
            </SectionCard>
          )}

          {/* ── ADDRESS TAB ──────────────────────────────────────────── */}
          {activeTab === 'address' && (
            <SectionCard icon="📍" title="Pickup Address">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '0 0 100%' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: f }}>ADDRESS LINE</p>
                  <input value={sd.pickupAddress?.line1 || ''} disabled
                    style={{ width: '100%', padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: sd.pickupAddress?.line1 ? '#1E293B' : '#CBD5E1', fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
                    placeholder="—" />
                </div>
                <FieldBox label="City"    value={sd.pickupAddress?.city} />
                <div style={{ flex: '0 0 calc(50% - 8px)' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: f }}>STATE</p>
                  <select disabled value={sd.pickupAddress?.state || ''}
                    style={{ width: '100%', padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: sd.pickupAddress?.state ? '#1E293B' : '#CBD5E1', fontFamily: f, outline: 'none', boxSizing: 'border-box', appearance: 'auto' }}>
                    {!sd.pickupAddress?.state && <option value="">—</option>}
                    {sd.pickupAddress?.state && <option value={sd.pickupAddress.state}>{sd.pickupAddress.state}</option>}
                  </select>
                </div>
                <FieldBox label="Pincode" value={sd.pickupAddress?.pincode} />
              </div>
            </SectionCard>
          )}

          {/* ── BANK DETAILS TAB ─────────────────────────────────────── */}
          {activeTab === 'bank' && (
            <SectionCard icon="🏦" title="Bank Details">
              <InfoAlert>Your bank details are encrypted. Account number is masked for security.</InfoAlert>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <FieldBox label="Account Holder Name" value={sd.accountHolder} />
                <FieldBox label="Bank Name"            value={sd.bankName} />
                <FieldBox label="Account Number"       value={sd.accountNumber} masked />
                <FieldBox label="IFSC Code"            value={sd.ifscCode} />
              </div>
            </SectionCard>
          )}

          {/* ── Save / Cancel ────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button onClick={() => navigate('/seller/dashboard')}
              style={{ padding: '10px 24px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '10px', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: f }}>
              Cancel
            </button>
            <button onClick={() => navigate('/seller/onboarding')}
              style={{ padding: '10px 28px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', fontFamily: f, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(233,30,140,0.35)', opacity: saving ? 0.75 : 1, transition: 'opacity 0.2s' }}>
              {saved ? '✅ Saved!' : saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}