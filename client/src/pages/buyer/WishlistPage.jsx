import { useNavigate } from 'react-router-dom'
import useWishlistStore from '../../context/useWishlistStore.js'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = 'Poppins, sans-serif'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, toggleItem } = useWishlistStore()
  const { addItem } = useCartStore()

  const handleMoveToBag = (product) => {
  addItem({
    productId: product._id,        // ← cart uses productId
    title:     product.title,
    image:     product.images?.[0],
    size:      null,               // no size selected from wishlist
    color:     null,
    quantity:  1,
    price:     product.sellingPrice,
    mrp:       product.mrp,
    sellerId:  product.sellerId,
  })
  toggleItem(product)              // remove from wishlist after adding to cart
}
  const handleRemove = (product) => {
    toggleItem(product)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', fontFamily: f }}>

      {/* ── Navbar ── */}
      <nav style={{ background: 'white', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>S</span>
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '15px', color: '#E91E8C', margin: 0, lineHeight: 1 }}>Style<span style={{ color: '#7C3AED' }}>Hub</span></p>
            <p style={{ fontSize: '9px', color: '#94A3B8', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Fashion Store</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Profile</span>
          </button>
          <button onClick={() => navigate('/wishlist')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#E91E8C" stroke="#E91E8C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#E91E8C' }}>Wishlist</span>
          </button>
          <button onClick={() => navigate('/cart')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: f, padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#282C3F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F' }}>Bag</span>
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#282C3F', margin: 0 }}>
            My Wishlist <span style={{ fontWeight: '400', color: '#94A3B8' }}>{items.length} items</span>
          </h1>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🤍</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#282C3F', margin: '0 0 8px' }}>Your wishlist is empty</h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', margin: '0 0 24px' }}>Save items you love by clicking the heart icon</p>
            <button onClick={() => navigate('/home')}
              style={{ padding: '12px 32px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: f, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {items.map((product) => {
              const disc = product.mrp > product.sellingPrice
                ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
              const isOutOfStock = product.stock === 0 || product.outOfStock

              return (
                <div key={product._id}
                  style={{ background: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid #EBEBF0', position: 'relative', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                  {/* Remove × button */}
                  <button onClick={() => handleRemove(product)}
                    style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: '14px', color: '#6B7280', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                    ×
                  </button>

                  {/* Product image */}
                  <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/product/${product._id}`)}>
                    <img src={product.images?.[0]} alt={product.title}
                      style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block', background: '#F8FAFC' }}
                      onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', padding: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#E91E8C', letterSpacing: '0.5px' }}>OUT OF STOCK</span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ padding: '12px' }}>
                    {product.brand && (
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#282C3F', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>{product.brand}</p>
                    )}
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                      {product.title}
                    </p>

                    {/* Price row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#282C3F' }}>
                        Rs.{product.sellingPrice?.toLocaleString('en-IN')}
                      </span>
                      {disc > 0 && (
                        <>
                          <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            Rs.{product.mrp?.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#E91E8C' }}>
                            ({disc}% OFF)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action button */}
                    {isOutOfStock ? (
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        style={{ width: '100%', padding: '10px', background: 'white', color: '#E91E8C', border: '1px solid #E91E8C', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: f, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        SHOW SIMILAR
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMoveToBag(product)}
                        style={{ width: '100%', padding: '10px', background: 'white', color: '#E91E8C', border: '1px solid #E91E8C', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: f, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.target.style.background = '#E91E8C'; e.target.style.color = 'white' }}
                        onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = '#E91E8C' }}>
                        MOVE TO BAG
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}