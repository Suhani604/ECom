import { useState, useEffect } from 'react'
import { FiStar, FiSearch, FiMessageSquare, FiRefreshCw } from 'react-icons/fi'
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

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reviews/seller/my-products')
      setReviews(data.reviews || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

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

  const total    = reviews.length
  const avgRaw   = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const avg      = Math.round(avgRaw * 10) / 10
  const fiveStar = reviews.filter((r) => r.rating === 5).length

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-6xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ratings & Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">See what buyers say about your products</p>
        </div>
        <button onClick={fetchReviews}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all">
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: total,    bg: 'bg-violet-50', tc: 'text-violet-600', bc: 'border-violet-100' },
          { label: 'Avg Rating',    value: avg,      bg: 'bg-amber-50',  tc: 'text-amber-500',  bc: 'border-amber-100'  },
          { label: '5-Star',        value: fiveStar, bg: 'bg-pink-50',   tc: 'text-pink-500',   bc: 'border-pink-100'   },
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
                {['Buyer', 'Product', 'Rating', 'Review', 'Date'].map((h) => (
                  <th key={h}
                    className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <FiMessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm">No reviews yet</p>
                    <p className="text-gray-300 text-xs mt-1">Reviews appear once buyers rate your products</p>
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
                        <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                          {r.buyer?.name || 'Anonymous'}
                        </span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-700 font-medium max-w-[150px] truncate">
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
                    <td className="px-5 py-4 max-w-[240px]">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}