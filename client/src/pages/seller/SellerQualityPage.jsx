import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerProductReviewsAPI as getSellerProductReviews } from '../../api/reviewAPI.js'

// ─── colour tokens ───────────────────────────────────────────────
const C = {
  pink:    '#E91E8C',
  purple:  '#7C3AED',
  green:   '#16A34A',
  yellow:  '#CA8A04',
  red:     '#DC2626',
  blocked: '#6B7280',
  border:  '#EBEBF0',
  text:    '#1A1A2E',
  sub:     '#6B7280',
  light:   '#94A3B8',
}

// ─── tiny helpers ────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px', ...style }}>
    {children}
  </div>
)

const Badge = ({ color, bg, children }) => (
  <span style={{ background: bg, color, fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
    {children}
  </span>
)

const scoreColors = [
  { label: 'Green',   range: '0 – 15%',      color: '#16A34A', barBg: '#22C55E', views: '1.6X VIEWS' },
  { label: 'Yellow',  range: '15 – 22%',      color: '#CA8A04', barBg: '#EAB308', views: '1X VIEWS'   },
  { label: 'Red',     range: '22 – 25%',      color: '#DC2626', barBg: '#EF4444', views: '0.6X VIEWS' },
  { label: 'Blocked', range: 'More than 25%', color: '#6B7280', barBg: '#9CA3AF', views: 'NO VIEWS'   },
]

// ─── Stars component ─────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: '12px', color: s <= rating ? '#FBBF24' : '#E5E7EB' }}>★</span>
      ))}
    </div>
  )
}

// ─── Compute zone from % of bad (1-2 star) ratings ───────────────
function getZone(badPercent) {
  if (badPercent <= 15) return { label: 'Green',   color: '#16A34A', bg: '#DCFCE7', bar: '#22C55E' }
  if (badPercent <= 22) return { label: 'Yellow',  color: '#CA8A04', bg: '#FEF9C3', bar: '#EAB308' }
  if (badPercent <= 25) return { label: 'Red',     color: '#DC2626', bg: '#FEE2E2', bar: '#EF4444' }
  return                       { label: 'Blocked', color: '#6B7280', bg: '#F3F4F6', bar: '#9CA3AF' }
}

