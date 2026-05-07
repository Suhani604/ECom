import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import useWishlistStore from '../../context/useWishlistStore.js'
import useCartStore from '../../context/useCartStore.js'

const f = 'Poppins, sans-serif'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const { items: cartItems } = useCartStore()

  const cartCount     = cartItems.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlistItems.length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { label: 'Orders',    icon: '📦', action: () => navigate('/orders') },
    { label: 'Wishlist',  icon: '🤍', action: () => navigate('/wishlist') },
    { label: 'Contact Us', icon: '💬', action: () => {} },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', fontFamily: f }}>

      {/* ── Navbar ── */}
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
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E91E8C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C' }}>Profile</span>
          </button>
          <button onClick={() => navigate('/wishlist')} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {wishlistCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlistCount}</span>}
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Wishlist</span>
          </button>
          <button onClick={() => navigate('/cart')} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Bag</span>
          </button>
        </div>
      </nav>

      {/* ── Profile Content ── */}
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'flex-start' }}>

        {/* ── Left Panel — Profile Card ── */}
        <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

          {/* User info */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#282C3F', margin: '0 0 2px' }}>
                  Hello {user?.name || user?.fullName || 'User'}
                </p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  {user?.phone || user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '8px 0' }}>
            {menuItems.map((item, i) => (
              <button key={i} onClick={item.action}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, fontSize: '14px', color: '#282C3F', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9F9FB'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

          {/* Edit Profile & Logout */}
          <div style={{ padding: '8px 0' }}>
            <button
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, fontSize: '14px', color: '#282C3F', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9F9FB'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '16px' }}>✏️</span> Edit Profile
            </button>
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, fontSize: '14px', color: '#DC2626', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '16px' }}>🚪</span> Logout
            </button>
          </div>
        </div>

        {/* ── Right Panel — Quick Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer' }} onClick={() => navigate('/orders')}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#E91E8C', marginBottom: '4px' }}>0</div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Total Orders</div>
            </div>
            <div style={{ background: 'white', borderRadius: '4px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#E91E8C', marginBottom: '4px' }}>{wishlistCount}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Wishlist Items</div>
            </div>
          </div>

          {/* Account info */}
          <div style={{ background: 'white', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#282C3F', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Name</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#282C3F' }}>{user?.name || user?.fullName || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Email</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#282C3F' }}>{user?.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Phone</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#282C3F' }}>{user?.phone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Wishlist preview */}
          {wishlistCount > 0 && (
            <div style={{ background: 'white', borderRadius: '4px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#282C3F', margin: 0 }}>My Wishlist</h3>
                <button onClick={() => navigate('/wishlist')} style={{ fontSize: '12px', fontWeight: '700', color: '#E91E8C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f }}>VIEW ALL →</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
                {wishlistItems.slice(0, 4).map(item => (
                  <div key={item._id} style={{ flexShrink: 0, width: '80px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)}>
                    <img src={item.images?.[0]} alt={item.title}
                      style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', background: '#F1F5F9', display: 'block' }}
                      onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                    <p style={{ fontSize: '10px', color: '#282C3F', fontWeight: '600', margin: '4px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}