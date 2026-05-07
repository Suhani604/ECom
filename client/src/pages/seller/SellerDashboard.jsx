import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPackage, FiCheckCircle, FiClock, FiXCircle,
  FiPlus, FiAlertCircle, FiLogOut, FiTrendingUp,
  FiStar, FiShoppingBag, FiBell, FiChevronRight,
  FiUser, FiBarChart2,
} from 'react-icons/fi'
import { getDashboardStatsAPI, getSellerProfileAPI } from '../../api/sellerAPI.js'
import useAuthStore from '../../context/useAuthStore.js'

export default function SellerDashboard() {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()
  const [stats,   setStats]   = useState({ totalProducts:0, activeProducts:0, pendingProducts:0, rejectedProducts:0 })
  const [seller,  setSeller]  = useState(null)
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([getDashboardStatsAPI(), getSellerProfileAPI()])
        setStats(s.data.stats)
        setSeller(p.data.user)
      } catch(_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const approvalStatus = seller?.sellerDetails?.approvalStatus || 'pending'
  const onboardingDone = seller?.sellerDetails?.onboardingComplete
  const sd = seller?.sellerDetails || {}

  const statCards = [
    { key:'totalProducts',    label:'Total Products', Icon: FiPackage,     light:'bg-violet-50', tc:'text-violet-600', bc:'border-violet-100' },
    { key:'activeProducts',   label:'Live & Active',  Icon: FiCheckCircle, light:'bg-emerald-50',tc:'text-emerald-600',bc:'border-emerald-100' },
    { key:'pendingProducts',  label:'Under Review',   Icon: FiClock,       light:'bg-amber-50',  tc:'text-amber-600',  bc:'border-amber-100' },
    { key:'rejectedProducts', label:'Rejected',       Icon: FiXCircle,     light:'bg-rose-50',   tc:'text-rose-500',   bc:'border-rose-100' },
  ]

  const quickActions = [
    { label:'Add Product', sub:'List new garments',       Icon: FiPlus,      grad:'from-pink-500 to-rose-500',     path:'/seller/products/add' },
    { label:'My Products', sub:'View & manage listings',  Icon: FiPackage,   grad:'from-violet-500 to-indigo-500', path:'/seller/products' },
    { label:'My Profile',  sub:'GSTIN, bank, address',    Icon: FiUser,      grad:'from-emerald-500 to-teal-500',  path:'/seller/onboarding' },
    { label:'Analytics',   sub:'Sales & performance',     Icon: FiBarChart2, grad:'from-amber-500 to-orange-500',  path:'/seller/analytics' },
  ]

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily:'Poppins, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-pink-200"
              style={{ background:'linear-gradient(135deg,#f97316,#ec4899)' }}>K</div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-tight">Seller Hub</p>
              <p className="text-xs text-gray-400 leading-tight">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <FiBell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full"/>
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
              <FiLogOut size={14}/> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── ONBOARDING BANNER ── */}
        {!onboardingDone && !loading && (
          <div className="rounded-2xl p-5 flex items-center justify-between gap-4 border border-orange-200"
            style={{ background:'linear-gradient(135deg,#fff7ed,#fef3c7)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-orange-500" size={20}/>
              </div>
              <div>
                <p className="font-bold text-orange-800 text-sm">Complete your seller profile</p>
                <p className="text-orange-600 text-xs mt-0.5">Add GSTIN, bank details and pickup address to start selling</p>
              </div>
            </div>
            <button onClick={() => navigate('/seller/onboarding')}
              className="flex-shrink-0 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              style={{ background:'linear-gradient(135deg,#f97316,#ea580c)' }}>
              Complete Now →
            </button>
          </div>
        )}

        {/* ── APPROVAL PENDING ── */}
        {onboardingDone && approvalStatus === 'pending' && (
          <div className="rounded-2xl p-5 flex items-center gap-3 border border-yellow-200"
            style={{ background:'linear-gradient(135deg,#fffbeb,#fef9c3)' }}>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiClock className="text-yellow-600" size={20}/>
            </div>
            <div>
              <p className="font-bold text-yellow-800 text-sm">Account under review</p>
              <p className="text-yellow-700 text-xs mt-0.5">Admin will approve your account within 24–48 hours. You'll be notified.</p>
            </div>
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 shadow-xl shadow-pink-200"
          style={{ background:'linear-gradient(135deg,#ec4899,#f97316)' }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
          <div className="absolute top-4 right-32 w-20 h-20 bg-white/10 rounded-full pointer-events-none"/>

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">{greeting} 👋</p>
              <h1 className="text-white text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow">
                {user?.name?.split(' ')[0] || 'Seller'}
              </h1>
              <p className="text-pink-100 text-sm">{sd.businessName || 'Your Store'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {approvalStatus === 'approved' && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold border border-white/20">
                    ✓ Verified Seller
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold border border-white/20">
                  ⭐ Trusted Store
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex-shrink-0">
              <FiShoppingBag className="text-white mb-1" size={26}/>
              <p className="text-white text-xs font-semibold capitalize">{approvalStatus}</p>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Overview</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ key, label, Icon, light, tc, bc }) => (
              <div key={key}
                className={`bg-white rounded-2xl p-5 border ${bc} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default`}>
                <div className={`w-10 h-10 ${light} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={tc} size={18}/>
                </div>
                <p className="text-xs text-gray-400 font-semibold mb-1">{label}</p>
                {loading
                  ? <div className="h-9 w-14 bg-gray-100 rounded-xl animate-pulse"/>
                  : <p className={`text-3xl font-extrabold ${tc}`}>{stats[key] ?? 0}</p>
                }
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map(({ label, sub, Icon, grad, path }) => (
              <button key={path} onClick={() => navigate(path)}
                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={20}/>
                </div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sub}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-300 group-hover:text-pink-400 transition-colors font-medium">
                  Open <FiChevronRight size={12}/>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── BOOST BANNER ── */}
        <div className="rounded-2xl p-5 flex items-center gap-4 border border-violet-100"
          style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200"
            style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            <FiTrendingUp className="text-white" size={20}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-violet-800">Boost your sales!</p>
            <p className="text-xs text-violet-500 mt-0.5">Add more products and quality images to reach more buyers on the platform.</p>
          </div>
          <button onClick={() => navigate('/seller/products/add')}
            className="flex-shrink-0 px-4 py-2 text-white text-xs font-bold rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            Add Now
          </button>
        </div>

        {/* ── ACCOUNT SUMMARY ── */}
        {seller && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Summary</p>
              <button onClick={() => navigate('/seller/onboarding')}
                className="text-xs text-pink-500 font-semibold hover:text-pink-600 flex items-center gap-1 transition-colors">
                Edit <FiChevronRight size={12}/>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-50">
              {[
                { label:'Business',    value: sd.businessName },
                { label:'GSTIN',       value: sd.gstin,               mono: true },
                { label:'Bank',        value: sd.bankName },
                { label:'Pickup City', value: sd.pickupAddress?.city },
              ].map((item) => (
                <div key={item.label} className="px-5 py-4">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className={`text-sm font-bold text-gray-800 truncate ${item.mono ? 'font-mono text-xs' : ''}`}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIPS ── */}
        <div className="grid sm:grid-cols-3 gap-4 pb-4">
          {[
            { Icon: FiStar,       bg:'bg-amber-50',   ic:'text-amber-500',  title:'Quality Photos',      tip:'Use 3–8 clear images per product for better buyer trust and conversions.' },
            { Icon: FiPackage,    bg:'bg-emerald-50', ic:'text-emerald-500',title:'Competitive Pricing', tip:'Price smartly to rank higher in search and attract more buyers.' },
            { Icon: FiTrendingUp, bg:'bg-violet-50',  ic:'text-violet-500', title:'Keep Stock Updated',  tip:'Mark out-of-stock variants quickly to avoid order cancellations.' },
          ].map(({ Icon, bg, ic, title, tip }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={ic} size={16}/>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}