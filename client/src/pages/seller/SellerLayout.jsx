import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiHome, FiShoppingBag, FiRefreshCw, FiDollarSign,
  FiAlertOctagon, FiDatabase, FiUploadCloud, FiImage,
  FiAward, FiCreditCard, FiArchive, FiZap, FiGift,
  FiActivity, FiChevronDown, FiChevronRight,
  FiBell, FiMenu, FiX, FiLogOut, FiUser, FiStar,
} from 'react-icons/fi'
import useAuthStore from '../../context/useAuthStore.js'
import { getSellerProfileAPI } from '../../api/sellerAPI.js'

const f = '"DM Sans", system-ui, sans-serif'

const NAV = [
  {
    section: null,
    items: [{ label: 'Home', Icon: FiHome, path: '/seller/dashboard', exact: true }],
  },
  {
    section: 'Manage Business',
    items: [
      { label: 'Orders',            Icon: FiShoppingBag, path: '/seller/orders' },
      { label: 'Returns',           Icon: FiRefreshCw,   path: '/seller/returns' },
      { label: 'Pricing',           Icon: FiDollarSign,  path: '/seller/pricing', sub: true },
      { label: 'Claims',            Icon: FiAlertOctagon,path: '/seller/claims' },
      { label: 'Inventory',         Icon: FiDatabase,    path: '/seller/products' },
      { label: 'Catalog Uploads',   Icon: FiUploadCloud, path: '/seller/products/add' },
      { label: 'Image Bulk Upload', Icon: FiImage,       path: '/seller/images' },
      { label: 'Quality',           Icon: FiAward,       path: '/seller/quality' },
      { label: 'Payments',          Icon: FiCreditCard,  path: '/seller/payments' },
      { label: 'Warehouse',         Icon: FiArchive,     path: '/seller/warehouse' },
    ],
  },
  {
    section: 'Boost Sales',
    items: [
      { label: 'Influencer Marketing', Icon: FiZap,       path: '/seller/influencer' },
      { label: 'Promotions',           Icon: FiGift,      path: '/seller/promotions', badge: '03d left' },
      { label: 'Instant Cash',         Icon: FiDollarSign,path: '/seller/instant-cash' },
    ],
  },
  {
    section: 'Performance',
    items: [
      { label: 'Business Dashboard', Icon: FiActivity, path: '/seller/analytics' },
      { label: 'Reviews',            Icon: FiStar,     path: '/seller/reviews' },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'My Profile', Icon: FiUser, path: '/seller/profile' },
    ],
  },
]

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function Sidebar({ collapsed, seller, onNavigate, currentPath }) {
  const sd        = seller?.sellerDetails || {}
  const storeName = sd.businessName || seller?.name || 'My Store'

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      minHeight: '100vh',
      background: '#1C1C2E',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 100,
      boxShadow: '2px 0 16px rgba(0,0,0,0.25)',
    }}>

      {/* Store header */}
      <div onClick={() => onNavigate('/seller/dashboard')}
        style={{ padding: collapsed ? '16px 0' : '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '64px', justifyContent: collapsed ? 'center' : 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg,#f97316,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '14px', fontFamily: f }}>
            {storeName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <p style={{ margin: 0, fontWeight: '700', fontSize: '12px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: f }}>
              {storeName.toUpperCase()}
            </p>
          )}
        </div>
        {!collapsed && <FiChevronDown size={14} style={{ color: '#555', flexShrink: 0 }} />}
      </div>

      {/* Notices / Support */}
      {!collapsed && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['Notices', 'Support'].map(lbl => (
            <button key={lbl} style={{ flex: 1, padding: '9px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: f, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
              <FiBell size={11} /> {lbl}
            </button>
          ))}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0' }}>
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && !collapsed && (
              <p style={{ fontSize: '9px', fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '14px 0 3px', padding: '0 14px', fontFamily: f }}>
                {group.section}
              </p>
            )}
            {group.items.map(item => {
              const active = item.exact
                ? currentPath === item.path
                : currentPath.startsWith(item.path)
              return (
                <button key={item.path} onClick={() => onNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px 0' : '8px 14px', background: active ? 'rgba(233,30,140,0.12)' : 'none', border: 'none', borderLeft: active ? '3px solid #E91E8C' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s', fontFamily: f }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}>
                  <item.Icon size={15} style={{ color: active ? '#E91E8C' : '#94A3B8', flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={{ fontSize: '12px', fontWeight: active ? '700' : '500', color: active ? '#fff' : '#94A3B8', flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span style={{ fontSize: '9px', fontWeight: '700', background: '#E91E8C', color: '#fff', padding: '2px 6px', borderRadius: '20px' }}>
                          {item.badge}
                        </span>
                      )}
                      {item.sub && <FiChevronDown size={11} style={{ color: '#4A5568' }} />}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Branding */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '8px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '9px' }}>S</span>
        </div>
        {!collapsed && <span style={{ fontSize: '10px', fontWeight: '700', color: '#4A5568', letterSpacing: '0.5px', fontFamily: f }}>StyleHub Supplier</span>}
      </div>
    </aside>
  )
}

/* ── Layout wrapper ───────────────────────────────────────────────────────── */
export default function SellerLayout({ children }) {
  const navigate         = useNavigate()
  const location         = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [seller, setSeller]       = useState(null)

  // ── Fetch seller profile once so store name is always available ──
  useEffect(() => {
    getSellerProfileAPI()
      .then(({ data }) => setSeller(data.user))
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: f }}>

      <Sidebar
        collapsed={collapsed}
        seller={seller}
        onNavigate={navigate}
        currentPath={location.pathname}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top navbar */}
        <nav style={{ background: '#fff', height: '60px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setCollapsed(v => !v)}
              style={{ padding: '7px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', borderRadius: '8px', display: 'flex', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#1A1A2E' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' }}>
              <FiMenu size={19} />
            </button>
            <div>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: '#1A1A2E', lineHeight: 1 }}>Seller Hub</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', lineHeight: 1.4 }}>{user?.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ position: 'relative', padding: '7px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#64748B', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <FiBell size={17} />
              <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', background: '#E91E8C', borderRadius: '50%', border: '2px solid #fff' }} />
            </button>
            <button onClick={() => navigate('/seller/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: '#7C3AED', fontFamily: f, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
              onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}>
              <FiUser size={13} /> Profile
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: '#E11D48', fontFamily: f, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFE4E6'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF1F2'}>
              <FiLogOut size={13} /> Logout
            </button>
          </div>
        </nav>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        aside::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  )
}