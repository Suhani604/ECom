import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPackage, FiCheckCircle, FiClock, FiXCircle,
  FiPlus, FiAlertCircle, FiTrendingUp, FiStar,
  FiShoppingBag, FiChevronRight, FiUser, FiBarChart2,
  FiChevronDown, FiExternalLink, FiHelpCircle,
} from 'react-icons/fi'
import { getDashboardStatsAPI, getSellerProfileAPI, getSellerOrdersAPI } from '../../api/sellerAPI.js'
import useAuthStore from '../../context/useAuthStore.js'
import SellerLayout from './SellerLayout.jsx'

const f = '"DM Sans", system-ui, sans-serif'

/* ── 3-step onboarding tracker ────────────────────────────────────────────── */
function OnboardingTracker({ stats, seller, navigate }) {
  const sd             = seller?.sellerDetails || {}
  const onboardingDone = sd.onboardingComplete
  const approvalStatus = sd.approvalStatus || 'pending'
  const hasProducts    = stats.totalProducts > 0
  const hasOrders      = stats.totalOrders > 0   // ← now uses real order count

  const steps = [
    {
      num: 1, done: onboardingDone,
      label: 'Upload catalogs to get started',
      sublabel: onboardingDone ? 'Profile complete ✓' : 'Complete your seller profile',
      action: onboardingDone ? null : () => navigate('/seller/onboarding'),
      actionLabel: 'Complete Profile',
    },
    {
      num: 2, done: approvalStatus === 'approved',
      label: 'Catalogs go live on StyleHub',
      sublabel: approvalStatus === 'approved' ? 'Your account is approved ✓' : 'Waiting for admin approval',
      action: null,
    },
    {
      num: 3, done: hasOrders,
      label: 'Get your first order',
      sublabel: hasOrders ? `You have ${stats.totalOrders} order(s)!` : 'Start receiving orders from buyers',
      action: hasOrders
        ? () => navigate('/seller/orders')
        : hasProducts
          ? () => navigate('/seller/products')
          : () => navigate('/seller/products/add'),
      actionLabel: hasOrders ? 'View Orders' : hasProducts ? 'View Products' : 'Add Products',
    },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
      {/* Step tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        {steps.map((step, i) => {
          const isCurrent = !step.done && (i === 0 || steps[i - 1].done)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: isCurrent ? '2.5px solid #7C3AED' : '2.5px solid transparent', minWidth: 0, cursor: 'pointer', transition: 'all 0.15s', background: isCurrent ? '#FAFAF9' : 'transparent' }}>
              {step.done ? (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCheckCircle size={13} style={{ color: '#16A34A' }} />
                </div>
              ) : (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isCurrent ? '#EDE9FE' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: isCurrent ? '#7C3AED' : '#9CA3AF' }}>{i + 1}</span>
                </div>
              )}
              <span style={{ fontSize: '12px', fontWeight: isCurrent ? '700' : '500', color: step.done ? '#6B7280' : isCurrent ? '#1F2937' : '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Active step body */}
      {steps.map((step, i) => {
        const isCurrent = !step.done && (i === 0 || steps[i - 1].done)
        if (!isCurrent) return null
        return (
          <div key={i} style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: '#FEF3C7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiAlertCircle size={20} style={{ color: '#D97706' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#111827', fontSize: '14px' }}>
                  {i === 0 ? 'Complete your seller profile' : i === 1 ? 'Account approval in progress' : 'Start getting orders'}
                </p>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '12px', lineHeight: 1.6 }}>
                  {i === 0 ? 'Add GSTIN, bank details and pickup address to start selling on StyleHub.' : i === 1 ? 'Admin will review and approve your account within 24–48 hours.' : 'Add more products and quality images to attract buyers.'}
                </p>
              </div>
            </div>
            {step.action && (
              <button onClick={step.action}
                style={{ flexShrink: 0, padding: '10px 20px', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: f, boxShadow: '0 4px 12px rgba(124,58,237,0.3)', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {step.actionLabel} →
              </button>
            )}
          </div>
        )
      })}

      {/* All done */}
      {steps.every(s => s.done) && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#16A34A', fontSize: '14px' }}>🎉 All steps complete! You're selling on StyleHub.</p>
        </div>
      )}
    </div>
  )
}

