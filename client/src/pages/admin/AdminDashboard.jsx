import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
  FiClock, FiMenu, FiTrendingUp, FiAlertCircle,
  FiCheck, FiChevronRight, FiBell, FiStar,
} from 'react-icons/fi'
import { getAdminDashboardAPI } from '../../api/adminAPI.js'
import useAuthStore from '../../context/useAuthStore.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'

export default function AdminDashboard() {
  const navigate          = useNavigate()
  const { user }          = useAuthStore()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [sideOpen,setSideOpen]= useState(false)

  useEffect(() => {
    getAdminDashboardAPI()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label:'Total Buyers',     key:'totalBuyers',     Icon: FiUsers,       light:'bg-blue-50',   tc:'text-blue-600',   bc:'border-blue-100' },
    { label:'Total Sellers',    key:'totalSellers',    Icon: FiShoppingBag, light:'bg-violet-50', tc:'text-violet-600', bc:'border-violet-100' },
    { label:'Pending Sellers',  key:'pendingSellers',  Icon: FiClock,       light:'bg-amber-50',  tc:'text-amber-600',  bc:'border-amber-100' },
    { label:'Active Products',  key:'activeProducts',  Icon: FiCheck,       light:'bg-emerald-50',tc:'text-emerald-600',bc:'border-emerald-100' },
    { label:'Pending Products', key:'pendingProducts', Icon: FiAlertCircle, light:'bg-orange-50', tc:'text-orange-600', bc:'border-orange-100' },
    { label:'Total Orders',     key:'totalOrders',     Icon: FiPackage,     light:'bg-teal-50',   tc:'text-teal-600',   bc:'border-teal-100' },
    { label:'Orders This Week', key:'recentOrders',    Icon: FiTrendingUp,  light:'bg-pink-50',   tc:'text-pink-600',   bc:'border-pink-100' },
    { label:'Total Revenue',    key:'totalRevenue',    Icon: FiDollarSign,  light:'bg-green-50',  tc:'text-green-600',  bc:'border-green-100', prefix:'₹' },
  ]

  const quickActions = [
    { title:'Pending Sellers',  sub: `${stats?.pendingSellers||0} sellers waiting`,   btn:'Review Sellers',   color:'#f97316', grad:'from-orange-400 to-amber-500',  path:'/admin/sellers' },
    { title:'Pending Products', sub: `${stats?.pendingProducts||0} products waiting`, btn:'Approve Products', color:'#8b5cf6', grad:'from-violet-500 to-purple-500', path:'/admin/products' },
    { title:'All Orders',       sub: `${stats?.recentOrders||0} orders this week`,    btn:'View Orders',      color:'#0ea5e9', grad:'from-sky-400 to-blue-500',      path:'/admin/orders' },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily:'Poppins, sans-serif' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top bar ── */}
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Platform overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <FiBell size={18} />
              {(stats?.pendingSellers > 0 || stats?.pendingProducts > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
              )}
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background:'linear-gradient(135deg,#ec4899,#f97316)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 space-y-7 max-w-7xl w-full mx-auto">

          {/* ── Welcome hero ── */}
          <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
            style={{ background:'linear-gradient(135deg,#ec4899,#f97316)' }}>
            {/* decorative blobs – kept subtle with opacity only, no blur */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative">
              <p className="text-white/80 text-sm mb-1">Welcome back 👋</p>
              <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-1">
                {user?.name?.split(' ')[0] || 'Admin'}
              </h2>
              <p className="text-white/80 text-sm">Here's your platform overview for today</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {stats?.pendingSellers > 0 && (
                  <button onClick={() => navigate('/admin/sellers')}
                    className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-full font-semibold hover:bg-white/30 transition-all">
                    ⏳ {stats.pendingSellers} sellers pending
                  </button>
                )}
                {stats?.pendingProducts > 0 && (
                  <button onClick={() => navigate('/admin/products')}
                    className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-full font-semibold hover:bg-white/30 transition-all">
                    📋 {stats.pendingProducts} products pending
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Platform Stats</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statCards.map(({ label, key, Icon, light, tc, bc, prefix }) => (
                <div key={key}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border ${bc} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                  <div className={`w-9 h-9 ${light} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={tc} size={16} />
                  </div>
                  <p className="text-xs text-gray-400 font-semibold mb-1 leading-tight">{label}</p>
                  {loading
                    ? <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse" />
                    : <p className={`text-2xl sm:text-3xl font-extrabold ${tc}`}>
                        {prefix || ''}{key === 'totalRevenue'
                          ? (stats?.[key] || 0).toLocaleString('en-IN')
                          : stats?.[key] ?? 0}
                      </p>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {quickActions.map((a) => (
                <div key={a.path}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center mb-3 shadow-md`}>
                    <FiChevronRight className="text-white" size={18} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{a.title}</h3>
                  <p className="text-xs text-gray-400 mb-4">{a.sub}</p>
                  <button onClick={() => navigate(a.path)}
                    className="w-full py-2 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90 hover:shadow-md"
                    style={{ background:`linear-gradient(135deg,${a.color},${a.color}cc)` }}>
                    {a.btn} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Nav shortcuts ── */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Navigate To</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { path:'/admin/sellers',  label:'Sellers',  emoji:'🏪', color:'text-orange-500', bg:'bg-orange-50' },
                { path:'/admin/products', label:'Products', emoji:'👕', color:'text-violet-500', bg:'bg-violet-50' },
                { path:'/admin/buyers',   label:'Buyers',   emoji:'👥', color:'text-blue-500',   bg:'bg-blue-50'   },
                { path:'/admin/orders',   label:'Orders',   emoji:'📦', color:'text-teal-500',   bg:'bg-teal-50'   },
                { path:'/admin/reviews',  label:'Reviews',  emoji:'⭐', color:'text-amber-500',  bg:'bg-amber-50'  },
              ].map((link) => (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group">
                  <div className={`w-10 h-10 ${link.bg} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{link.emoji}</span>
                  </div>
                  <p className={`text-sm font-bold ${link.color}`}>{link.label}</p>
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}