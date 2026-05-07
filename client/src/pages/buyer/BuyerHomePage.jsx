import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import api from '../../api/axiosInstance.js'
import useCartStore from '../../context/useCartStore.js'
import useWishlistStore from '../../context/useWishlistStore.js'  // ✅ ADDED

const f = 'Poppins, sans-serif'

const BANNERS = [
  {
    bg: '#FF3F6C', textColor: '#fff', tag: 'fwd',
    tagStyle: { fontStyle: 'italic', fontWeight: '900', fontSize: '72px', letterSpacing: '-3px', opacity: 0.22, position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', lineHeight: 1 },
    heading: 'JEANS &\nTROUSERS', sub: 'Straight fit, skinny fit & more', label: 'UNDER', price: '₹599', cta: 'SHOP NOW >', pattern: 'stripes', emoji: null,
  },
  {
    bg: 'linear-gradient(110deg,#1A237E 0%,#283593 40%,#1976D2 100%)', textColor: '#fff', tag: null,
    heading: "MEN'S\nCOLLECTION", sub: 'T-Shirts, Jeans, Formals & more', label: 'STARTING AT', price: '₹399', cta: 'EXPLORE NOW >', pattern: 'dots', emoji: null,
  },
  {
    bg: 'linear-gradient(110deg,#004D40 0%,#00796B 50%,#26A69A 100%)', textColor: '#fff', tag: null,
    heading: "EXTRA 30%\nOFF", sub: "On your 1st order", label: 'USE CODE', price: 'NEW30', cta: 'GRAB DEAL >', pattern: 'circles', emoji: null,
  },
]

const BRANDS = {
  '': [
    { name: 'Levis', color: '#c41230', bg: '#fff0f3' }, { name: 'H&M', color: '#e50010', bg: '#fff5f5' },
    { name: 'Zara', color: '#000', bg: '#f5f5f5' }, { name: 'FabIndia', color: '#b45309', bg: '#fffbeb' },
    { name: 'Manyavar', color: '#7c3aed', bg: '#f5f3ff' }, { name: 'W', color: '#be123c', bg: '#fff1f2' },
    { name: 'Puma', color: '#1d4ed8', bg: '#eff6ff' }, { name: 'Nike', color: '#111', bg: '#f8f8f8' },
  ],
  men: [
    { name: 'Levis', color: '#c41230', bg: '#fff0f3' }, { name: 'Arrow', color: '#1e40af', bg: '#eff6ff' },
    { name: 'Peter England', color: '#15803d', bg: '#f0fdf4' }, { name: 'Van Heusen', color: '#6d28d9', bg: '#f5f3ff' },
    { name: 'Allen Solly', color: '#b45309', bg: '#fffbeb' }, { name: 'US Polo', color: '#1d4ed8', bg: '#eff6ff' },
    { name: 'Raymond', color: '#111', bg: '#f5f5f5' }, { name: 'Puma', color: '#dc2626', bg: '#fef2f2' },
  ],
  women: [
    { name: 'W', color: '#be123c', bg: '#fff1f2' }, { name: 'Biba', color: '#9333ea', bg: '#faf5ff' },
    { name: 'FabIndia', color: '#b45309', bg: '#fffbeb' }, { name: 'Aurelia', color: '#0f766e', bg: '#f0fdfa' },
    { name: 'Global Desi', color: '#e91e8c', bg: '#fdf2f8' }, { name: 'Libas', color: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Sangria', color: '#c2410c', bg: '#fff7ed' }, { name: 'Anouk', color: '#1d4ed8', bg: '#eff6ff' },
  ],
  kids: [
    { name: 'Allen Solly Jr', color: '#b45309', bg: '#fffbeb' }, { name: 'UCB Kids', color: '#15803d', bg: '#f0fdf4' },
    { name: 'Nautica Kids', color: '#1d4ed8', bg: '#eff6ff' }, { name: 'US Polo Kids', color: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Mini Klub', color: '#0f766e', bg: '#f0fdfa' }, { name: 'Peppermint', color: '#db2777', bg: '#fdf2f8' },
    { name: 'Gini & Jony', color: '#dc2626', bg: '#fef2f2' }, { name: 'YK', color: '#1e3a8a', bg: '#eff6ff' },
  ],
}

const SUB_CATS = {
  '':    ['T-Shirts', 'Shirts', 'Jeans', 'Kurtis', 'Sarees', 'Dresses', 'Jackets', 'Sneakers', 'Watches', 'Jewellery'],
  men:   ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Kurtas', 'Jackets', 'Ethnic Wear', 'Formal Shirts'],
  women: ['Kurtis', 'Sarees', 'Tops', 'Dresses', 'Leggings', 'Ethnic Wear', 'Jeans', 'Kurta Sets'],
  kids:  ['Boys Clothing', 'Girls Clothing', 'Baby Clothing', 'School Uniform', 'Party Wear', 'Winterwear'],
}

const COLORS = [
  { name: 'Pink', hex: '#ec4899' }, { name: 'Blue', hex: '#3b82f6' }, { name: 'Black', hex: '#111111' },
  { name: 'Green', hex: '#22c55e' }, { name: 'Purple', hex: '#a855f7' }, { name: 'Red', hex: '#ef4444' },
  { name: 'White', hex: '#f1f5f9', border: true }, { name: 'Yellow', hex: '#eab308' },
]

const DISCOUNT_OPTIONS = ['10% and above', '20% and above', '30% and above', '40% and above', '50% and above', '60% and above', '70% and above']

function BannerPattern({ type }) {
  if (type === 'stripes') return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 28px)` }} />
  if (type === 'dots') return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />
  if (type === 'circles') return (
    <>
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', border: '60px solid rgba(255,255,255,0.06)', right: '-60px', top: '-80px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '40px solid rgba(255,255,255,0.08)', left: '10%', bottom: '-60px', pointerEvents: 'none' }} />
    </>
  )
  return null
}

export default function BuyerHomePage() {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()
  const { items }        = useCartStore()

  // ✅ ADDED: Wishlist store
  const { toggleItem, isWishlisted, items: wishlistItems } = useWishlistStore()

  const [products,         setProducts]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [category,         setCategory]         = useState('')
  const [search,           setSearch]           = useState('')
  const [bannerIdx,        setBannerIdx]        = useState(0)
  const [selectedSubs,     setSelectedSubs]     = useState([])
  const [selectedBrands,   setSelectedBrands]   = useState([])
  const [selectedColors,   setSelectedColors]   = useState([])
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [priceRange,       setPriceRange]       = useState([100, 10000])
  const [showMoreBrands,   setShowMoreBrands]   = useState(false)
  const [showAllSubcats,   setShowAllSubcats]   = useState(false)

  const cartCount     = items.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlistItems.length  // ✅ ADDED
  const currentBrands = BRANDS[category] || BRANDS['']
  const currentSubs   = SUB_CATS[category] || SUB_CATS['']

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setSelectedSubs([]); setSelectedBrands([]); setSelectedColors([]); setSelectedDiscount(''); setShowMoreBrands(false)
  }, [category])

  useEffect(() => {
    setLoading(true)
    api.get('/products', { params: { limit: 20, status: 'active', category: category || undefined, search: search || undefined } })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, search])

  const toggleSub   = (s) => setSelectedSubs(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  const toggleBrand = (b) => setSelectedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])
  const toggleColor = (c) => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const hasActiveFilters = selectedSubs.length || selectedBrands.length || selectedColors.length || selectedDiscount
  const clearFilters = () => { setSelectedSubs([]); setSelectedBrands([]); setSelectedColors([]); setSelectedDiscount('') }

  // ✅ ADDED: Heart click handler
  const handleHeartClick = (e, product) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    toggleItem(product)
  }

  const banner            = BANNERS[bannerIdx]
  const displayedBrandNames = showMoreBrands ? currentBrands : currentBrands.slice(0, 6)
  const displayedSubs     = showAllSubcats ? currentSubs : currentSubs.slice(0, 6)
  const cats = [{ key: '', label: 'All' }, { key: 'men', label: 'Men' }, { key: 'women', label: 'Women' }, { key: 'kids', label: 'Kids' }]

  const filteredProducts = products.filter(p => {
    if (selectedSubs.length && !selectedSubs.includes(p.subCategory)) return false
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false
    if (selectedDiscount) {
      const minDisc = parseInt(selectedDiscount)
      const disc = p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0
      if (disc < minDisc) return false
    }
    if (p.sellingPrice < priceRange[0] || p.sellingPrice > priceRange[1]) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', fontFamily: f }}>

      {/* ── Navbar ── */}
      <nav style={{ background: 'white', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(233,30,140,0.3)' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>S</span>
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '15px', color: '#E91E8C', margin: 0, lineHeight: 1 }}>Style<span style={{ color: '#7C3AED' }}>Hub</span></p>
            <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Fashion Store</p>
          </div>
        </div>

        {/* Category links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', height: '64px' }}>
          {cats.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              style={{ padding: '0', background: 'none', border: 'none', borderBottom: category === c.key ? '3px solid #E91E8C' : '3px solid transparent', cursor: 'pointer', fontSize: '13px', fontFamily: f, fontWeight: '700', color: category === c.key ? '#E91E8C' : '#282C3F', textTransform: 'uppercase', letterSpacing: '0.5px', height: '100%', borderRadius: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => { if (category !== c.key) e.currentTarget.style.color = '#E91E8C' }}
              onMouseLeave={e => { if (category !== c.key) e.currentTarget.style.color = '#282C3F' }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '360px', margin: '0 32px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#94A3B8', pointerEvents: 'none' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for products, brands and more"
            style={{ width: '100%', padding: '10px 16px 10px 38px', border: '1px solid #D4D5D9', borderRadius: '4px', fontSize: '12px', outline: 'none', background: '#F5F5F6', fontFamily: f, boxSizing: 'border-box', color: '#282C3F', transition: 'border 0.2s, background 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#E91E8C'; e.target.style.background = 'white' }}
            onBlur={e => { e.target.style.borderColor = '#D4D5D9'; e.target.style.background = '#F5F5F6' }} />
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          {user ? (
            <>
              {/* Orders */}
              <button onClick={() => navigate('/orders')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Orders</span>
              </button>

              {/* ✅ Wishlist with badge */}
              <button onClick={() => navigate('/wishlist')} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {wishlistCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wishlistCount}
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Wishlist</span>
              </button>

              {/* Bag with badge */}
              <button onClick={() => navigate('/cart')} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount}
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Bag</span>
              </button>

              {/* Profile */}
              <button onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Profile</span>
              </button>

              {/* Logout */}
              <button onClick={() => { logout(); navigate('/') }}
                style={{ fontSize: '11px', fontWeight: '700', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, letterSpacing: '0.3px', textTransform: 'uppercase', padding: 0 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ fontSize: '13px', padding: '8px 20px', background: 'white', color: '#E91E8C', border: '2px solid #E91E8C', borderRadius: '4px', cursor: 'pointer', fontFamily: f, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Login</button>
              <button onClick={() => navigate('/signup/buyer')} style={{ fontSize: '13px', padding: '8px 20px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: f, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Banner ── */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', userSelect: 'none' }}>
        <div style={{ position: 'relative', height: '420px', background: banner.bg, transition: 'background 0.5s ease' }}>
          <BannerPattern type={banner.pattern} />
          {banner.tag && (
            <div style={{ position: 'absolute', left: '48px', top: '50%', transform: 'translateY(-50%)', fontStyle: 'italic', fontWeight: '900', fontSize: '140px', letterSpacing: '-6px', lineHeight: 1, color: 'rgba(0,0,0,0.12)', pointerEvents: 'none', fontFamily: '"Georgia", serif' }}>
              {banner.tag}
            </div>
          )}
          <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', textAlign: 'center', color: banner.textColor }}>
            <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: 1.05, margin: '0 0 10px', letterSpacing: '-1px', textTransform: 'uppercase', whiteSpace: 'pre-line', textShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>{banner.heading}</h1>
            <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 18px', opacity: 0.92 }}>{banner.sub}</p>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px', opacity: 0.85 }}>{banner.label}</p>
              <p style={{ fontSize: '52px', fontWeight: '900', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>{banner.price}</p>
            </div>
            <button style={{ padding: '14px 36px', background: banner.bg === '#FF3F6C' ? '#111' : 'white', color: banner.bg === '#FF3F6C' ? 'white' : '#111', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: f, letterSpacing: '1px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s' }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}>
              {banner.cta}
            </button>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
            {BANNERS.map((_, i) => <button key={i} onClick={() => setBannerIdx(i)} style={{ width: bannerIdx === i ? '28px' : '8px', height: '8px', borderRadius: '4px', background: bannerIdx === i ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />)}
          </div>
          {[{ dir: -1, side: 'left' }, { dir: 1, side: 'right' }].map(({ dir, side }) => (
            <button key={side} onClick={() => setBannerIdx(i => (i + dir + BANNERS.length) % BANNERS.length)}
              style={{ position: 'absolute', top: '50%', [side]: '20px', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', fontSize: '18px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', zIndex: 2 }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.32)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.18)'}>
              {dir === -1 ? '‹' : '›'}
            </button>
          ))}
        </div>

        {/* Promo strips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ background: 'linear-gradient(110deg,#004D40,#00897B)', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div><span style={{ color: 'white', fontSize: '22px', fontWeight: '900' }}>EXTRA 30% OFF</span><span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginTop: '2px' }}>On your 1st order</span></div>
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '6px', padding: '10px 20px', textAlign: 'center' }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>USE CODE</span>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '900', letterSpacing: '2px' }}>NEW30</span>
            </div>
          </div>
          <div style={{ background: '#111', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div><span style={{ color: 'white', fontSize: '22px', fontWeight: '900', display: 'block' }}>📱 DOWNLOAD THE APP</span><span style={{ color: '#94A3B8', fontSize: '13px', display: 'block', marginTop: '2px' }}>Get exclusive app-only deals & alerts</span></div>
            <button style={{ padding: '10px 24px', background: 'white', color: '#111', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: f }}>GET APP →</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Brands */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ⭐ Favourite Brands
            {category && <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginLeft: '8px', textTransform: 'none', letterSpacing: 0 }}>— {category.charAt(0).toUpperCase() + category.slice(1)}'s top picks</span>}
          </h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {currentBrands.map((brand, i) => (
              <button key={i} onClick={() => toggleBrand(brand.name)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: selectedBrands.includes(brand.name) ? brand.color : brand.bg, border: `2.5px solid ${selectedBrands.includes(brand.name) ? brand.color : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selectedBrands.includes(brand.name) ? `0 4px 14px ${brand.color}44` : '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', padding: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', textAlign: 'center', lineHeight: '1.2', color: selectedBrands.includes(brand.name) ? 'white' : brand.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{brand.name}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#6B7280', whiteSpace: 'nowrap' }}>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Sidebar Filters */}
          <div style={{ width: '240px', flexShrink: 0, background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: '76px', maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1A2E', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>FILTERS</h3>
              {hasActiveFilters ? <button onClick={clearFilters} style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C', background: '#FDF2F8', border: 'none', borderRadius: '20px', padding: '4px 10px', cursor: 'pointer', fontFamily: f }}>Clear all</button> : null}
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>CATEGORIES</h4>
              {displayedSubs.map(s => (<label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}><input type="checkbox" checked={selectedSubs.includes(s)} onChange={() => toggleSub(s)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} /><span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedSubs.includes(s) ? '700' : '500' }}>{s}</span></label>))}
              {currentSubs.length > 6 && <button onClick={() => setShowAllSubcats(v => !v)} style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: '4px 0' }}>{showAllSubcats ? '− Less' : `+ ${currentSubs.length - 6} more`}</button>}
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>BRAND</h4>
              <div style={{ position: 'relative', marginBottom: '8px' }}><span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94A3B8' }}>🔍</span><input placeholder="Search brand" style={{ width: '100%', padding: '7px 10px 7px 28px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', fontFamily: f, outline: 'none', boxSizing: 'border-box', color: '#374151' }} /></div>
              {displayedBrandNames.map((brand, i) => (<label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}><input type="checkbox" checked={selectedBrands.includes(brand.name)} onChange={() => toggleBrand(brand.name)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} /><span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedBrands.includes(brand.name) ? '700' : '500' }}>{brand.name}</span></label>))}
              {currentBrands.length > 6 && <button onClick={() => setShowMoreBrands(v => !v)} style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: '4px 0' }}>{showMoreBrands ? '− Less' : `+ ${currentBrands.length - 6} more`}</button>}
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>PRICE</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>₹{priceRange[0].toLocaleString('en-IN')}</span><span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>₹{priceRange[1].toLocaleString('en-IN')}+</span></div>
              <input type="range" min="100" max="10000" step="100" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} style={{ width: '100%', accentColor: '#E91E8C' }} />
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>COLOR</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COLORS.map(c => <button key={c.name} title={c.name} onClick={() => toggleColor(c.name)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.hex, border: selectedColors.includes(c.name) ? '3px solid #E91E8C' : c.border ? '2px solid #D1D5DB' : '2px solid transparent', cursor: 'pointer', boxShadow: selectedColors.includes(c.name) ? '0 0 0 2px #FCE7F3' : 'none', transition: 'all 0.15s' }} />)}
              </div>
              {selectedColors.length > 0 && <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Selected: {selectedColors.join(', ')}</p>}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>DISCOUNT RANGE</h4>
              {DISCOUNT_OPTIONS.map(d => (<label key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}><input type="radio" name="discount" checked={selectedDiscount === d} onChange={() => setSelectedDiscount(prev => prev === d ? '' : d)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} /><span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedDiscount === d ? '700' : '500' }}>{d}</span></label>))}
            </div>
          </div>

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 2px' }}>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}'s Fashion` : '✨ All Products'}</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{filteredProducts.length} products{hasActiveFilters ? ' (filtered)' : ''}</p>
              </div>
              {hasActiveFilters > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {selectedSubs.map(s => <span key={s} onClick={() => toggleSub(s)} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#FCE7F3', color: '#E91E8C', borderRadius: '20px', cursor: 'pointer' }}>{s} ×</span>)}
                  {selectedBrands.map(b => <span key={b} onClick={() => toggleBrand(b)} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#F3F4F6', color: '#374151', borderRadius: '20px', cursor: 'pointer' }}>{b} ×</span>)}
                  {selectedDiscount && <span onClick={() => setSelectedDiscount('')} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#D1FAE5', color: '#16A34A', borderRadius: '20px', cursor: 'pointer' }}>{selectedDiscount} ×</span>}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '14px' }}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBF0' }}>
                    <div style={{ height: '210px', background: 'linear-gradient(90deg,#F1F5F9,#E2E8F0,#F1F5F9)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: '12px' }}><div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} /><div style={{ height: '12px', background: '#F1F5F9', borderRadius: '6px', width: '60%' }} /></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 8px' }}>No products found</h3>
                <p style={{ fontSize: '14px', margin: '0 0 16px' }}>Try adjusting your filters or search term</p>
                {hasActiveFilters && <button onClick={clearFilters} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: f }}>Clear Filters</button>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '14px' }}>
                {filteredProducts.map(product => {
                  const disc = product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
                  const wishlisted = isWishlisted(product._id)  // ✅ ADDED
                  return (
                    <div key={product._id}
                      onClick={() => user ? navigate(`/product/${product._id}`) : navigate('/login')}
                      style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #EBEBF0', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(233,30,140,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={product.images?.[0]} alt={product.title}
                          style={{ width: '100%', height: '210px', objectFit: 'cover', background: '#F8FAFC', display: 'block' }}
                          onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                        {disc > 0 && (
                          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px' }}>
                            {disc}% OFF
                          </span>
                        )}
                        {/* ✅ ADDED: Proper heart button with wishlist toggle */}
                        <button
                          onClick={(e) => handleHeartClick(e, product)}
                          style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'transform 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                          <svg width="16" height="16" viewBox="0 0 24 24"
                            fill={wishlisted ? '#E91E8C' : 'none'}
                            stroke={wishlisted ? '#E91E8C' : '#9CA3AF'}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </button>
                      </div>
                      <div style={{ padding: '12px' }}>
                        {product.brand && <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>{product.brand}</p>}
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>{product.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#1A1A2E' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                          {disc > 0 && <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                          {disc > 0 && <span style={{ fontSize: '10px', fontWeight: '700', color: '#16A34A' }}>{disc}% off</span>}
                        </div>
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0, textTransform: 'capitalize' }}>{product.category} · {product.subCategory}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #F9F9FB; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
      `}</style>
    </div>
  )
}