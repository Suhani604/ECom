import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'
import api from '../../api/axiosInstance.js'
import useCartStore from '../../context/useCartStore.js'
import useWishlistStore from '../../context/useWishlistStore.js'

const f = 'Poppins, sans-serif'

const MEGA_MENU_DATA = {
  men: [
    { heading: 'Top Wear',    items: ['Summer T-Shirts','Polo T-Shirts','Oversized T-Shirts','Casual Shirts','Formal Shirts','Sweatshirts','Hoodies','Zip-Up Hoodies'] },
    { heading: 'Bottom Wear', items: ['Slim Fit Jeans','Regular Fit Jeans','Skinny Jeans','Cargo Pants','Formal Trousers','Chinos','Shorts','Denim Shorts'] },
    { heading: 'Ethnic Wear', items: ['Kurtas','Kurta Sets','Long Kurtas','Sherwanis','Sherwani Sets','Nehru Jackets','Pathani Suits','Dhotis & Mundus'] },
    { heading: 'Innerwear',   items: ['Briefs','Trunks','Boxers','Vests','Thermal Tops','Socks'] },
    { heading: 'Sports Wear', items: ['Sports T-Shirts','Compression Tops','Track Pants','Tracksuit Sets','Gym Shorts','Gym Vests'] },
    { heading: 'Night Wear',  items: ['Night Shorts','Night Suits','Lounge Pants'] },
    { heading: 'Accessories', items: ['Backpacks','Messenger Bags','Leather Wallets','Card Holders','Sunglasses','Caps','Formal Belts','Casual Belts'] },
    { heading: 'Footwear',    items: ['Sneakers','Loafers','Canvas Shoes','Oxford Shoes','Running Shoes','Walking Shoes','Sandals','Flip-Flops','Ankle Boots'] },
  ],
  women: [
    { heading: 'Kurti, Saree & Lehenga', items: ['Kurtis','Kurti Sets','Kurti With Dupatta','Sarees','Ready to Wear Sarees','Blouses','Lehenga Cholis','Bridal Lehengas','Chaniya Cholis'] },
    { heading: 'Women Western',          items: ['Casual Tops','Crop Tops','Tank Tops','T-Shirts','Casual Dresses','Party Dresses','Maxi Dresses','Gowns','Jeans','Jeggings','Palazzos','Blazers'] },
    { heading: 'Suits & Dress Material', items: ['Salwar Suits','Anarkali Suits','Churidar Suits','Patiala Suits','Dress Material'] },
    { heading: 'Lingerie',               items: ['T-Shirt Bras','Sports Bras','Padded Bras','Panties','Briefs','Shapewear','Camisoles','Slips','Socks','Stockings'] },
    { heading: 'Ethnic Bottomwear',      items: ['Palazzos','Churidars','Patialas','Sharara','Salwars','Dupattas','Stoles','Shawls','Pashminas'] },
    { heading: 'Night Wear',             items: ['Pyjama Sets','Shirt & Pyjama Sets','Nightgowns','Robes','Shorts Sets'] },
    { heading: 'Accessories',            items: ['Handbags','Clutches','Tote Bags','Backpacks','Sunglasses','Scarves','Stoles','Hair Clips & Pins','Headbands','Scrunchies'] },
    { heading: 'Footwear',               items: ['Stilettos','Block Heels','Wedges','Ballerinas','Loafers','Flat Sandals','Heeled Sandals','Running Shoes','Ankle Boots','Juttis & Mojaris','Kolhapuris'] },
  ],
  kids: [
    { heading: 'Boys Clothing',  items: ['T-Shirts','Shirts','Jeans & Trousers','Shorts','Ethnic Wear','Sets'] },
    { heading: 'Girls Clothing', items: ['Frocks & Dresses','Tops','Leggings & Jeans','Ethnic Wear','Sets'] },
    { heading: 'Baby Clothing',  items: ['Bodysuits','Rompers','Clothing Sets','Sleepsuits'] },
    { heading: 'Party Wear',     items: ['Boys Party Wear','Girls Party Wear','Ethnic Party Sets'] },
    { heading: 'Footwear',       items: ['Boys Sneakers','Girls Sneakers','School Shoes','Sandals & Flats','Baby Booties','Baby Sandals'] },
    { heading: 'Innerwear',      items: ['Boys Briefs & Vests','Boys Socks','Girls Panties','Girls Socks'] },
  ],
  jewellery: [
    { heading: 'Necklaces',           items: ['Gold Necklaces','Silver Necklaces','Chokers','Pendant Necklaces','Mangalsutra'] },
    { heading: 'Earrings',            items: ['Stud Earrings','Drop Earrings','Jhumkas','Hoop Earrings'] },
    { heading: 'Bangles & Bracelets', items: ['Bangles','Bracelets','Kadas','Gold Rings','Silver Rings'] },
    { heading: 'Sets & Others',       items: ['Jewellery Sets','Bridal Sets','Maang Tikka','Nose Pins','Nose Rings','Anklets','Pendants'] },
    { heading: "Men's Jewellery",     items: ['Chains','Pendants','Bracelets','Gold Rings','Silver Rings'] },
  ],
}

const POPULAR_SEARCHES = [
  'saree','short kurti','earring','kurti','tshirt',
  'kashmiri bangle','top for women','bangle','watch',
  'kurti set','shoes','top','slipper',
]