/* ── Recent Orders mini-list ──────────────────────────────────────────────── */
function RecentOrdersPanel({ orders, navigate }) {
  const STATUS_COLOR = {
    pending:   { color: '#D97706', bg: '#FFFBEB' },
    confirmed: { color: '#2563EB', bg: '#EFF6FF' },
    shipped:   { color: '#7C3AED', bg: '#F5F3FF' },
    delivered: { color: '#059669', bg: '#ECFDF5' },
    cancelled: { color: '#DC2626', bg: '#FEF2F2' },
  }

  if (!orders.length) return null

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#111827' }}>Recent Orders</p>
        <button onClick={() => navigate('/seller/orders')}
          style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, display: 'flex', alignItems: 'center', gap: '4px' }}>
          View All <FiChevronRight size={12} />
        </button>
      </div>
      <div>
        {orders.slice(0, 5).map((order, idx) => {
          const buyer = order.buyer || {}
          const cfg = STATUS_COLOR[order.status] || STATUS_COLOR.pending
          const addr = order.shippingAddress || {}
          return (
            <div key={order._id || idx}
              onClick={() => navigate('/seller/orders')}
              style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx < 4 ? '1px solid #F9FAFB' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              {/* Avatar */}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiUser size={15} style={{ color: '#7C3AED' }} />
              </div>

              {/* Buyer info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {buyer.name || 'Unknown Buyer'}
                </p>
                <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[addr.city, addr.state].filter(Boolean).join(', ') || buyer.email || '—'}
                </p>
              </div>

              {/* Amount */}
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#111827', flexShrink: 0 }}>
                ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
              </p>

              {/* Status badge */}
              <span style={{ fontSize: '10px', fontWeight: '700', color: cfg.color, background: cfg.bg, padding: '3px 8px', borderRadius: '20px', flexShrink: 0 }}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Learn section ────────────────────────────────────────────────────────── */
function LearnPanel({ seller, navigate }) {
  return (
    <div style={{ width: '300px', flexShrink: 0 }}>
      {/* Account setup */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111827' }}>Complete your account setup</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>Add the below information to improve your selling journey</p>
        </div>
        <div style={{ padding: '4px 0' }}>
          {[
            { icon: '🔑', label: 'Set Password',    done: true,                                          path: '/seller/onboarding' },
            { icon: '🏦', label: 'Bank Details',    done: !!seller?.sellerDetails?.bankName,             path: '/seller/onboarding' },
            { icon: '📍', label: 'Pickup Address',  done: !!seller?.sellerDetails?.pickupAddress?.city,  path: '/seller/onboarding' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '12px', fontWeight: '600', color: item.done ? '#6B7280' : '#111827', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
              {item.done
                ? <FiCheckCircle size={14} style={{ color: '#16A34A' }} />
                : <FiChevronRight size={14} style={{ color: '#9CA3AF' }} />
              }
            </button>
          ))}
        </div>
      </div>

      {/* Learn & Grow */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111827' }}>Learn & Grow On StyleHub</p>
        </div>
        <div style={{ padding: '4px 0' }}>
          {[
            { icon: '📚', label: 'Book free live training',      badge: 'Expert Led' },
            { icon: '📦', label: 'Prepare catalogs for StyleHub' },
            { icon: '💰', label: 'Pricing & commission' },
            { icon: '🚚', label: 'Delivery & Returns' },
          ].map(item => (
            <button key={item.label}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '12px', fontWeight: '500', color: '#374151' }}>{item.label}</span>
              {item.badge && (
                <span style={{ fontSize: '9px', fontWeight: '700', background: '#DCFCE7', color: '#16A34A', padding: '2px 6px', borderRadius: '20px' }}>{item.badge}</span>
              )}
              <FiChevronRight size={13} style={{ color: '#D1D5DB' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main Dashboard ────────────────────────────────────────────────────────── */
export default function SellerDashboard() {
  const navigate      = useNavigate()
  const { user }      = useAuthStore()

  const [stats,         setStats]         = useState({ totalProducts: 0, activeProducts: 0, pendingProducts: 0, rejectedProducts: 0, totalOrders: 0, pendingOrders: 0 })
  const [seller,        setSeller]        = useState(null)
  const [recentOrders,  setRecentOrders]  = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([getDashboardStatsAPI(), getSellerProfileAPI()])
        setStats(s.data.stats)
        setSeller(p.data.user)

        // Fetch recent 5 orders for the mini-list
        try {
          const ordRes = await getSellerOrdersAPI({ page: 1, limit: 5 })
          setRecentOrders(ordRes.data.orders || [])
          // Merge order counts into stats if backend doesn't return them
          setStats(prev => ({
            ...prev,
            totalOrders:   ordRes.data.total || 0,
            pendingOrders: (ordRes.data.orders || []).filter(o => o.status === 'pending').length,
          }))
        } catch (_) {}
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const sd             = seller?.sellerDetails || {}
  const approvalStatus = sd.approvalStatus || 'pending'

  /* ── stat cards: now includes Orders ── */
  const statCards = [
    { key: 'totalProducts',    label: 'Total Products', Icon: FiPackage,     light: '#F5F3FF', tc: '#7C3AED', border: '#EDE9FE', path: '/seller/products' },
    { key: 'activeProducts',   label: 'Live & Active',  Icon: FiCheckCircle, light: '#ECFDF5', tc: '#059669', border: '#D1FAE5', path: '/seller/products' },
    { key: 'pendingProducts',  label: 'Under Review',   Icon: FiClock,       light: '#FFFBEB', tc: '#D97706', border: '#FDE68A', path: '/seller/products' },
    { key: 'totalOrders',      label: 'Total Orders',   Icon: FiShoppingBag, light: '#EFF6FF', tc: '#2563EB', border: '#BFDBFE', path: '/seller/orders' },
  ]

  /* ── quick actions: Orders replaces Analytics ── */
  const quickActions = [
    { label: 'Add Product', sub: 'List new garments',      Icon: FiPlus,        grad: 'linear-gradient(135deg,#f43f5e,#ec4899)', path: '/seller/products/add' },
    { label: 'My Products', sub: 'View & manage listings', Icon: FiPackage,     grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', path: '/seller/products' },
    { label: 'Orders',      sub: 'Buyer orders & details', Icon: FiShoppingBag, grad: 'linear-gradient(135deg,#2563eb,#0891b2)', path: '/seller/orders' },
    { label: 'My Profile',  sub: 'GSTIN, bank, address',   Icon: FiUser,        grad: 'linear-gradient(135deg,#059669,#0d9488)', path: '/seller/profile' },
  ]

  return (
    <SellerLayout seller={seller}>

      {/* Alert banner */}
      <div style={{ background: '#FFF7F0', borderBottom: '1px solid #FDDCBC', padding: '9px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertCircle size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#C2410C' }}>Complete your profile </span>
          <span style={{ fontSize: '12px', color: '#9A3412' }}>to start selling on StyleHub and receiving orders.</span>
        </div>
        <button onClick={() => navigate('/seller/onboarding')}
          style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', background: 'none', border: '1.5px solid #7C3AED', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: f, whiteSpace: 'nowrap', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7C3AED' }}>
          Complete Now
        </button>
      </div>

      <div style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* ── LEFT: Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Welcome heading */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
              Welcome {sd.businessName || user?.name?.split(' ')[0] || 'Seller'} 👋
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Let's get your business started in 3 steps</p>
          </div>

          {/* 3-step onboarding */}
          {!loading && <OnboardingTracker stats={stats} seller={seller} navigate={navigate} />}

          {/* Recent orders mini-list — only shown when orders exist */}
          {!loading && recentOrders.length > 0 && (
            <RecentOrdersPanel orders={recentOrders} navigate={navigate} />
          )}

          {/* Stats */}
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 12px' }}>Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
            {statCards.map(({ key, label, Icon, light, tc, border, path }) => (
              <div key={key}
                onClick={() => path && navigate(path)}
                style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s', cursor: path ? 'pointer' : 'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: '38px', height: '38px', background: light, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon size={17} style={{ color: tc }} />
                </div>
                <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600', margin: '0 0 3px', letterSpacing: '0.3px' }}>{label}</p>
                {loading
                  ? <div style={{ height: '32px', width: '48px', background: '#F1F5F9', borderRadius: '8px' }} />
                  : <p style={{ fontSize: '30px', fontWeight: '900', color: tc, margin: 0, lineHeight: 1 }}>{stats[key] ?? 0}</p>
                }
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 12px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
            {quickActions.map(({ label, sub, Icon, grad, path }) => (
              <button key={path} onClick={() => navigate(path)}
                style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', textAlign: 'left', fontFamily: f, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  <Icon size={19} style={{ color: '#fff' }} />
                </div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '800', color: '#1A1A2E' }}>{label}</p>
                <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#94A3B8', lineHeight: 1.5 }}>{sub}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#CBD5E1', fontWeight: '600' }}>
                  Open <FiChevronRight size={10} />
                </div>
              </button>
            ))}
          </div>

          {/* Tips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[
              { Icon: FiStar,       bg: '#FFFBEB', ic: '#D97706', title: 'Quality Photos',      tip: 'Use 3–8 clear images per product for better buyer trust.' },
              { Icon: FiPackage,    bg: '#ECFDF5', ic: '#059669', title: 'Competitive Pricing', tip: 'Price smartly to rank higher and attract more buyers.' },
              { Icon: FiTrendingUp, bg: '#F5F3FF', ic: '#7C3AED', title: 'Keep Stock Updated',  tip: 'Mark out-of-stock variants quickly to avoid cancellations.' },
            ].map(({ Icon, bg, ic, title, tip }) => (
              <div key={title} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #F1F5F9', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '34px', height: '34px', background: bg, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Icon size={15} style={{ color: ic }} />
                </div>
                <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '800', color: '#1A1A2E' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', lineHeight: 1.7 }}>{tip}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT: Learn panel ── */}
        {!loading && <LearnPanel seller={seller} navigate={navigate} />}
      </div>
    </SellerLayout>
  )
}