export default function SellerQualityPage() {
  const navigate = useNavigate()
  const [activeTab,  setActiveTab]  = useState(1)
  const [search,     setSearch]     = useState('')
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ── Fetch real reviews from backend ──────────────────────────────
  const fetchReviews = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await getSellerProductReviews()
      setReviews(res.data?.reviews || [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // ── Derived stats ─────────────────────────────────────────────────
  const totalReviews = reviews.length
  const badReviews   = reviews.filter(r => r.rating <= 2).length
  const badPercent   = totalReviews > 0 ? (badReviews / totalReviews) * 100 : 0
  const avgRating    = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
  // Need at least 3 reviews for a score
  const qualityScore = totalReviews >= 3 ? Math.round(avgRating * 20) : null
  const zone         = getZone(badPercent)

  // Rating breakdown 5→1
  const breakdown = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   totalReviews > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0,
  }))

  // Top 3 most recent reviews for feedback panel
  const topFeedback = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  // Products with bad reviews grouped by product
  const badProductMap = {}
  reviews.filter(r => r.rating <= 2).forEach(r => {
    const pid = r.product?._id?.toString()
    if (!pid) return
    if (!badProductMap[pid]) badProductMap[pid] = { product: r.product, reviews: [] }
    badProductMap[pid].reviews.push(r)
  })
  const badProducts = Object.values(badProductMap)
    .filter(p => {
      if (!search.trim()) return true
      return (p.product?.title || '').toLowerCase().includes(search.toLowerCase())
    })

  const tabs = [
    `Blocking Soon (0)`,
    `Action Pending (${badProducts.length})`,
    `Fixed (0)`,
  ]

  return (
    <>
      {/* ── Page header — unchanged from your original ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</button>
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-sm">⭐</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-800">Product Quality</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button — NEW */}
          <button
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            style={{ fontSize: '12px', fontWeight: '600', color: C.purple, background: '#F5F0FF', border: `1px solid #DDD6FE`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', opacity: refreshing ? 0.6 : 1 }}>
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>
          <span className="text-xs text-gray-400">Learn about Quality</span>
          <div style={{ width: '28px', height: '20px', background: '#FF0000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>▶</span>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-5">

        {/* Info banner */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <span style={{ fontSize: '13px', color: '#15803D', fontWeight: '500' }}>Quality score updated. Based on ratings from</span>
          <Badge color="#166534" bg="#DCFCE7">✅ Trusted and verified customers</Badge>
        </div>

        {/* Quality Score + Feedback row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

          {/* ── Score card — NOW REAL DATA ── */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: C.text }}>
                Quality Score <span style={{ fontSize: '13px', color: C.light, cursor: 'help' }}>ⓘ</span>
              </h2>
            </div>

            {/* Stats row — REAL counts */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '13px', color: C.sub }}>
              <span>1 and 2 star ratings <strong style={{ color: C.text }}>{loading ? '—' : badReviews}</strong></span>
              <span>•</span>
              <span>Total Ratings <strong style={{ color: C.text }}>{loading ? '—' : totalReviews}</strong></span>
              <span>•</span>
              <span>Quality Score = <strong style={{ color: qualityScore !== null ? zone.color : C.text }}>
                {loading ? '—' : qualityScore !== null ? `${qualityScore}/100` : 'N/A'}
              </strong></span>
            </div>

            {/* Loading shimmer */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
                <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '60%', margin: '0 auto 10px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '40%', margin: '0 auto', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : qualityScore === null ? (
              /* No score empty state — your original design */
              <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.35 }}>⭐</div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: C.sub, margin: '0 0 4px' }}>No score available</p>
                <p style={{ fontSize: '12px', color: C.light, margin: 0 }}>
                  {totalReviews === 0 ? "You don't have any ratings yet." : "You need at least 3 ratings for a score."}
                </p>
              </div>
            ) : (
              /* Score WITH rating breakdown bars — NEW */
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
                {/* Big score circle */}
                <div style={{
                  width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
                  background: zone.bg, border: `3px solid ${zone.bar}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: zone.color, lineHeight: 1 }}>{qualityScore}</span>
                  <span style={{ fontSize: '10px', color: zone.color, fontWeight: '700' }}>/100</span>
                </div>
                {/* Breakdown bars */}
                <div style={{ flex: 1 }}>
                  {breakdown.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: C.sub, width: '28px', textAlign: 'right', flexShrink: 0 }}>{star}★</span>
                      <div style={{ flex: 1, height: '7px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: '4px',
                          background: star >= 4 ? '#22C55E' : star === 3 ? '#FBBF24' : '#EF4444',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: C.light, width: '20px', flexShrink: 0 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zone indicator — shown when there are reviews */}
            {!loading && totalReviews > 0 && (
              <div style={{
                marginBottom: '12px', padding: '8px 14px', borderRadius: '8px',
                background: zone.bg, border: `1px solid ${zone.bar}`,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '14px' }}>
                  {zone.label === 'Green' ? '✅' : zone.label === 'Yellow' ? '⚠️' : zone.label === 'Red' ? '🔴' : '🚫'}
                </span>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: zone.color }}>
                  You are in the <strong>{zone.label}</strong> zone — {badPercent.toFixed(1)}% of ratings are 1–2 star
                </p>
              </div>
            )}

            {/* Score band bar — your original design, unchanged */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', marginBottom: '6px' }}>
                {scoreColors.map(({ views, color, barBg }) => (
                  <div key={views} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color, background: `${barBg}22`, padding: '2px 6px', borderRadius: '999px' }}>
                      {views}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', height: '10px', borderRadius: '999px', overflow: 'hidden', gap: '2px' }}>
                {scoreColors.map(({ barBg, label }) => (
                  <div key={label} style={{ flex: 1, background: barBg }} />
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: '10px' }}>
                {scoreColors.map(({ label, range, color }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color, margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: C.light, margin: 0 }}>{range}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Top Customer Feedback — NOW REAL DATA ── */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 16px', color: C.text }}>Top Customer Feedback</h2>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1,2,3].map(i => <div key={i} style={{ height: '60px', background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : topFeedback.length === 0 ? (
              /* Your original empty state */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.3 }}>📋</div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: C.sub, margin: '0 0 4px' }}>No feedback available</p>
                <p style={{ fontSize: '12px', color: C.light, margin: 0, textAlign: 'center', lineHeight: '1.6' }}>
                  Great work! Continue listing good quality products
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topFeedback.map((r, i) => (
                  <div key={r._id || i} style={{
                    padding: '10px 12px', borderRadius: '8px',
                    background: r.rating <= 2 ? '#FEF2F2' : '#F9FAFB',
                    border: `1px solid ${r.rating <= 2 ? '#FECACA' : '#E5E7EB'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <Stars rating={r.rating} />
                      <span style={{ fontSize: '10px', color: C.light }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                      </span>
                    </div>
                    {r.comment && (
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#374151', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{r.comment}"
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: '11px', color: C.sub, fontWeight: '600' }}>
                      — {r.buyer?.name || 'Anonymous'}
                    </p>
                    {r.product?.title && (
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: C.light, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📦 {r.product.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Quality Recommendations — NOW REAL DATA ── */}
        <Card style={{ padding: '0' }}>
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: C.text }}>Quality Recommendations</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: C.light }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search By Style / SKU / Catalog ID"
                  style={{ paddingLeft: '30px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '12px', outline: 'none', width: '230px', color: C.text, background: 'white' }}
                />
              </div>
              <button style={{ fontSize: '12px', fontWeight: '600', color: C.purple, background: '#F5F0FF', border: `1px solid #DDD6FE`, borderRadius: '6px', padding: '8px 14px', cursor: 'pointer' }}>
                View Blocked Products ↗
              </button>
            </div>
          </div>

          {/* Tabs — count updates dynamically */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginTop: '16px', paddingLeft: '24px' }}>
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                style={{
                  padding: '10px 18px', fontSize: '13px',
                  fontWeight: activeTab === i ? '700' : '500',
                  color: activeTab === i ? C.purple : C.sub,
                  borderBottom: activeTab === i ? `2px solid ${C.purple}` : '2px solid transparent',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s', marginBottom: '-1px',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 100px', borderBottom: `1px solid ${C.border}`, padding: '10px 24px', background: '#FAFAFA' }}>
            {['Product Details and Quality Score', 'Top Customer Feedback\nfrom 1 & 2 star ratings', 'Product Listing Improvements', 'Action'].map((col, i) => (
              <div key={i} style={{ fontSize: '12px', fontWeight: '700', color: C.sub, whiteSpace: 'pre-line', lineHeight: '1.4' }}>{col}</div>
            ))}
          </div>

          {/* Table body — REAL products with bad reviews */}
          {loading ? (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2].map(i => <div key={i} style={{ height: '72px', background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : activeTab === 1 && badProducts.length > 0 ? (
            badProducts.map(({ product, reviews: pReviews }) => {
              const worst    = pReviews[0]
              const pAvg     = pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length
              const pZone    = getZone((pReviews.length / Math.max(totalReviews, 1)) * 100)
              return (
                <div key={product._id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 100px', gap: '12px', padding: '14px 24px', borderBottom: `1px solid #F9FAFB`, alignItems: 'start' }}>
                  {/* Product info */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: C.text, lineHeight: 1.3 }}>
                        {product.title || 'Unknown Product'}
                      </p>
                      <Stars rating={Math.round(pAvg)} />
                      <span style={{ marginTop: '4px', display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: pZone.bg, color: pZone.color }}>
                        {pZone.label} zone
                      </span>
                    </div>
                  </div>
                  {/* Worst review */}
                  <div>
                    {worst?.comment
                      ? <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#374151', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{worst.comment}"</p>
                      : <p style={{ margin: 0, fontSize: '12px', color: C.light }}>No comment</p>}
                    <p style={{ margin: 0, fontSize: '11px', color: C.sub }}>— {worst?.buyer?.name || 'Anonymous'}</p>
                  </div>
                  {/* Improvement tips */}
                  <div style={{ fontSize: '12px', color: C.sub, lineHeight: 1.6 }}>
                    {pAvg <= 2 ? '📸 Improve product images\n📝 Update description' : '📦 Check packaging quality'}
                  </div>
                  {/* Action */}
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626' }}>
                      ⚠ Fix Quality
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            /* Empty state — your original design */
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.25 }}>📦</div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: C.sub, margin: '0 0 6px' }}>No products here</p>
              <p style={{ fontSize: '13px', color: C.light, margin: '0 0 20px' }}>
                {activeTab === 1 ? "You're doing great! No quality issues found." : 'Nothing to show for this tab.'}
              </p>
              <button onClick={() => navigate('/seller/products')}
                style={{ padding: '10px 22px', background: `linear-gradient(135deg,${C.purple},${C.pink})`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                View All Products →
              </button>
            </div>
          )}
        </Card>

        {/* Tips card — your original, unchanged */}
        <Card style={{ background: 'linear-gradient(135deg,#F5F0FF,#FDF0F8)', border: `1px solid #DDD6FE` }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: C.purple, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 16px' }}>
            💡 Tips to Improve Quality Score
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: '📸', tip: 'Use high-resolution product images with white background' },
              { icon: '📝', tip: 'Write accurate & detailed product descriptions' },
              { icon: '📦', tip: 'Pack products securely to avoid damage in transit' },
              { icon: '↩️', tip: 'Resolve return requests quickly to maintain trust' },
            ].map(({ icon, tip }) => (
              <div key={tip} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                <p style={{ fontSize: '12px', color: C.sub, margin: 0, lineHeight: '1.6' }}>{tip}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  )
}