const BRANDS = {
  '':        [ {name:'Levis',color:'#c41230',bg:'#fff0f3'},{name:'H&M',color:'#e50010',bg:'#fff5f5'},{name:'Zara',color:'#000',bg:'#f5f5f5'},{name:'FabIndia',color:'#b45309',bg:'#fffbeb'},{name:'Manyavar',color:'#7c3aed',bg:'#f5f3ff'},{name:'W',color:'#be123c',bg:'#fff1f2'},{name:'Puma',color:'#1d4ed8',bg:'#eff6ff'},{name:'Nike',color:'#111',bg:'#f8f8f8'},{name:'Adidas',color:'#000',bg:'#f0f0f0'},{name:'Max',color:'#e91e8c',bg:'#fdf2f8'},{name:'Biba',color:'#9333ea',bg:'#faf5ff'},{name:'Aurelia',color:'#0f766e',bg:'#f0fdfa'} ],
  men:       [ {name:'Levis',color:'#c41230',bg:'#fff0f3'},{name:'Arrow',color:'#1e40af',bg:'#eff6ff'},{name:'Peter England',color:'#15803d',bg:'#f0fdf4'},{name:'Van Heusen',color:'#6d28d9',bg:'#f5f3ff'},{name:'Allen Solly',color:'#b45309',bg:'#fffbeb'},{name:'US Polo',color:'#1d4ed8',bg:'#eff6ff'},{name:'Raymond',color:'#111',bg:'#f5f5f5'},{name:'Puma',color:'#dc2626',bg:'#fef2f2'},{name:'Nike',color:'#111',bg:'#f8f8f8'},{name:'Adidas',color:'#000',bg:'#f0f0f0'},{name:'Wrogn',color:'#e91e8c',bg:'#fdf2f8'},{name:'HRX',color:'#f97316',bg:'#fff7ed'} ],
  women:     [ {name:'W',color:'#be123c',bg:'#fff1f2'},{name:'Biba',color:'#9333ea',bg:'#faf5ff'},{name:'FabIndia',color:'#b45309',bg:'#fffbeb'},{name:'Aurelia',color:'#0f766e',bg:'#f0fdfa'},{name:'Global Desi',color:'#e91e8c',bg:'#fdf2f8'},{name:'Libas',color:'#7c3aed',bg:'#f5f3ff'},{name:'Sangria',color:'#c2410c',bg:'#fff7ed'},{name:'Anouk',color:'#1d4ed8',bg:'#eff6ff'},{name:'Nykaa Fashion',color:'#e91e8c',bg:'#fdf2f8'},{name:'Vero Moda',color:'#111',bg:'#f5f5f5'},{name:'H&M',color:'#e50010',bg:'#fff5f5'},{name:'Zara',color:'#000',bg:'#f5f5f5'} ],
  kids:      [ {name:'Allen Solly Jr',color:'#b45309',bg:'#fffbeb'},{name:'UCB Kids',color:'#15803d',bg:'#f0fdf4'},{name:'Nautica Kids',color:'#1d4ed8',bg:'#eff6ff'},{name:'US Polo Kids',color:'#7c3aed',bg:'#f5f3ff'},{name:'Mini Klub',color:'#0f766e',bg:'#f0fdfa'},{name:'Peppermint',color:'#db2777',bg:'#fdf2f8'},{name:'Gini & Jony',color:'#dc2626',bg:'#fef2f2'},{name:'YK',color:'#1e3a8a',bg:'#eff6ff'},{name:'H&M Kids',color:'#e50010',bg:'#fff5f5'},{name:'Mothercare',color:'#9333ea',bg:'#faf5ff'},{name:'Chicco',color:'#0f766e',bg:'#f0fdfa'},{name:'FirstCry',color:'#f97316',bg:'#fff7ed'} ],
  jewellery: [ {name:'Tanishq',color:'#b45309',bg:'#fffbeb'},{name:'Malabar Gold',color:'#c41230',bg:'#fff0f3'},{name:'Joyalukkas',color:'#7c3aed',bg:'#f5f3ff'},{name:'Kalyan',color:'#0f766e',bg:'#f0fdfa'},{name:'Caratlane',color:'#e91e8c',bg:'#fdf2f8'},{name:'BlueStone',color:'#1d4ed8',bg:'#eff6ff'},{name:'Melorra',color:'#9333ea',bg:'#faf5ff'},{name:'Voylla',color:'#dc2626',bg:'#fef2f2'},{name:'Adiva',color:'#b45309',bg:'#fffbeb'},{name:'Zaveri Bazaar',color:'#7c3aed',bg:'#f5f3ff'},{name:'TEEJH',color:'#e91e8c',bg:'#fdf2f8'},{name:'Pipa Bella',color:'#0f766e',bg:'#f0fdfa'} ],
}

const SUB_CATS = {
  '':        ['T-Shirts','Shirts','Jeans','Kurtis','Sarees','Dresses','Jackets','Sneakers','Watches','Jewellery'],
  men:       ['T-Shirts','Shirts','Jeans','Trousers','Kurtas','Jackets','Ethnic Wear','Formal Shirts'],
  women:     ['Kurtis','Sarees','Tops','Dresses','Leggings','Ethnic Wear','Jeans','Kurta Sets'],
  kids:      ['Boys Clothing','Girls Clothing','Baby Clothing','School Uniform','Party Wear','Winterwear'],
  jewellery: ['Earrings','Necklaces','Rings','Bracelets','Bangles','Pendants','Anklets','Maang Tikka'],
}

const COLORS = [
  { name:'Pink',   hex:'#ec4899' },
  { name:'Blue',   hex:'#3b82f6' },
  { name:'Black',  hex:'#111111' },
  { name:'Green',  hex:'#22c55e' },
  { name:'Purple', hex:'#a855f7' },
  { name:'Red',    hex:'#ef4444' },
  { name:'White',  hex:'#f1f5f9', border:true },
  { name:'Yellow', hex:'#eab308' },
]

const DISCOUNT_OPTIONS = ['10% and above','20% and above','30% and above','40% and above','50% and above','60% and above','70% and above']

const CATS = [
  { key:'',          label:'All',       icon:'🛍️' },
  { key:'men',       label:'Men',       icon:'👔' },
  { key:'women',     label:'Women',     icon:'👗' },
  { key:'kids',      label:'Kids',      icon:'🧒' },
  { key:'jewellery', label:'Jewellery', icon:'💎' },
]

