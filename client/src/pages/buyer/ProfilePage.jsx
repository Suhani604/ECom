import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import useWishlistStore from '../../context/useWishlistStore.js'
import useCartStore from '../../context/useCartStore.js'

const f = 'Poppins, sans-serif'

// ── Reusable field row (read-only) ──────────────────────────────────────────
function FieldBox({ label, value, half }) {
  return (
    <div style={{ flex: half ? '0 0 calc(50% - 8px)' : '0 0 calc(50% - 8px)', minWidth: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: f }}>{label}</p>
      <div style={{ padding: '11px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: value ? '#1E293B' : '#CBD5E1', fontFamily: f, minHeight: '42px', display: 'flex', alignItems: 'center' }}>
        {value || '—'}
      </div>
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1E293B', fontFamily: f }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const { items: cartItems } = useCartStore()
  const [activeTab, setActiveTab] = useState('personal')

  const cartCount     = cartItems.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlistItems.length

 const handleLogout = () => { logout(user?._id); navigate('/') }

  const initials = (user?.name || user?.fullName || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const sideNavItems = [
    { id: 'personal', label: 'Personal Info',   icon: '👤' },
    { id: 'orders',   label: 'My Orders',        icon: '📦', action: () => navigate('/orders') },
    { id: 'wishlist', label: 'Wishlist',          icon: '🤍', action: () => navigate('/wishlist') },
    { id: 'contact',  label: 'Contact Us',        icon: '💬' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: f }}>
      <style>{`
        @media(max-width: 768px) {
            .profile-grid { 
              grid-template-columns: 1fr !important; 
              padding: 16px !important;
              gap: 16px !important;
            }
            .profile-grid > div:first-child {
              width: 100% !important;
            }
          }
      `}</style>

      {/* ── Navbar ── */}

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{ background: 'white', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>S</span>
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '15px', color: '#E91E8C', margin: 0, lineHeight: 1 }}>Style<span style={{ color: '#7C3AED' }}>Hub</span></p>
            <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Fashion Store</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[
            { label: 'Profile',  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, active: true, path: '/profile' },
            { label: 'Wishlist', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, badge: wishlistCount, path: '/wishlist' },
            { label: 'Bag',      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, badge: cartCount, path: '/cart' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
              {item.icon}
              {item.badge > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>}
              <span style={{ fontSize: '11px', fontWeight: '700', color: item.active ? '#E91E8C' : '#282C3F' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: '1px solid #F1F5F9', padding: '12px 40px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontFamily: f }}>
          <span style={{ cursor: 'pointer', color: '#E91E8C' }} onClick={() => navigate('/home')}>{t('home')}</span>
          {' › '}
          <span style={{ fontWeight: '700', color: '#1E293B' }}>{t('myProfile')}</span>
        </p>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────────── */}
      <div className="profile-grid" style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div>
          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '16px' }}>
            {/* Avatar section */}
            <div style={{ padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(233,30,140,0.3)' }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '26px', fontFamily: f }}>{initials}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#1E293B', fontFamily: f }}>{user?.name || user?.fullName || 'User'}</p>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94A3B8', fontFamily: f }}>{user?.email || ''}</p>
              <div style={{ background: '#F0FFF4', border: '1.5px solid #BBF7D0', borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '10px' }}>✅</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', fontFamily: f }}>Verified Buyer</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F1F5F9' }}>
              {[
                { label: t('myOrders'),   value: '—', click: () => navigate('/orders') },
                { label: t('wishlist'), value: wishlistCount, click: () => navigate('/wishlist') },
              ].map(s => (
                <div key={s.label} onClick={s.click} style={{ padding: '16px', textAlign: 'center', cursor: 'pointer', borderRight: s.label === 'Orders' ? '1px solid #F1F5F9' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: '800', color: '#E91E8C', fontFamily: f }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: '600', fontFamily: f }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* MY ACCOUNT nav */}
            <div style={{ padding: '10px 0' }}>
              <p style={{ margin: '8px 16px 4px', fontSize: '9px', fontWeight: '800', color: '#CBD5E1', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: f }}>MY ACCOUNT</p>
              {sideNavItems.map(item => (
                <button key={item.id}
                  onClick={item.action || (() => setActiveTab(item.id))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: activeTab === item.id && !item.action ? '#FDF2F8' : 'none',
                    border: 'none', borderLeft: activeTab === item.id && !item.action ? '3px solid #E91E8C' : '3px solid transparent',
                    cursor: 'pointer', fontFamily: f, fontSize: '13px',
                    fontWeight: activeTab === item.id && !item.action ? '700' : '500',
                    color: activeTab === item.id && !item.action ? '#E91E8C' : '#475569',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeTab !== item.id || item.action) e.currentTarget.style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (activeTab !== item.id || item.action) e.currentTarget.style.background = 'none' }}>
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Quick links */}
            <div style={{ padding: '10px 0' }}>
              <p style={{ margin: '8px 16px 4px', fontSize: '9px', fontWeight: '800', color: '#CBD5E1', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: f }}>QUICK LINKS</p>
              <button onClick={() => navigate('/orders')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: '500', color: '#475569', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span>📋</span> {t('myOrders')}
              </button>
              <button onClick={() => navigate('/wishlist')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: '500', color: '#475569', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span>🛍️</span> {t('myWishlist')}
              </button>
              <button onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'none', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: '600', color: '#EF4444', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderLeft = '3px solid #EF4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderLeft = '3px solid transparent' }}>
                <span>🚪</span> {t('logout')}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div>
          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg,#FDF2F8,#EDE9FE)', border: '1.5px solid #FBB6E2', borderRadius: '14px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>👋</span>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#7C3AED', fontFamily: f }}>
              {t('welcomeBack')} <span style={{ color: '#E91E8C' }}>{user?.name || user?.fullName || 'User'}</span>!
            </p>
          </div>

          {/* Personal Information */}
          <SectionCard icon="👤" title={t('personalInformation')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <FieldBox label={t('fullName')}    value={user?.name || user?.fullName} />
              <FieldBox label={t('fullName')}    value={user?.email} />
              <FieldBox label={t('phoneNumber')}   value={user?.phone} />
              <FieldBox label={t('memberSince')}  value={memberSince} />
            </div>
          </SectionCard>

          {/* Account Details */}
          <SectionCard icon="🔐" title={t('accountDetails')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <FieldBox label={t('accountType')}  value="Buyer" />
              <FieldBox label={t('accountStatus')} value="Active" />
              <FieldBox label={t('emailVerified')} value={user?.isVerified ? 'Yes ✓' : 'No'} />
              <FieldBox label={t('userId')}       value={user?._id ? `...${user._id.slice(-8)}` : '—'} />
            </div>
          </SectionCard>

          {/* Wishlist preview */}
          {wishlistCount > 0 && (
            <SectionCard icon="🤍" title={t('myWishlist')}>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {wishlistItems.slice(0, 5).map(item => (
                  <div key={item._id} style={{ flexShrink: 0, width: '80px', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${item._id}`)}>
                    <img src={item.images?.[0]} alt={item.title}
                      style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '10px', background: '#F1F5F9', display: 'block' }}
                      onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                    <p style={{ fontSize: '10px', color: '#282C3F', fontWeight: '600', margin: '4px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/wishlist')}
                style={{ marginTop: '14px', padding: '8px 20px', background: 'none', border: '1.5px solid #E91E8C', borderRadius: '8px', color: '#E91E8C', fontWeight: '700', fontSize: '12px', cursor: 'pointer', fontFamily: f }}>
                {t('viewAll')} →
              </button>
            </SectionCard>
          )}

          {/* Edit profile */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button onClick={handleLogout}
              style={{ padding: '10px 24px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '10px', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: f }}>
              {t('cancel')}
            </button>
            <button
              style={{ padding: '10px 28px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer', fontFamily: f, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}>
              💾 {t('editProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}