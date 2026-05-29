import { useState, useEffect } from 'react'
import { FiStar, FiMenu, FiSearch, FiEye, FiEyeOff, FiRefreshCw, FiMessageSquare } from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import api from '../../api/axiosInstance.js'

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={12}
          className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </span>
  )
}

function StatusBadge({ visible }) {
  return visible ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
      <FiEye size={10} /> Visible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200">
      <FiEyeOff size={10} /> Hidden
    </span>
  )
}

export default function AdminReviewsPage() {
  const [sideOpen,  setSideOpen]  = useState(false)
  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [toggling,  setToggling]  = useState(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reviews/admin/all')
      setReviews(data.reviews || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const toggleVisibility = async (review) => {
    setToggling(review._id)
    try {
      await api.patch(`/reviews/admin/${review._id}/visibility`, {
        isVisible: !review.isVisible,
      })
      setReviews((prev) =>
        prev.map((r) => r._id === review._id ? { ...r, isVisible: !r.isVisible } : r)
      )
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(null)
    }
  }

  const visible = reviews
    .filter((r) => filter === 'all' || String(r.rating) === filter)
    .filter((r) => {
      const q = search.toLowerCase()
      return (
        !q ||
        r.buyer?.name?.toLowerCase().includes(q) ||
        r.product?.title?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      )
    })

  const total   = reviews.length
  const avgRaw  = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const avg     = Math.round(avgRaw * 10) / 10
  const hidden  = reviews.filter((r) => !r.isVisible).length

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
              <h1 className="text-base font-bold text-gray-900">Reviews</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Manage buyer reviews across all products</p>
            </div>
          </div>
          <button onClick={fetchReviews}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all">
            <FiRefreshCw size={13} /> Refresh
          </button>
        </header>

        <main className="flex-1 p-5 sm:p-7 space-y-6 max-w-7xl w-full mx-auto">

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Reviews',  value: total,          bg: 'bg-violet-50',  tc: 'text-violet-600', bc: 'border-violet-100' },
              { label: 'Average Rating', value: avg,            bg: 'bg-amber-50',   tc: 'text-amber-500',  bc: 'border-amber-100'  },
              { label: 'Visible',        value: total - hidden, bg: 'bg-emerald-50', tc: 'text-emerald-600',bc: 'border-emerald-100'},
              { label: 'Hidden',         value: hidden,         bg: 'bg-gray-50',    tc: 'text-gray-500',   bc: 'border-gray-200'   },
            ].map((c) => (
              <div key={c.label} className={`bg-white rounded-2xl p-4 border ${c.bc} shadow-sm`}>
                <p className="text-xs text-gray-400 font-semibold mb-1">{c.label}</p>
                <p className={`text-3xl font-extrabold ${c.tc}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by buyer, product or comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', '5', '4', '3', '2', '1'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filter === f
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                  style={filter === f ? { background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' } : {}}>
                  {f === 'all' ? 'All' : `★ ${f}`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Buyer', 'Product', 'Rating', 'Review', 'Date', 'Status', 'Action'].map((h) => (
                      <th key={h}
                        className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : visible.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <FiMessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400 text-sm">No reviews found</p>
                        <p className="text-gray-300 text-xs mt-1">Reviews appear once buyers rate products</p>
                      </td>
                    </tr>
                  ) : (
                    visible.map((r) => (
                      <tr key={r._id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition-colors">

                        {/* Buyer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>
                              {r.buyer?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                                {r.buyer?.name || 'Unknown'}
                              </p>
                              <p className="text-gray-400 text-xs">{r.buyer?.email || ''}</p>
                            </div>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-5 py-4">
                          <p className="text-xs text-gray-700 font-medium max-w-[140px] truncate">
                            {r.product?.title || '—'}
                          </p>
                        </td>

                        {/* Rating */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <Stars rating={r.rating} />
                            <span className="text-xs text-gray-400">{r.rating}/5</span>
                          </div>
                        </td>

                        {/* Review text */}
                        <td className="px-5 py-4 max-w-[200px]">
                          {r.title && (
                            <p className="text-xs font-semibold text-gray-700 mb-0.5 truncate">{r.title}</p>
                          )}
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {r.comment || '—'}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge visible={r.isVisible} />
                        </td>

                        {/* Toggle action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleVisibility(r)}
                            disabled={toggling === r._id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                              ${r.isVisible
                                ? 'bg-white border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                              } disabled:opacity-50`}>
                            {toggling === r._id ? (
                              <FiRefreshCw size={11} className="animate-spin" />
                            ) : r.isVisible ? (
                              <><FiEyeOff size={11} /> Hide</>
                            ) : (
                              <><FiEye size={11} /> Show</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}