const CAT_LABEL = {
  '':         '✨ All Products',
  men:        "👔 Men's Fashion",
  women:      "👗 Women's Fashion",
  kids:       "🧒 Kids' Wear",
  jewellery:  "💎 Jewellery Collection",
}

// ── Accent color palette — used when admin hasn't set colors via banner fields ──
// The admin can encode bg/accentBg in banner.subtitle as JSON or we derive from sortOrder
const ACCENT_PALETTE = [
  { bg:'#FFF6DC', accentBg:'#F5A623' },
  { bg:'#FEE2F0', accentBg:'#D4376E' },
  { bg:'#E8F5E9', accentBg:'#2E7D32' },
  { bg:'#E3F2FD', accentBg:'#1565C0' },
  { bg:'#F3E5F5', accentBg:'#7B1FA2' },
  { bg:'#FFF3E0', accentBg:'#E65100' },
]

// ── Parse optional JSON stored in banner.subtitle for promo colors ──
// Admin can store: {"subText":"...","tag":"...","amount":"...","desc":"...","code":"FIRST300","bg":"#FFF6DC","accentBg":"#F5A623","btnText":"Shop Now"}
// If subtitle is plain text, we use it as subText and derive colors from palette
function parsePromoMeta(banner, idx) {
  let meta = {}
  try {
    meta = JSON.parse(banner.subtitle || '{}')
  } catch {
    meta = { subText: banner.subtitle || '' }
  }
  const palette = ACCENT_PALETTE[idx % ACCENT_PALETTE.length]
  return {
    mainText:  banner.title   || 'SPECIAL OFFER',
    subText:   meta.subText   || banner.subtitle || '',
    tag:       meta.tag       || 'Limited Offer',
    amount:    meta.amount    || '',
    desc:      meta.desc      || '',
    code:      meta.code      || null,
    bg:        meta.bg        || palette.bg,
    accentBg:  meta.accentBg  || palette.accentBg,
    btnText:   meta.btnText   || 'Shop Now',
    link:      banner.link    || null,
  }
}

