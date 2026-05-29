import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiTrendingUp, FiPackage, FiShoppingBag, FiDollarSign,
  FiStar, FiBarChart2, FiCalendar, FiArrowUp, FiArrowDown,
} from 'react-icons/fi'
import { getDashboardStatsAPI, getSellerProfileAPI } from '../../api/sellerAPI.js'

const f = '"DM Sans", system-ui, sans-serif'

/* ── Simple bar chart ─────────────────────────────────────────────────────── */
function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '100%', background: `${color}22`, borderRadius: '4px 4px 0 0', height: '68px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
            <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0', transition: 'height 0.6s ease' }} />
          </div>
          <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: '500', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stat card ────────────────────────────────────────────────────────────── */
function StatCard({ Icon, iconBg, iconColor, label, value, sub, trend, trendUp }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '38px', height: '38px', background: iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
        {trend !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '700', color: trendUp ? '#16A34A' : '#DC2626', background: trendUp ? '#DCFCE7' : '#FEE2E2', padding: '3px 8px', borderRadius: '20px' }}>
            {trendUp ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />} {trend}
          </span>
        )}
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>{label}</p>
      {sub && <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>{sub}</p>}
    </div>
  )
}

export default function SellerAnalyticsPage() {
  const navigate         = useNavigate()
  const [stats,   setStats]   = useState({ totalProducts: 0, activeProducts: 0, pendingProducts: 0, rejectedProducts: 0 })
  const [seller,  setSeller]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('7d')

  useEffect(() => {
    Promise.all([getDashboardStatsAPI(), getSellerProfileAPI()])
      .then(([s, p]) => { setStats(s.data.stats); setSeller(p.data.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* Mock chart data — replace with real API data when available */
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const viewsData  = weekLabels.map(label => ({ label, value: Math.floor(Math.random() * 80 + 20) }))
  const ordersData = weekLabels.map(label => ({ label, value: Math.floor(Math.random() * 10) }))
  const revenueData = weekLabels.map(label => ({ label, value: Math.floor(Math.random() * 5000 + 500) }))

  const periods = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#111827' }}>Business Dashboard</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Track your performance and sales insights</p>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ padding: '8px 14px', background: period === p.key ? '#7C3AED' : '#fff', color: period === p.key ? '#fff' : '#6B7280', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: f, transition: 'all 0.15s' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard Icon={FiPackage}    iconBg="#F5F3FF" iconColor="#7C3AED" label="Total Products"  value={loading ? '—' : stats.totalProducts}    sub="All listed products" trend="+5%" trendUp={true} />
        <StatCard Icon={FiBarChart2}  iconBg="#ECFDF5" iconColor="#059669" label="Live & Active"   value={loading ? '—' : stats.activeProducts}   sub="Currently visible" trend="+2%" trendUp={true} />
        <StatCard Icon={FiClock2}     iconBg="#FFFBEB" iconColor="#D97706" label="Under Review"    value={loading ? '—' : stats.pendingProducts}  sub="Awaiting approval" />
        <StatCard Icon={FiDollarSign} iconBg="#FFF1F2" iconColor="#E11D48" label="Rejected"        value={loading ? '—' : stats.rejectedProducts} sub="Needs attention" trend="-1" trendUp={false} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111827' }}>Product Views</p>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#9CA3AF' }}>Impressions this week</p>
            </div>
            <FiTrendingUp size={16} style={{ color: '#7C3AED' }} />
          </div>
          <BarChart data={viewsData} color="#7C3AED" />
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111827' }}>Orders</p>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#9CA3AF' }}>Orders this week</p>
            </div>
            <FiShoppingBag size={16} style={{ color: '#059669' }} />
          </div>
          <BarChart data={ordersData} color="#059669" />
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111827' }}>Revenue (₹)</p>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#9CA3AF' }}>Earnings this week</p>
            </div>
            <FiDollarSign size={16} style={{ color: '#D97706' }} />
          </div>
          <BarChart data={revenueData} color="#D97706" />
        </div>
      </div>

      {/* Performance tips */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>💡 Performance Tips</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {[
            { icon: '📸', title: 'Upload Better Images', desc: 'Products with 5+ images get 3x more views. Try our Image Bulk Upload tool.', action: () => navigate('/seller/images'), cta: 'Upload Images' },
            { icon: '🏷️', title: 'Update Pricing',       desc: 'Competitive pricing can boost your rank in search results significantly.', action: () => navigate('/seller/products'), cta: 'Edit Products' },
            { icon: '📦', title: 'Add More Products',    desc: 'Sellers with 10+ products earn 5x more than those with fewer listings.', action: () => navigate('/seller/products/add'), cta: 'Add Product' },
          ].map(tip => (
            <div key={tip.title} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{tip.icon}</span>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: '#111827' }}>{tip.title}</p>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#6B7280', lineHeight: 1.6 }}>{tip.desc}</p>
              <button onClick={tip.action}
                style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontFamily: f }}>
                {tip.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

/* fix: FiClock2 doesn't exist, use FiClock */
function FiClock2(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={props.size} height={props.size}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}