// ─────────────────────────────────────────────────────────────
//  NavbarEnhancements.jsx
//  Drop-in replacement for the Navbar + Search section of BuyerHomePage
//
//  What's new:
//  1. MEGA MENU — hovering Men/Women/Kids/Jewellery shows a Meesho-style
//     mega dropdown that mirrors your seed.js category tree (Levels 2→3→4)
//  2. ENHANCED SEARCH — focus shows a panel with Recent Searches + Popular
//     Searches (pill chips), matching Meesho's UX exactly.
//
//  Integration steps:
//  ① Copy the MEGA_MENU_DATA constant below into BuyerHomePage.jsx
//     (it mirrors your seed.js Level 2 / Level 3 structure).
//  ② Replace the <nav>…</nav> block with <Navbar … /> using props listed.
//  ③ The MegaMenu and SearchDropdown components live here — import them or
//     paste them into the same file.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const f = 'Poppins, sans-serif'

// ─── Mirrors your seed.js Level 2 (Item Types) → Level 3 (Sub Item Types) ─────
// Adjust names to exactly match what's in your Category collection if needed.
export const MEGA_MENU_DATA = {
  men: {
    columns: [
      {
        heading: 'Top Wear',
        slug: 'men-western',
        items: ['Summer T-Shirts', 'Polo T-Shirts', 'Oversized T-Shirts', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Hoodies'],
      },
      {
        heading: 'Bottom Wear',
        slug: 'men-western',
        items: ['Slim Fit Jeans', 'Regular Fit Jeans', 'Cargo Pants', 'Formal Trousers', 'Chinos', 'Shorts'],
      },
      {
        heading: 'Ethnic Wear',
        slug: 'men-ethnic',
        items: ['Kurtas', 'Kurta Sets', 'Sherwanis', 'Sherwani Sets', 'Nehru Jackets', 'Pathani Suits', 'Dhotis & Mundus'],
      },
      {
        heading: 'Innerwear',
        slug: 'men-innerwear',
        items: ['Briefs', 'Trunks', 'Boxers', 'Vests', 'Thermal Tops', 'Socks'],
      },
      {
        heading: 'Sports Wear',
        slug: 'men-sports',
        items: ['Sports T-Shirts', 'Track Pants', 'Tracksuit Sets', 'Gym Shorts', 'Gym Vests', 'Compression Tops'],
      },
      {
        heading: 'Night Wear',
        slug: 'men-western',
        items: ['Lounge Pants', 'Night Shorts', 'Night Suits'],
      },
      {
        heading: 'Accessories',
        slug: 'men-accessories',
        items: ['Backpacks', 'Wallets', 'Sunglasses', 'Caps & Hats', 'Formal Belts', 'Casual Belts'],
      },
      {
        heading: 'Footwear',
        slug: 'men-shoes',
        items: ['Sneakers', 'Loafers', 'Running Shoes', 'Formal Shoes', 'Sandals', 'Flip-Flops', 'Ankle Boots'],
      },
    ],
  },
  women: {
    columns: [
      {
        heading: 'Kurti, Saree & Lehenga',
        slug: 'women-ethnic',
        items: ['Kurtis', 'Kurti Sets', 'Sarees', 'Ready to Wear Sarees', 'Lehenga Cholis', 'Chaniya Cholis', 'Blouses'],
      },
      {
        heading: 'Women Western',
        slug: 'women-western',
        items: ['Casual Tops', 'Crop Tops', 'T-Shirts', 'Casual Dresses', 'Maxi Dresses', 'Jeans', 'Jeggings', 'Palazzos'],
      },
      {
        heading: 'Suits & Dress Material',
        slug: 'women-ethnic',
        items: ['Salwar Suits', 'Anarkali Suits', 'Churidar Suits', 'Patiala Suits', 'Dress Material'],
      },
      {
        heading: 'Lingerie',
        slug: 'women-innerwear',
        items: ['T-Shirt Bras', 'Sports Bras', 'Padded Bras', 'Panties', 'Shapewear', 'Camisoles'],
      },
      {
        heading: 'Ethnic Bottomwear',
        slug: 'women-ethnic',
        items: ['Palazzos', 'Churidars', 'Sharara', 'Salwars', 'Dupattas', 'Stoles'],
      },
      {
        heading: 'Night Wear',
        slug: 'women-nightwear',
        items: ['Pyjama Sets', 'Nightgowns', 'Robes', 'Shorts Sets', 'Shirt & Pyjama Sets'],
      },
      {
        heading: 'Accessories',
        slug: 'women-accessories',
        items: ['Handbags', 'Clutches', 'Tote Bags', 'Sunglasses', 'Hair Clips', 'Scrunchies', 'Scarves'],
      },
      {
        heading: 'Footwear',
        slug: 'women-shoes',
        items: ['Stilettos', 'Ballerinas', 'Flat Sandals', 'Running Shoes', 'Juttis & Mojaris', 'Kolhapuris', 'Ankle Boots'],
      },
    ],
  },
  kids: {
    columns: [
      {
        heading: 'Boys Clothing',
        slug: 'kids-clothing',
        items: ['T-Shirts', 'Shirts', 'Jeans & Trousers', 'Shorts', 'Ethnic Wear', 'Sets'],
      },
      {
        heading: 'Girls Clothing',
        slug: 'kids-clothing',
        items: ['Frocks & Dresses', 'Tops', 'Leggings & Jeans', 'Ethnic Wear', 'Sets'],
      },
      {
        heading: 'Baby Clothing',
        slug: 'kids-clothing',
        items: ['Bodysuits', 'Rompers', 'Clothing Sets', 'Sleepsuits'],
      },
      {
        heading: 'Party Wear',
        slug: 'kids-clothing',
        items: ['Boys Party Wear', 'Girls Party Wear', 'Ethnic Party Sets'],
      },
      {
        heading: 'Footwear',
        slug: 'kids-shoes',
        items: ['Boys Sneakers', 'Girls Sneakers', 'School Shoes', 'Sandals', 'Baby Booties'],
      },
      {
        heading: 'Innerwear',
        slug: 'kids-clothing',
        items: ['Boys Briefs & Vests', 'Girls Panties', 'Boys Socks', 'Girls Socks'],
      },
    ],
  },
  jewellery: {
    columns: [
      {
        heading: 'Necklaces',
        slug: 'women-jewellery',
        items: ['Gold Necklaces', 'Silver Necklaces', 'Chokers', 'Pendant Necklaces', 'Mangalsutra'],
      },
      {
        heading: 'Earrings',
        slug: 'women-jewellery',
        items: ['Stud Earrings', 'Drop Earrings', 'Jhumkas', 'Hoop Earrings'],
      },
      {
        heading: 'Bangles & Bracelets',
        slug: 'women-jewellery',
        items: ['Bangles', 'Bracelets', 'Kadas', 'Gold Rings', 'Silver Rings'],
      },
      {
        heading: 'Sets & Combos',
        slug: 'women-jewellery',
        items: ['Jewellery Sets', 'Bridal Sets', 'Maang Tikka', 'Nose Pins', 'Anklets'],
      },
      {
        heading: "Men's Jewellery",
        slug: 'men-jewellery',
        items: ['Chains', 'Pendants', 'Bracelets', 'Gold Rings', 'Silver Rings'],
      },
    ],
  },
}

// ─── Popular search terms (you can make this dynamic from your API) ───────────
const POPULAR_SEARCHES = [
  'saree', 'short kurti', 'earring', 'kurti', 'tshirt',
  'kashmiri bangle', 'top for women', 'bangle', 'watch', 'kurti set',
  'shoes', 'top', 'slipper', 'water bottle',
]

// ─────────────────────────────────────────────────────────────────────────────
//  MegaMenu Component
// ─────────────────────────────────────────────────────────────────────────────
function MegaMenu({ catKey, onItemClick }) {
  const data = MEGA_MENU_DATA[catKey]
  if (!data) return null

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      borderTop: '3px solid #E91E8C',
      zIndex: 200,
      padding: '24px 40px 28px',
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(data.columns.length, 8)}, 1fr)`,
      gap: '0 24px',
      animation: 'megaFadeIn 0.18s ease',
    }}>
      {data.columns.map((col) => (
        <div key={col.heading}>
          <p style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#E91E8C',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 10px',
            fontFamily: f,
          }}>
            {col.heading}
          </p>
          {col.items.map((item) => (
            <p
              key={item}
              onClick={() => onItemClick && onItemClick(item, col.slug)}
              style={{
                fontSize: '13px',
                color: '#374151',
                margin: '0 0 8px',
                cursor: 'pointer',
                fontFamily: f,
                transition: 'color 0.12s',
                lineHeight: '1.4',
              }}
              onMouseEnter={e => e.target.style.color = '#E91E8C'}
              onMouseLeave={e => e.target.style.color = '#374151'}
            >
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SearchDropdown Component
// ─────────────────────────────────────────────────────────────────────────────
function SearchDropdown({ recentSearches, onSelect, onClearRecent }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      zIndex: 300,
      padding: '16px 20px 20px',
      fontFamily: f,
      animation: 'megaFadeIn 0.15s ease',
    }}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>
              Recent Searches
            </p>
            <button
              onClick={onClearRecent}
              style={{ fontSize: '11px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f }}
            >
              Clear
            </button>
          </div>
          {recentSearches.slice(0, 5).map((term) => (
            <div
              key={term}
              onClick={() => onSelect(term)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 0',
                cursor: 'pointer',
                borderBottom: '1px solid #F1F5F9',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {/* Clock icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#374151' }}>{term}</span>
            </div>
          ))}
        </div>
      )}

      {/* Popular Searches */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 12px' }}>
          Popular Searches
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => onSelect(term)}
              style={{
                fontSize: '12px',
                fontWeight: '500',
                padding: '6px 14px',
                background: '#F3F4F6',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: f,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FCE7F3'
                e.currentTarget.style.borderColor = '#E91E8C'
                e.currentTarget.style.color = '#E91E8C'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F3F4F6'
                e.currentTarget.style.borderColor = '#E5E7EB'
                e.currentTarget.style.color = '#374151'
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EnhancedNavbar — drop-in replacement for your current <nav>
//
//  Props:
//    category, setCategory  — same as parent state
//    search, setSearch       — same as parent state
//    user, logout, navigate  — pass through
//    cartCount, wishlistCount
//    CATS                    — pass your existing CATS array
//    Logo                    — pass your existing Logo component
// ─────────────────────────────────────────────────────────────────────────────
export function EnhancedNavbar({
  category, setCategory, search, setSearch,
  user, logout, navigate, cartCount, wishlistCount,
  CATS, Logo,
}) {
  const [activeMenu, setActiveMenu]       = useState(null)   // which cat key has mega menu open
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stylehub_recent') || '[]') } catch { return [] }
  })
  const menuTimeoutRef = useRef(null)
  const searchRef      = useRef(null)

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem('stylehub_recent', JSON.stringify(recentSearches))
  }, [recentSearches])

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCatEnter = (key) => {
    clearTimeout(menuTimeoutRef.current)
    if (MEGA_MENU_DATA[key]) setActiveMenu(key)
    else setActiveMenu(null)
  }

  const handleNavLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 180)
  }

  const handleMegaEnter = () => clearTimeout(menuTimeoutRef.current)
  const handleMegaLeave = () => { menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 180) }

  const handleSearchSelect = (term) => {
    setSearch(term)
    setSearchFocused(false)
    setRecentSearches(prev => [term, ...prev.filter(t => t !== term)].slice(0, 8))
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      setRecentSearches(prev => [search.trim(), ...prev.filter(t => t !== search.trim())].slice(0, 8))
      setSearchFocused(false)
    }
  }

  const handleMegaItemClick = (itemName, slug) => {
    setActiveMenu(null)
    // Map slug prefix to your category key
    const catMap = { men: 'men', women: 'women', kids: 'kids' }
    const prefix = slug.split('-')[0]
    if (catMap[prefix]) setCategory(catMap[prefix])
    setSearch(itemName)
  }

  // Has mega menu for this category?
  const hasMega = (key) => !!MEGA_MENU_DATA[key]

  return (
    <>
      <style>{`
        @keyframes megaFadeIn {
          from { opacity:0; transform:translateY(-6px) }
          to   { opacity:1; transform:translateY(0) }
        }
      `}</style>

      <nav
        onMouseLeave={handleNavLeave}
        style={{
          background: 'white',
          padding: '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{ display:'flex',alignItems:'center',gap:'10px',flexShrink:0,cursor:'pointer' }}
          onClick={() => navigate('/home')}
        >
          <Logo size={38} />
          <div>
            <p style={{
              fontWeight:'900',fontSize:'16px',margin:0,lineHeight:1,
              background:'linear-gradient(135deg,#E91E8C,#7C3AED)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
            }}>StyleHub</p>
            <p style={{ fontSize:'8px',color:'#94A3B8',margin:0,letterSpacing:'2.5px',textTransform:'uppercase',fontWeight:'600' }}>
              Fashion Store
            </p>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display:'flex',gap:'24px',alignItems:'center',height:'64px',position:'relative' }}>
          {CATS.map(c => (
            <div
              key={c.key}
              onMouseEnter={() => handleCatEnter(c.key)}
              style={{ height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}
            >
              <button
                onClick={() => { setCategory(c.key); setActiveMenu(null) }}
                style={{
                  padding: '0 2px',
                  background: 'none',
                  border: 'none',
                  borderBottom: category === c.key ? '3px solid #E91E8C' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: f,
                  fontWeight: '700',
                  color: category === c.key ? '#E91E8C' : '#282C3F',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  height: '100%',
                  borderRadius: 0,
                  transition: 'color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={e => { if (category !== c.key) e.currentTarget.style.color = '#E91E8C' }}
                onMouseLeave={e => { if (category !== c.key) e.currentTarget.style.color = '#282C3F' }}
              >
                <span style={{ fontSize: '13px' }}>{c.icon}</span>
                {c.label}
                {hasMega(c.key) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: '2px', opacity: 0.5 }}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          ))}

          {/* Mega Menu — rendered relative to the nav tabs row */}
          {activeMenu && (
            <div
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
              style={{ position: 'fixed', top: '64px', left: 0, right: 0 }}
            >
              <MegaMenu catKey={activeMenu} onItemClick={handleMegaItemClick} />
            </div>
          )}
        </div>

        {/* Search */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: '310px', margin: '0 20px', position: 'relative' }}>
          <span style={{ position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',fontSize:'14px',color:'#94A3B8',pointerEvents:'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Saree, Kurti or Search by Product"
            style={{
              width: '100%',
              padding: '10px 16px 10px 38px',
              border: '1px solid #D4D5D9',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
              background: searchFocused ? 'white' : '#F5F5F6',
              fontFamily: f,
              boxSizing: 'border-box',
              color: '#282C3F',
              transition: 'border 0.2s,background 0.2s',
              borderColor: searchFocused ? '#E91E8C' : '#D4D5D9',
            }}
          />
          {searchFocused && (
            <SearchDropdown
              recentSearches={recentSearches}
              onSelect={handleSearchSelect}
              onClearRecent={() => {
                setRecentSearches([])
                localStorage.removeItem('stylehub_recent')
              }}
            />
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex',alignItems:'center',gap:'18px',flexShrink:0 }}>
          {user ? (
            <>
              {[
                {
                  label: 'Orders',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <path d="M9 12h6M9 16h4"/>
                    </svg>
                  ),
                  path: '/orders', badge: null,
                },
                {
                  label: 'Wishlist',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  ),
                  path: '/wishlist', badge: wishlistCount,
                },
                {
                  label: 'Bag',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                  ),
                  path: '/cart', badge: cartCount,
                },
                {
                  label: 'Profile',
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  ),
                  path: '/profile', badge: null,
                },
              ].map(nav => (
                <button
                  key={nav.label}
                  onClick={() => navigate(nav.path)}
                  style={{ position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',background:'none',border:'none',cursor:'pointer',fontFamily:f,padding:0 }}
                >
                  {nav.icon}
                  {nav.badge > 0 && (
                    <span style={{ position:'absolute',top:'-4px',right:'-6px',background:'#E91E8C',color:'white',width:'16px',height:'16px',borderRadius:'50%',fontSize:'9px',fontWeight:'800',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {nav.badge}
                    </span>
                  )}
                  <span style={{ fontSize:'11px',fontWeight:'700',color:'#282C3F' }}>{nav.label}</span>
                </button>
              ))}
              <button
                onClick={() => { logout(); navigate('/') }}
                style={{ fontSize:'11px',fontWeight:'700',color:'#DC2626',background:'none',border:'none',cursor:'pointer',fontFamily:f,letterSpacing:'0.3px',textTransform:'uppercase',padding:0 }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{ fontSize:'13px',padding:'8px 20px',background:'white',color:'#E91E8C',border:'2px solid #E91E8C',borderRadius:'4px',cursor:'pointer',fontFamily:f,fontWeight:'700',letterSpacing:'0.5px',textTransform:'uppercase' }}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup/buyer')}
                style={{ fontSize:'13px',padding:'8px 20px',background:'linear-gradient(135deg,#E91E8C,#7C3AED)',color:'white',border:'none',borderRadius:'4px',cursor:'pointer',fontFamily:f,fontWeight:'700',letterSpacing:'0.5px',textTransform:'uppercase' }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOW TO INTEGRATE INTO BuyerHomePage.jsx
   ─────────────────────────────────────────────────────────────────────────────

   Step 1 — Import at the top of BuyerHomePage.jsx:
   ─────────────────────────────────────────────────
   import { EnhancedNavbar } from './NavbarEnhancements'
   // (adjust path as needed)

   Step 2 — Find and replace the entire <nav>…</nav> block with:
   ─────────────────────────────────────────────────────────────
   <EnhancedNavbar
     category={category}
     setCategory={setCategory}
     search={search}
     setSearch={setSearch}
     user={user}
     logout={logout}
     navigate={navigate}
     cartCount={cartCount}
     wishlistCount={wishlistCount}
     CATS={CATS}
     Logo={Logo}
   />

   That's it! The mega menu and search dropdown are fully self-contained.

   Step 3 (optional) — To fetch actual category names from your API instead of
   the static MEGA_MENU_DATA, call your /categories endpoint on mount and build
   the columns dynamically from the Level 2/3/4 data returned.
   ─────────────────────────────────────────────────────────────────────────────
*/