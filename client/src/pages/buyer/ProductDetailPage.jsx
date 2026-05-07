import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useCartStore from '../../context/useCartStore.js'

const f = 'Poppins, sans-serif'

// ── Delivery Options widget (Myntra-style) ─────────────────────────────────────
function DeliveryOptions() {
  const [pincode,  setPincode]  = useState('')
  const [saved,    setSaved]    = useState('')
  const [checking, setChecking] = useState(false)
  const [result,   setResult]   = useState(null)

  const check = () => {
    if (!/^\d{6}$/.test(pincode)) return
    setChecking(true)
    // Simulate delivery API — replace with your real API call
    setTimeout(() => {
      const days  = Math.floor(Math.random() * 4) + 3
      const date  = new Date(Date.now() + days * 86400000)
      const label = date.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })
      setResult({ date: label, cod: pincode[0] >= '4' })
      setSaved(pincode)
      setChecking(false)
    }, 900)
  }

  const resultRows = result ? [
    { icon:'🚚', text:`Get it by ${result.date}`, bold: true },
    ...(result.cod ? [{ icon:'💵', text:'Pay on delivery available', bold: false }] : []),
  ] : []

  const staticRows = [
    { icon:'↩️', text:'Easy 7-day return & exchange' },
    { icon:'✅', text:'100% Original Products' },
  ]

  const allRows = [...resultRows, ...staticRows]

  return (
    <div style={{ marginBottom:'20px', border:'1px solid #E2E8F0', borderRadius:'12px', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:'8px', background:'#FAFAFA' }}>
        <span style={{ fontSize:'14px' }}>🚚</span>
        <span style={{ fontSize:'12px', fontWeight:'800', color:'#0F172A', textTransform:'uppercase', letterSpacing:'0.06em' }}>Delivery Options</span>
      </div>

      {/* Pincode input */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid #F1F5F9' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', border:'1.5px solid #CBD5E1', borderRadius:'8px', overflow:'hidden', background:'white' }}>
            <span style={{ padding:'0 10px', fontSize:'13px' }}>📍</span>
            <input
              value={pincode}
              onChange={e => { setPincode(e.target.value.replace(/\D/g,'').slice(0,6)); setResult(null) }}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder={saved ? `${saved} — Change` : 'Enter delivery pincode'}
              maxLength={6}
              style={{ flex:1, border:'none', outline:'none', fontSize:'13px', fontWeight:'600', color:'#0F172A', padding:'10px 0', background:'transparent', fontFamily:f }}
            />
          </div>
          <button onClick={check} disabled={pincode.length !== 6 || checking}
            style={{ padding:'10px 20px', background: pincode.length===6 ? '#ec4899':'#E2E8F0', color: pincode.length===6 ? 'white':'#94A3B8', border:'none', borderRadius:'8px', fontWeight:'800', fontSize:'13px', cursor: pincode.length===6 ? 'pointer':'not-allowed', fontFamily:f, transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {checking ? '...' : saved && !result ? 'Change' : 'Check'}
          </button>
        </div>
        {pincode.length > 0 && pincode.length < 6 && (
          <p style={{ fontSize:'11px', color:'#94A3B8', margin:'6px 0 0' }}>Enter a valid 6-digit pincode</p>
        )}
      </div>

      {/* Info rows */}
      <div style={{ padding:'4px 0' }}>
        {allRows.map((row, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 16px', borderBottom: i < allRows.length - 1 ? '1px solid #F8FAFC':'none' }}>
            <span style={{ fontSize:'20px', width:'26px', textAlign:'center', flexShrink:0 }}>{row.icon}</span>
            <span style={{ fontSize:'13px', fontWeight: row.bold ? '700':'500', color: row.bold ? '#0F172A':'#475569' }}>{row.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCartStore()

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [imgIdx,   setImgIdx]   = useState(0)
  const [selSize,  setSelSize]  = useState('')
  const [selColor, setSelColor] = useState('')
  const [qty,      setQty]      = useState(1)
  const [zoom,     setZoom]     = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product)
        const first = data.product.variants?.find(v => v.stock > 0)
        if (first) { setSelSize(first.size); setSelColor(first.color || '') }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:f }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid #ec4899', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <p style={{ color:'#94A3B8', fontSize:'14px' }}>Loading...</p>
      </div>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:f }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'56px', marginBottom:'12px' }}>😕</div>
        <p style={{ color:'#64748B', marginBottom:'20px' }}>Product not found</p>
        <button onClick={() => navigate('/')} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontFamily:f }}>Go Home</button>
      </div>
    </div>
  )

  const sizes      = [...new Set(product.variants?.map(v => v.size) || [])]
  const colors     = [...new Set(product.variants?.filter(v => v.size === selSize).map(v => v.color).filter(Boolean) || [])]
  const selVariant = product.variants?.find(v => v.size === selSize && (v.color === selColor || !selColor))
  const inStock    = selVariant ? selVariant.stock > 0 : false
  const discount   = product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
  const inCart     = items.some(i => i.productId === product._id && i.size === selSize)

  const handleAddToCart = () => {
    if (!selSize) return toast.error('Please select a size')
    if (!inStock) return toast.error('Out of stock')
    addItem({
      productId:  product._id,
      variantId:  selVariant?._id,
      title:      product.title,
      image:      product.images?.[0] || '',
      size:       selSize,
      color:      selColor,
      price:      product.sellingPrice,
      mrp:        product.mrp,
      seller:     product.seller?._id,
      gstPercent: product.gstPercent,
      quantity:   qty,
    })
    toast.success('Added to cart! 🛒')
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:f }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .thumb-btn { transition: all 0.15s ease; }
        .thumb-btn:hover { border-color: #ec4899 !important; transform: scale(1.04); }
        .size-btn:hover { border-color: #ec4899 !important; background: #FFF0F9 !important; }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>

      {/* Sticky header */}
      <div style={{ background:'white', padding:'0 20px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
        <button onClick={() => navigate(-1)} style={{ background:'#F1F5F9', border:'none', width:'36px', height:'36px', borderRadius:'0%', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <span style={{ fontWeight:'700', fontSize:'15px', color:'#0F172A' }}>Product Details</span>
        <button onClick={() => navigate('/cart')} style={{ position:'relative', background:'none', border:'none', cursor:'pointer', padding:'6px' }}>
          <span style={{ fontSize:'22px' }}>🛒</span>
          {items.length > 0 && (
            <span style={{ position:'absolute', top:0, right:0, width:'16px', height:'16px', background:'#ec4899', color:'white', fontSize:'9px', fontWeight:'800', borderRadius:'0%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {items.reduce((s,i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'20px 16px 70px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}>

          {/* ── IMAGE PANEL ── */}
          <div style={{ display:'flex', flexDirection:'row', gap:'10px', background:'white', borderRadius:'0px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', animation:'fadeIn 0.4s ease', height:'420px' }}>

            {/* Vertical thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', padding:'12px', width:'80px', flexShrink:0, overflowY:'auto' }}>
                {product.images.map((img, i) => (
                  <button key={i} className="thumb-btn" onClick={() => setImgIdx(i)}
                    style={{ width:'58px', height:'58px', borderRadius:'0px', overflow:'hidden', border:`2px solid ${imgIdx===i?'#ec4899':'#E2E8F0'}`, cursor:'pointer', padding:0, background:'none', flexShrink:0, boxShadow: imgIdx===i?'0 0 0 3px #fce7f3':'none' }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div style={{ flex:1, position:'relative', minWidth:0, height:'100%' }}>
              {discount > 0 && (
                <div style={{ position:'absolute', top:'12px', left:'12px', zIndex:5, background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', fontSize:'11px', fontWeight:'800', padding:'4px 10px', borderRadius:'0px' }}>
                  {discount}% OFF
                </div>
              )}
              <div
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                onMouseMove={handleMouseMove}
                style={{ width:'100%', height:'100%', overflow:'hidden', cursor:'crosshair', background:'#F8FAFC' }}
              >
                <img src={product.images?.[imgIdx]} alt={product.title}
                  style={{ width:'100%', height:'100%', objectFit:'contain', display:'block', transformOrigin:`${mousePos.x}% ${mousePos.y}%`, transform: zoom?'scale(2)':'scale(1)', transition: zoom?'transform 0.1s ease':'transform 0.3s ease' }}
                  onError={e => { e.target.style.background='#F1F5F9' }}
                />
                {!zoom && (
                  <div style={{ position:'absolute', bottom:'12px', right:'12px', background:'rgba(0,0,0,0.45)', color:'white', fontSize:'11px', padding:'4px 10px', borderRadius:'0px', pointerEvents:'none' }}>
                    🔍 Hover to zoom
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── DETAILS PANEL ── */}
          <div style={{ background:'white', borderRadius:'0px', padding:'22px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', animation:'fadeIn 0.4s ease 0.1s both' }}>

            {product.brand && (
              <p style={{ fontSize:'11px', color:'#94A3B8', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 5px' }}>{product.brand}</p>
            )}
            <h1 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', lineHeight:'1.4', margin:'0 0 14px' }}>{product.title}</h1>

            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:'10px', margin:'0 0 4px' }}>
              <span style={{ fontSize:'26px', fontWeight:'800', color:'#0F172A' }}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
              {discount > 0 && <>
                <span style={{ fontSize:'15px', color:'#94A3B8', textDecoration:'line-through' }}>₹{product.mrp?.toLocaleString('en-IN')}</span>
                <span style={{ fontSize:'13px', fontWeight:'800', color:'#16A34A' }}>{discount}% off</span>
              </>}
            </div>
            <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 22px' }}>Inclusive of all taxes · GST {product.gstPercent}%</p>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div style={{ marginBottom:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A' }}>Select Size</span>
                  {selVariant && (
                    <span style={{ fontSize:'12px', color: selVariant.stock < 5 ? '#DC2626':'#16A34A', fontWeight:'600' }}>
                      {selVariant.stock} in stock
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {sizes.map(size => {
                    const v = product.variants?.find(vv => vv.size === size)
                    const has = v?.stock > 0
                    return (
                      <button key={size} className="size-btn"
                        onClick={() => { if(has){ setSelSize(size); setSelColor('') } }}
                        disabled={!has}
                        style={{ padding:'7px 16px', borderRadius:'0px', border:`2px solid ${selSize===size?'#ec4899':'#E2E8F0'}`, background: selSize===size?'#FFF0F9':'white', color: selSize===size?'#ec4899': has?'#374151':'#CBD5E1', fontWeight:'700', fontSize:'13px', cursor: has?'pointer':'not-allowed', textDecoration:!has?'line-through':'none', fontFamily:f, transition:'all 0.15s' }}>
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div style={{ marginBottom:'18px' }}>
                <span style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', display:'block', marginBottom:'10px' }}>Color</span>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {colors.map(color => (
                    <button key={color} className="size-btn" onClick={() => setSelColor(color)}
                      style={{ padding:'7px 16px', borderRadius:'0px', border:`2px solid ${selColor===color?'#ec4899':'#E2E8F0'}`, background: selColor===color?'#FFF0F9':'white', color: selColor===color?'#ec4899':'#374151', fontWeight:'700', fontSize:'13px', cursor:'pointer', fontFamily:f }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px' }}>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A' }}>Quantity</span>
              <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #E2E8F0', borderRadius:'0px', overflow:'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:'36px', height:'36px', background:'white', border:'none', cursor:'pointer', fontSize:'18px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>−</button>
                <span style={{ width:'38px', textAlign:'center', fontWeight:'800', fontSize:'14px', color:'#0F172A', borderLeft:'1px solid #E2E8F0', borderRight:'1px solid #E2E8F0', height:'36px', lineHeight:'36px' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(selVariant?.stock||10, q+1))} style={{ width:'36px', height:'36px', background:'white', border:'none', cursor:'pointer', fontSize:'18px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>+</button>
              </div>
            </div>

            {/* ── Myntra-style Delivery Options ── */}
            <DeliveryOptions />

            {/* Description */}
            <div style={{ marginBottom:'16px', padding:'14px', background:'#F8FAFC', borderRadius:'0px' }}>
              <h3 style={{ fontSize:'12px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Product Description</h3>
              <p style={{ fontSize:'13px', color:'#64748B', lineHeight:'1.75', margin:0 }}>{product.description}</p>
            </div>

            {/* Seller */}
            {product.seller && (
              <div style={{ padding:'12px 14px', background:'#F8FAFC', borderRadius:'0px', border:'1px solid #F1F5F9' }}>
                <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 3px' }}>Sold by</p>
                <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', margin:0 }}>{product.seller?.sellerDetails?.businessName || product.seller?.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom buttons — compact Myntra style */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', padding:'9px 16px', display:'flex', gap:'20px', justifyContent:'center', borderTop:'1px solid #E2E8F0', boxShadow:'0 -4px 16px rgba(0,0,0,0.08)', zIndex:30 }}>
        <button onClick={handleAddToCart} disabled={!inStock} className="action-btn"
          style={{ width:'250px', height:'40px', background:'white', color:inStock?'#ec4899':'#94A3B8', border:`1.5px solid ${inStock?'#ec4899':'#E2E8F0'}`, borderRadius:'0px', cursor:inStock?'pointer':'not-allowed', fontWeight:'700', fontSize:'12px', fontFamily:f, transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', letterSpacing:'0.05em', textTransform:'uppercase' }}>
          <span>🛍️</span> {inCart ? 'Added to Bag' : 'Add to Bag'}
        </button>
        <button onClick={() => { handleAddToCart(); if(inStock&&selSize) navigate('/checkout') }} disabled={!inStock} className="action-btn"
          style={{ width:'250px', height:'40px', background:inStock?'linear-gradient(135deg,#ec4899,#f97316)':'#E2E8F0', color:inStock?'white':'#94A3B8', border:'none', borderRadius:'0px', cursor:inStock?'pointer':'not-allowed', fontWeight:'700', fontSize:'12px', fontFamily:f, boxShadow:inStock?'0 3px 10px rgba(236,72,153,0.3)':'none', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', letterSpacing:'0.05em', textTransform:'uppercase' }}>
          <span>🤩</span> Buy Now
        </button>
      </div>
    </div>
  )
}