// ── Promo Strip Card Component ───────────────────────────────────────────────
function PromoStrip({ mainText, subText, tag, amount, desc, code, bg, accentBg, btnText, link, navigate }) {
  const [copied, setCopied] = useState(false)

  const copyCode = (e) => {
    e.stopPropagation()
    if (!code) return
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      onClick={() => link && navigate(link)}
      style={{
        display: 'flex', alignItems: 'stretch', overflow: 'hidden',
        cursor: link ? 'pointer' : 'default', minHeight: '80px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        borderRadius: '4px',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.12)' }}
    >
      {/* Left — big bold offer text */}
      <div style={{
        flex: 1, background: accentBg,
        display: 'flex', alignItems: 'center',
        padding: '20px 40px',
      }}>
        <span style={{
          fontSize: '32px', fontWeight: '900', color: '#fff',
          letterSpacing: '-1px', fontFamily: f, lineHeight: 1,
          textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {mainText}
        </span>
      </div>

      {/* Notch divider — same accentBg so it blends, circles are page bg */}
      <div style={{
        width: '30px', background: accentBg, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#F7F7F9', marginTop: '-1px' }} />
        <div style={{ flex: 1, borderLeft: '2.5px dashed rgba(255,255,255,0.45)' }} />
        <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#F7F7F9', marginBottom: '-1px' }} />
      </div>

      {/* Right — sub-text + coupon */}
      <div style={{
        background: accentBg, flexShrink: 0, width: '380px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px 32px', gap: '8px', textAlign: 'center',
      }}>
        {subText && (
          <p style={{
            fontSize: '15px', fontWeight: '700', color: '#fff',
            margin: 0, fontFamily: f, lineHeight: 1.4,
            textShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}>
            {subText}
          </p>
        )}
        {code ? (
          <div
            onClick={copyCode}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.18)',
              border: '2px dashed rgba(255,255,255,0.7)',
              borderRadius: '4px', padding: '6px 16px',
              fontSize: '14px', fontWeight: '800', cursor: 'pointer',
              letterSpacing: '2px', fontFamily: f, color: '#fff',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            title="Click to copy"
          >
            ✂ {copied ? '✓ Copied!' : code}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', margin: 0, fontFamily: f, fontWeight: '600' }}>
            ✓ Auto applied at checkout
          </p>
        )}
      </div>
    </div>
  )
}

// ── Offers Ticker — fully dynamic from promo banners ─────────────────────────
function OffersTicker({ promoBanners }) {
  // Build ticker items from banner titles + subtitles
  const rawItems = promoBanners.length > 0
    ? promoBanners.map(b => {
        let label = b.title || ''
        try {
          const meta = JSON.parse(b.subtitle || '{}')
          if (meta.subText) label += (label ? ' — ' : '') + meta.subText
        } catch {
          if (b.subtitle && !b.subtitle.startsWith('{')) label += (label ? ' — ' : '') + b.subtitle
        }
        return label
      }).filter(Boolean)
    : ['Explore our latest collection — Shop now!']

  // Duplicate for seamless loop
  const doubled = [...rawItems, ...rawItems]

  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#1A1A2E', borderRadius: '8px', overflow: 'hidden', height: '36px' }}>
      <div style={{
        background: '#E91E8C', color: '#fff', fontSize: '10px', fontWeight: '700',
        padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center',
        whiteSpace: 'nowrap', letterSpacing: '0.5px', flexShrink: 0, fontFamily: f,
      }}>
        LIVE OFFERS
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
        <div style={{
          display: 'flex', alignItems: 'center', height: '100%',
          whiteSpace: 'nowrap', animation: 'tickerScroll 22s linear infinite',
        }}>
          {doubled.map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0 28px', fontSize: '12px', fontWeight: '600', color: '#f8f8f8', fontFamily: f,
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#E91E8C', display: 'inline-block', flexShrink: 0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Promo Section — rendered after hero banner ────────────────────────────────
// Shows: ticker on top, then up to 3 promo strip cards below
function PromoSection({ promoBanners, navigate }) {
  if (promoBanners.length === 0) return null

  const strips = promoBanners.slice(0, 3)
  const cols = strips.length === 1 ? '1fr' : strips.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr'

  return (
    <div style={{ background: '#F7F7F9', padding: '16px 40px 0' }}>
      {/* Live offers ticker */}
      <OffersTicker promoBanners={promoBanners} />

      {/* Promo strip cards */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '12px', marginTop: '12px' }}>
        {strips.map((banner, i) => {
          const meta = parsePromoMeta(banner, i)
          return (
            <PromoStrip
              key={banner._id}
              {...meta}
              navigate={navigate}
            />
          )
        })}
      </div>
    </div>
  )
}

function Logo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgNav" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E91E8C"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="38" height="38" rx="10" fill="url(#lgNav)"/>
      <rect x="9" y="16" width="20" height="14" rx="2" fill="white" fillOpacity="0.95"/>
      <path d="M14 16V13.5C14 11.015 16.015 9 18.5 9H19.5C21.985 9 24 11.015 24 13.5V16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="15.5" cy="23" r="1.2" fill="#E91E8C"/>
      <circle cx="19"   cy="23" r="1.2" fill="#7C3AED"/>
      <circle cx="22.5" cy="23" r="1.2" fill="#E91E8C"/>
    </svg>
  )
}

function Marquee({ brands, selectedBrands, toggleBrand, speed = 40 }) {
  const doubled = [...brands, ...brands]
  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(90deg,#fff,transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(-90deg,#fff,transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', gap: '20px', width: 'max-content', animation: `marquee ${speed}s linear infinite` }}
        onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
        onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}>
        {doubled.map((brand, i) => (
          <button key={i} onClick={() => toggleBrand(brand.name)}
            style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: '4px 0', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: selectedBrands.includes(brand.name) ? brand.color : brand.bg,
              border: `2.5px solid ${selectedBrands.includes(brand.name) ? brand.color : '#e5e7eb'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: selectedBrands.includes(brand.name) ? `0 6px 18px ${brand.color}55` : '0 2px 8px rgba(0,0,0,0.07)',
              transition: 'all 0.25s',
            }}>
              <span style={{
                fontSize: '9px', fontWeight: '800', textAlign: 'center', lineHeight: '1.2',
                color: selectedBrands.includes(brand.name) ? 'white' : brand.color,
                textTransform: 'uppercase', letterSpacing: '0.3px',
              }}>
                {brand.name}
              </span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#6B7280', whiteSpace: 'nowrap' }}>{brand.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Footer({ navigate }) {
  return (
    <footer style={{ background: '#1A1A2E', color: 'white', fontFamily: f, marginTop: '48px' }}>
      <div style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', padding: '20px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {[
          { icon: '🚚', title: 'Free Delivery on orders above ₹499', sub: 'Pan India delivery in 3–7 working days' },
          { icon: '↩️', title: 'Easy 7-Day Returns',                 sub: 'Hassle-free returns & exchanges' },
          { icon: '🔒', title: '100% Secure Payments',               sub: 'UPI, Cards, Net Banking & COD' },
          { icon: '✅', title: '100% Authentic Products',            sub: 'Only verified sellers on StyleHub' },
        ].map(s => (
          <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: 'white' }}>{s.title}</p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '48px 60px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Logo size={40} />
            <div>
              <p style={{ fontWeight: '900', fontSize: '16px', margin: 0, lineHeight: 1, background: 'linear-gradient(135deg,#E91E8C,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StyleHub</p>
              <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Fashion Store</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.8', margin: '0 0 20px', maxWidth: '260px' }}>
            India's fastest growing fashion marketplace. Shop the latest trends for men, women & kids from verified sellers.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{ icon: '📘', label: 'Facebook' }, { icon: '📸', label: 'Instagram' }, { icon: '🐦', label: 'Twitter' }, { icon: '▶️', label: 'YouTube' }].map(s => (
              <button key={s.label} title={s.label}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,30,140,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
        {[
          { title: 'Shop',  items: ["Men's Fashion", "Women's Fashion", "Kids' Wear", 'Jewellery', 'New Arrivals', 'Sale & Offers'] },
          { title: 'Help',  items: ['Track My Order', 'Returns & Refunds', 'Size Guide', 'FAQs', 'Contact Support', 'Report an Issue'] },
          { title: 'Sell',  items: ['Sell on StyleHub', 'Seller Dashboard', 'Seller Guidelines', 'Commission Rates', 'Seller Support', 'Become a Partner'] },
          { title: 'Legal', items: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility', 'Sitemap', 'About Us'] },
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'white', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 16px' }}>{col.title}</h4>
            {col.items.map(item => (
              <p key={item} style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 10px', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#E91E8C'}
                onMouseLeave={e => e.target.style.color = '#94A3B8'}>{item}</p>
            ))}
          </div>
        ))}
      </div>
      <div style={{ padding: '0 60px 24px' }}>
        <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>We Accept</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['💳 Visa', '💳 Mastercard', '🏦 Net Banking', '📱 UPI', '💵 COD', '🔄 EMI'].map(p => (
            <span key={p} style={{ fontSize: '11px', fontWeight: '600', padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94A3B8' }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>© {new Date().getFullYear()} StyleHub Fashion Pvt. Ltd. All rights reserved.</p>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Made with ❤️ in India 🇮🇳</p>
      </div>
    </footer>
  )
}

export default function BuyerHomePage() {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()
  const { items }        = useCartStore()
  const { toggleItem, isWishlisted, items: wishlistItems } = useWishlistStore()

  const [products,         setProducts]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [category,         setCategory]         = useState('')
  const [search,           setSearch]           = useState('')
  const [bannerIdx,        setBannerIdx]        = useState(0)
  const [bannerAnimating,  setBannerAnimating]  = useState(false)
  const [selectedSubs,     setSelectedSubs]     = useState([])
  const [selectedBrands,   setSelectedBrands]   = useState([])
  const [selectedColors,   setSelectedColors]   = useState([])
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [priceRange,       setPriceRange]       = useState([100, 10000])
  const [showAllSubcats,   setShowAllSubcats]   = useState(false)
  const [hoveredProduct,   setHoveredProduct]   = useState(null)
  const [megaMenuData,     setMegaMenuData]     = useState(MEGA_MENU_DATA)

  const [activeBanners,   setActiveBanners]   = useState([])
  const [promoBanners,    setPromoBanners]    = useState([])
  const [categoryBanners, setCategoryBanners] = useState([])

  const [activeMenu,     setActiveMenu]     = useState(null)
  const menuTimerRef                        = useRef(null)
  const [searchFocused,  setSearchFocused]  = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_recent') || '[]') } catch { return [] }
  })
  const searchWrapRef = useRef(null)

  const cartCount     = items.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlistItems.length
  const currentBrands = BRANDS[category] || BRANDS['']
  const currentSubs   = SUB_CATS[category] || SUB_CATS['']

  useEffect(() => {
    localStorage.setItem('sh_recent', JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    const handler = e => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target))
        setSearchFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch all banner types from API ────────────────────────────────────────
  useEffect(() => {
    // Hero banners
    api.get('/banners', { params: { type: 'hero' } })
      .then(({ data }) => {
        const db = (data.banners || []).filter(b => b.type === 'hero')
        if (db.length > 0) {
          setActiveBanners(db.map(b => ({
            heading:  b.title    || '',
            sub:      b.subtitle || '',
            imageUrl: b.imageUrl || null,
            link:     b.link     || null,
            cta:      'SHOP NOW',
          })))
        }
      })
      .catch(() => {})

    // Promo banners — used for both ticker AND strip cards
    api.get('/banners', { params: { type: 'promo' } })
      .then(({ data }) => setPromoBanners((data.banners || []).filter(b => b.type === 'promo')))
      .catch(() => {})

    // Category banners
    api.get('/banners', { params: { type: 'category' } })
      .then(({ data }) => setCategoryBanners((data.banners || []).filter(b => b.type === 'category')))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeBanners.length === 0) return
    const t = setInterval(() => {
      setBannerAnimating(true)
      setTimeout(() => {
        setBannerIdx(i => (i + 1) % activeBanners.length)
        setBannerAnimating(false)
      }, 350)
    }, 4500)
    return () => clearInterval(t)
  }, [activeBanners.length])

  useEffect(() => {
    api.get('/categories/mega-menu')
      .then(({ data }) => {
        if (data.data && Object.keys(data.data).length > 0)
          setMegaMenuData(data.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setSelectedSubs([])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedDiscount('')
    setShowAllSubcats(false)
    setSearch('')
  }, [category])

  useEffect(() => {
    setLoading(true)
    api.get('/products', {
      params: { limit: 40, status: 'active', category: category || undefined, search: search || undefined },
    })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, search])

  const handleCatEnter     = key => { clearTimeout(menuTimerRef.current); setActiveMenu(megaMenuData[key] ? key : null) }
  const handleNavAreaLeave = ()  => { menuTimerRef.current = setTimeout(() => setActiveMenu(null), 200) }
  const handleMegaEnter    = ()  => clearTimeout(menuTimerRef.current)
  const handleMegaLeave    = ()  => { menuTimerRef.current = setTimeout(() => setActiveMenu(null), 200) }

  const handleSearchSelect = term => {
    setSearch(term)
    setSearchFocused(false)
    setRecentSearches(prev => [term, ...prev.filter(t => t !== term)].slice(0, 8))
  }
  const handleSearchKeyDown = e => {
    if (e.key === 'Enter' && search.trim()) {
      setRecentSearches(prev => [search.trim(), ...prev.filter(t => t !== search.trim())].slice(0, 8))
      setSearchFocused(false)
    }
    if (e.key === 'Escape') setSearchFocused(false)
  }

  const handleMegaItemClick = (itemName, catKey) => {
    setActiveMenu(null)
    setCategory(catKey)
    setSearch(itemName)
    setRecentSearches(prev => [itemName, ...prev.filter(t => t !== itemName)].slice(0, 8))
  }

  const toggleSub = s => {
    setSelectedSubs(prev => {
      const next = prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
      setSearch(next.length > 0 ? next[0] : '')
      return next
    })
  }
  const toggleBrand      = b => setSelectedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])
  const toggleColor      = c => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const hasActiveFilters = selectedSubs.length || selectedBrands.length || selectedColors.length || selectedDiscount
  const clearFilters     = () => { setSelectedSubs([]); setSelectedBrands([]); setSelectedColors([]); setSelectedDiscount('') }

  const handleHeartClick = (e, product) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    toggleItem(product)
  }

  const changeBanner = dir => {
    if (activeBanners.length === 0) return
    setBannerAnimating(true)
    setTimeout(() => {
      setBannerIdx(i => (i + dir + activeBanners.length) % activeBanners.length)
      setBannerAnimating(false)
    }, 300)
  }

  const banner        = activeBanners[bannerIdx] || null
  const displayedSubs = showAllSubcats ? currentSubs : currentSubs.slice(0, 6)

  const filteredProducts = products.filter(p => {
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false
    if (selectedDiscount) {
      const minDisc = parseInt(selectedDiscount)
      const disc = p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0
      if (disc < minDisc) return false
    }
    if (p.sellingPrice < priceRange[0] || p.sellingPrice > priceRange[1]) return false
    return true
  })

  const activeMegaCols = activeMenu ? megaMenuData[activeMenu] : null

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F9', fontFamily: f }}>

      {/* ── Navbar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 200 }}>
        <nav onMouseLeave={handleNavAreaLeave}
          style={{ background: 'white', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/home')}>
            <Logo size={38} />
            <div>
              <p style={{ fontWeight: '900', fontSize: '16px', margin: 0, lineHeight: 1, background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StyleHub</p>
              <p style={{ fontSize: '8px', color: '#94A3B8', margin: 0, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '600' }}>Fashion Store</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0', alignItems: 'center', height: '64px' }}>
            {CATS.map(c => (
              <div key={c.key} onMouseEnter={() => handleCatEnter(c.key)} style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <button onClick={() => { setCategory(c.key); setActiveMenu(null) }}
                  style={{
                    padding: '0 14px', background: 'none', border: 'none',
                    borderBottom: category === c.key ? '3px solid #E91E8C' : activeMenu === c.key ? '3px solid #E91E8C' : '3px solid transparent',
                    cursor: 'pointer', fontSize: '12px', fontFamily: f, fontWeight: '700',
                    color: category === c.key || activeMenu === c.key ? '#E91E8C' : '#282C3F',
                    textTransform: 'uppercase', letterSpacing: '0.5px', height: '100%',
                    borderRadius: 0, transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                  onMouseEnter={e => { if (category !== c.key) e.currentTarget.style.color = '#E91E8C' }}
                  onMouseLeave={e => { if (category !== c.key && activeMenu !== c.key) e.currentTarget.style.color = '#282C3F' }}>
                  <span style={{ fontSize: '13px' }}>{c.icon}</span>
                  {c.label}
                  {megaMenuData[c.key] && (
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div ref={searchWrapRef} style={{ flex: 1, maxWidth: '310px', margin: '0 20px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#94A3B8', pointerEvents: 'none' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onKeyDown={handleSearchKeyDown}
              placeholder="Try Saree, Kurti or Search by Product"
              style={{
                width: '100%', padding: '10px 16px 10px 38px', border: '1px solid',
                borderColor: searchFocused ? '#E91E8C' : '#D4D5D9',
                borderRadius: '4px', fontSize: '12px', outline: 'none',
                background: searchFocused ? 'white' : '#F5F5F6',
                fontFamily: f, boxSizing: 'border-box', color: '#282C3F', transition: 'border 0.2s,background 0.2s',
              }} />

            {searchFocused && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid #E5E7EB', zIndex: 300, padding: '16px 16px 18px', fontFamily: f }}>
                {recentSearches.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E', margin: 0 }}>Recent Searches</p>
                      <button onMouseDown={e => { e.preventDefault(); setRecentSearches([]); localStorage.removeItem('sh_recent') }}
                        style={{ fontSize: '11px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f }}>Clear</button>
                    </div>
                    {recentSearches.slice(0, 5).map(term => (
                      <div key={term} onMouseDown={e => { e.preventDefault(); handleSearchSelect(term) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 6px', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#374151' }}>{term}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 10px' }}>Popular Searches</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {POPULAR_SEARCHES.map(term => (
                      <button key={term} onMouseDown={e => { e.preventDefault(); handleSearchSelect(term) }}
                        style={{ fontSize: '12px', fontWeight: '500', padding: '6px 14px', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '20px', cursor: 'pointer', fontFamily: f, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FCE7F3'; e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.color = '#E91E8C' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
            {user ? (
              <>
                {[
                  { label: 'Orders',  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>, path: '/orders', badge: null },
                  { label: 'Wishlist', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, path: '/wishlist', badge: wishlistCount },
                  { label: 'Bag',     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, path: '/cart', badge: cartCount },
                  { label: 'Profile', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, path: '/profile', badge: null },
                ].map(nav => (
                  <button key={nav.label} onClick={() => navigate(nav.path)}
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
                    {nav.icon}
                    {nav.badge > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#E91E8C', color: 'white', width: '16px', height: '16px', borderRadius: '50%', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {nav.badge}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>{nav.label}</span>
                  </button>
                ))}
                <button onClick={() => { logout(); navigate('/') }}
                  style={{ fontSize: '11px', fontWeight: '700', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, letterSpacing: '0.3px', textTransform: 'uppercase', padding: 0 }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  style={{ fontSize: '13px', padding: '8px 20px', background: 'white', color: '#E91E8C', border: '2px solid #E91E8C', borderRadius: '4px', cursor: 'pointer', fontFamily: f, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Login</button>
                <button onClick={() => navigate('/signup/buyer')}
                  style={{ fontSize: '13px', padding: '8px 20px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: f, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Sign Up</button>
              </>
            )}
          </div>
        </nav>

        {/* Mega menu */}
        {activeMegaCols && (
          <div onMouseEnter={handleMegaEnter} onMouseLeave={handleMegaLeave}
            style={{
              position: 'absolute', top: '64px', left: 0, right: 0, background: 'white',
              borderTop: '3px solid #E91E8C', boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
              padding: '24px 40px 28px', display: 'grid',
              gridTemplateColumns: `repeat(${activeMegaCols.length}, 1fr)`,
              gap: '0 20px', zIndex: 190, animation: 'megaFadeIn 0.18s ease',
            }}>
            {activeMegaCols.map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#E91E8C', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px', fontFamily: f }}>
                  {col.heading}
                </p>
                {col.items.map(item => (
                  <p key={item} onClick={() => handleMegaItemClick(item, activeMenu)}
                    style={{ fontSize: '12.5px', color: '#374151', margin: '0 0 8px', cursor: 'pointer', fontFamily: f, transition: 'color 0.12s', lineHeight: '1.4' }}
                    onMouseEnter={e => e.target.style.color = '#E91E8C'}
                    onMouseLeave={e => e.target.style.color = '#374151'}>
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Hero Banner ── */}
      {activeBanners.length > 0 && banner && (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', userSelect: 'none' }}>
          <div style={{ position: 'relative', opacity: bannerAnimating ? 0 : 1, transform: bannerAnimating ? 'scale(1.015)' : 'scale(1)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
            <img src={banner.imageUrl} alt={banner.heading || 'banner'}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={e => { e.target.style.display = 'none' }} />
            {banner.heading && (
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', color: 'white', width: '100%', maxWidth: '600px', zIndex: 2 }}>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '24px 40px', borderRadius: '12px', display: 'inline-block' }}>
                  <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.05, margin: '0 0 8px', letterSpacing: '-2px', textTransform: 'uppercase', whiteSpace: 'pre-line', textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                    {banner.heading}
                  </h1>
                  {banner.sub && <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 16px', opacity: 0.9 }}>{banner.sub}</p>}
                  <button
                    onClick={() => banner.link && navigate(banner.link)}
                    style={{ padding: '12px 36px', background: 'white', color: '#111', border: 'none', borderRadius: '2px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: f, letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', transition: 'transform 0.18s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    {banner.cta} →
                  </button>
                </div>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 3 }}>
              {activeBanners.map((_, i) => (
                <button key={i}
                  onClick={() => { setBannerAnimating(true); setTimeout(() => { setBannerIdx(i); setBannerAnimating(false) }, 300) }}
                  style={{ width: bannerIdx === i ? '28px' : '8px', height: '8px', borderRadius: '4px', background: bannerIdx === i ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
              ))}
            </div>
            {activeBanners.length > 1 && [{ dir: -1, side: 'left' }, { dir: 1, side: 'right' }].map(({ dir, side }) => (
              <button key={side} onClick={() => changeBanner(dir)}
                style={{ position: 'absolute', top: '50%', [side]: '20px', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', fontSize: '20px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s,transform 0.15s', zIndex: 2 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}>
                {dir === -1 ? '‹' : '›'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ PROMO SECTION — fully dynamic from DB ══
          Shows nothing when no promo banners exist.
          Shows ticker + up to 3 strip cards when banners are present.
      ══════════════════════════════════════════════ */}
      <PromoSection promoBanners={promoBanners} navigate={navigate} />

      {/* ── Category banners ── */}
      {categoryBanners.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(categoryBanners.length, 4)}, 1fr)`, marginTop: '4px' }}>
          {categoryBanners.map(b => (
            <div key={b._id}
              onClick={() => { if (b.category) setCategory(b.category); if (b.link) navigate(b.link) }}
              style={{ position: 'relative', height: '160px', cursor: 'pointer', overflow: 'hidden' }}>
              <img src={b.imageUrl} alt={b.title || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onError={e => { e.target.style.display = 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.1) 60%)', display: 'flex', alignItems: 'flex-end', padding: '14px 16px' }}>
                <div>
                  {b.title && <p style={{ color: 'white', fontSize: '15px', fontWeight: '800', margin: 0, textTransform: 'capitalize', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>{b.title}</p>}
                  {b.subtitle && <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', margin: '3px 0 0' }}>{b.subtitle}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ padding: '20px 40px' }}>

        {/* Brands Marquee */}
        <div style={{ background: 'white', padding: '30px 0', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '0 24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⭐ Favourite Brands
              {category && (
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#94A3B8', marginLeft: '8px', textTransform: 'none', letterSpacing: 0 }}>
                  — {CATS.find(c => c.key === category)?.label}'s top picks
                </span>
              )}
            </h2>
          </div>
          <Marquee brands={currentBrands} selectedBrands={selectedBrands} toggleBrand={toggleBrand} speed={35} />
        </div>

        {/* Jewellery special banner */}
        {category === 'jewellery' && (
          <div style={{ marginBottom: '24px', background: 'linear-gradient(120deg,#7B1FA2,#F06292)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px' }}>EXCLUSIVE COLLECTION</p>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 6px', letterSpacing: '-0.5px' }}>💎 Jewellery for Every Occasion</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>Earrings · Necklaces · Rings · Bangles · Anklets</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#FCE4EC', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>STARTING AT</p>
              <p style={{ color: 'white', fontSize: '40px', fontWeight: '900', margin: '0 0 12px', lineHeight: 1 }}>₹299</p>
              <button style={{ padding: '10px 28px', background: 'white', color: '#7B1FA2', border: 'none', borderRadius: '2px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: f, letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                SHOP JEWELLERY →
              </button>
            </div>
          </div>
        )}

        {/* Products + Sidebar */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <div style={{ width: '240px', flexShrink: 0, background: 'white', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: '76px', maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1A2E', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                FILTERS
              </h3>
              {hasActiveFilters ? <button onClick={clearFilters} style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C', background: '#FDF2F8', border: 'none', borderRadius: '0px', padding: '4px 10px', cursor: 'pointer', fontFamily: f }}>Clear all</button> : null}
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>CATEGORIES</h4>
              {displayedSubs.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedSubs.includes(s)} onChange={() => toggleSub(s)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedSubs.includes(s) ? '700' : '500' }}>{s}</span>
                </label>
              ))}
              {currentSubs.length > 6 && (
                <button onClick={() => setShowAllSubcats(v => !v)} style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: '4px 0' }}>
                  {showAllSubcats ? '− Less' : `+ ${currentSubs.length - 6} more`}
                </button>
              )}
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>BRAND</h4>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94A3B8' }}>🔍</span>
                <input placeholder="Search brand" style={{ width: '100%', padding: '7px 10px 7px 28px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', fontFamily: f, outline: 'none', boxSizing: 'border-box', color: '#374151' }} />
              </div>
              {currentBrands.slice(0, 6).map((brand, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedBrands.includes(brand.name)} onChange={() => toggleBrand(brand.name)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedBrands.includes(brand.name) ? '700' : '500' }}>{brand.name}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>PRICE</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>₹{priceRange[0].toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>₹{priceRange[1].toLocaleString('en-IN')}+</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} style={{ width: '100%', accentColor: '#E91E8C' }} />
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>COLOR</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COLORS.map(c => (
                  <button key={c.name} title={c.name} onClick={() => toggleColor(c.name)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.hex, border: selectedColors.includes(c.name) ? '3px solid #E91E8C' : c.border ? '2px solid #D1D5DB' : '2px solid transparent', cursor: 'pointer', boxShadow: selectedColors.includes(c.name) ? '0 0 0 2px #FCE7F3' : 'none', transition: 'all 0.18s' }} />
                ))}
              </div>
              {selectedColors.length > 0 && <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Selected: {selectedColors.join(', ')}</p>}
            </div>

            <div style={{ marginBottom: '8px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>DISCOUNT RANGE</h4>
              {DISCOUNT_OPTIONS.map(d => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="discount" checked={selectedDiscount === d} onChange={() => setSelectedDiscount(prev => prev === d ? '' : d)} style={{ accentColor: '#E91E8C', width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '12px', color: '#374151', fontWeight: selectedDiscount === d ? '700' : '500' }}>{d}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 2px' }}>
                  {CAT_LABEL[category] || '✨ All Products'}
                </h2>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  {filteredProducts.length} products{hasActiveFilters ? ' (filtered)' : ''}
                </p>
              </div>
              {hasActiveFilters > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {selectedSubs.map(s => (
                    <span key={s} onClick={() => toggleSub(s)} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#FCE7F3', color: '#E91E8C', borderRadius: '20px', cursor: 'pointer' }}>{s} ×</span>
                  ))}
                  {selectedBrands.map(b => (
                    <span key={b} onClick={() => toggleBrand(b)} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#F3F4F6', color: '#374151', borderRadius: '20px', cursor: 'pointer' }}>{b} ×</span>
                  ))}
                  {selectedDiscount && (
                    <span onClick={() => setSelectedDiscount('')} style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', background: '#D1FAE5', color: '#16A34A', borderRadius: '20px', cursor: 'pointer' }}>{selectedDiscount} ×</span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} style={{ background: 'white', overflow: 'hidden', border: '1px solid #EBEBF0' }}>
                    <div style={{ height: '220px', background: 'linear-gradient(90deg,#F1F5F9,#E2E8F0,#F1F5F9)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: '12px' }}>
                      <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '0px', marginBottom: '8px' }} />
                      <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '0px', width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>{category === 'jewellery' ? '💎' : '🔍'}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 8px' }}>No products found</h3>
                <p style={{ fontSize: '14px', margin: '0 0 16px' }}>
                  {category === 'jewellery' ? 'Jewellery products will appear here once sellers add them.' : 'Try adjusting your filters or search term'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: f }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
                {filteredProducts.map(product => {
                  const disc       = product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
                  const wishlisted = isWishlisted(product._id)
                  const catName    = product.category?.name    || product.category    || ''
                  const subCatName = product.subCategory?.name || product.subCategory || ''
                  const isHovered  = hoveredProduct === product._id
                  return (
                    <div key={product._id}
                      onClick={() => user ? navigate(`/product/${product._id}`) : navigate('/login')}
                      onMouseEnter={() => setHoveredProduct(product._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      style={{ background: 'white', overflow: 'hidden', cursor: 'pointer', border: '1px solid #EBEBF0', transition: 'all 0.22s cubic-bezier(.4,0,.2,1)', boxShadow: isHovered ? '0 16px 40px rgba(233,30,140,0.14)' : '0 2px 8px rgba(0,0,0,0.04)', transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'none' }}>
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <img src={product.images?.[0]} alt={product.title}
                          style={{ width: '100%', height: '220px', objectFit: 'cover', background: '#F8FAFC', display: 'block', transition: 'transform 0.4s ease', transform: isHovered ? 'scale(1.07)' : 'scale(1)' }}
                          onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                        {disc > 0 && (
                          <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(233,30,140,0.35)' }}>
                            {disc}% OFF
                          </span>
                        )}
                        <button onClick={e => handleHeartClick(e, product)}
                          style={{ position: 'absolute', top: '10px', right: '10px', width: '34px', height: '34px', borderRadius: '0%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transform: isHovered ? 'scale(1)' : 'scale(0.85)', opacity: isHovered ? 1 : 0.7, transition: 'all 0.22s ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#E91E8C' : 'none'} stroke={wishlisted ? '#E91E8C' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </button>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 100%)', padding: '20px 12px 10px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Quick View →</span>
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        {product.brand && <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>{product.brand}</p>}
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>{product.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#1A1A2E' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                          {disc > 0 && <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
                          {disc > 0 && <span style={{ fontSize: '10px', fontWeight: '700', color: '#16A34A' }}>{disc}% off</span>}
                        </div>
                        {product.reviewCount > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#16a34a', padding: '2px 7px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{product.averageRating}</span>
                              <span style={{ color: 'white', fontSize: '11px' }}>★</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
                              {product.reviewCount >= 1000 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount}
                            </span>
                          </div>
                        )}
                        <p style={{ fontSize: '10px', color: '#94A3B8', margin: '3px 0 0', textTransform: 'capitalize' }}>
                          {catName}{subCatName ? ` · ${subCatName}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />

      <style>{`
        @keyframes shimmer      { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes marquee      { 0%{transform:translateX(0)}    100%{transform:translateX(-50%)}  }
        @keyframes megaFadeIn   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#F9F9FB}
        ::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
      `}</style>
    </div>
  )
}