import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'

const f = 'Poppins, sans-serif'

export default function CartPage() {
 const { t } = useTranslation()

  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, totalAmount, totalMRP, totalSavings } = useCartStore()
  const { user } = useAuthStore()

  const total    = totalAmount()
  const mrp      = totalMRP()
  const savings  = totalSavings()
  const WEIGHT_SLABS = [
  { maxG: 500,   mid: 47  },
  { maxG: 1000,  mid: 70  },
  { maxG: 1500,  mid: 97  },
  { maxG: 2000,  mid: 130 },
  { maxG: 3000,  mid: 175 },
  { maxG: 5000,  mid: 237 },
  { maxG: 10000, mid: 335 },
]

const totalWeightG = items.reduce((acc, item) => {
  const w = item.shippingWeight || 500
  return acc + w * item.quantity
}, 0)

const calcShipping = (weightG, subtotal) => {
  if (subtotal >= 499) return 0
  const rounded = Math.ceil(Math.max(weightG, 100) / 500) * 500
  const slab = WEIGHT_SLABS.find(s => rounded <= s.maxG) || WEIGHT_SLABS[WEIGHT_SLABS.length - 1]
  return slab.mid
}

const shipping = calcShipping(totalWeightG, total)

  if (items.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: f }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg,#FDF0F8,#F5F0FF)', borderRadius: '0%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '44px' }}>🛒</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A1A2E', margin: '0 0 8px' }}>{t('emptyCart')}</h2>
        <p style={{ color: '#94A3B8', margin: '0 0 28px', fontSize: '14px' }}>Add some garments to get started</p>
        <button onClick={() => navigate('/home')}
          style={{ padding: '13px 32px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: f, boxShadow: '0 6px 20px rgba(233,30,140,0.3)' }}>
          Browse Products
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9FB', fontFamily: f }}>

      {/* Header */}
      <header style={{ background: 'white', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #EBEBF0', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/home')} style={{ background: '#F9F9FB', border: '1px solid #EBEBF0', width: '36px', height: '36px', borderRadius: '0%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A2E', margin: 0, flex: 1 }}>{t('yourCart')}</h1>
        <span style={{ fontSize: '12px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', padding: '3px 10px', borderRadius: '0px', fontWeight: '700' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>

        {/* Free delivery banner */}
        {shipping > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#FDF0F8,#F5F0FF)', border: '1px solid #DDD6FE', borderRadius: '0px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🚚</span>
            <p style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '600', margin: 0 }}>{t('addMoreForFreeDelivery', { amount: 499 - total })}</p>
          </div>
        )}
        {shipping === 0 && (
          <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '1px solid #BBF7D0', borderRadius: '0px', padding: '12px 16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: '700', margin: 0 }}>You've unlocked FREE delivery!</p>
          </div>
        )}

        {/* Cart items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ background: 'white', borderRadius: '0px', padding: '14px', display: 'flex', gap: '12px', border: '1px solid #EBEBF0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Image */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={item.image} alt={item.title}
                  style={{ width: '80px', height: '96px', objectFit: 'cover', borderRadius: '0px', background: '#F1F5F9', display: 'block' }}
                  onError={e => { e.target.style.background = '#F1F5F9'; e.target.src = '' }} />
                {item.mrp > item.price && (
                  <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px' }}>
                    {Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                  </span>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 4px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {item.size && <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#4B4B6B', padding: '3px 8px', borderRadius: '0px', fontWeight: '700' }}>Size: {item.size}</span>}
                  {item.color && <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#4B4B6B', padding: '3px 8px', borderRadius: '0px', fontWeight: '700' }}>{item.color}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1A1A2E' }}>₹{item.price}</span>
                    {item.mrp > item.price && <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>₹{item.mrp}</span>}
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#F9F9FB', borderRadius: '0px', border: '1px solid #EBEBF0', overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      style={{ width: '30px', height: '30px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#E91E8C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: '28px', textAlign: 'center', fontWeight: '800', fontSize: '13px', color: '#1A1A2E' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      style={{ width: '30px', height: '30px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#E91E8C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
              </div>

              {/* Remove */}
              <button onClick={() => removeItem(item.productId, item.size, item.color)}
                style={{ background: '#FEE2E2', border: 'none', width: '28px', height: '28px', borderRadius: '0px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', flexShrink: 0, color: '#DC2626', fontSize: '12px', fontWeight: '800' }}>✕</button>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div style={{ background: 'white', borderRadius: '0px', padding: '20px', marginBottom: '14px', border: '1px solid #EBEBF0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: '800', color: '#1A1A2E', margin: '0 0 16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span> {t('priceDetails')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: `MRP (${items.reduce((s, i) => s + i.quantity, 0)} items)`, val: `₹${mrp.toLocaleString('en-IN')}`, muted: true },
              savings > 0 ? { label: 'Discount', val: `− ₹${savings.toLocaleString('en-IN')}`, green: true } : null,
              { label: 'Delivery', val: shipping === 0 ? 'FREE' : `₹${shipping}`, green: shipping === 0 },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6B7280' }}>{row.label}</span>
                <span style={{ fontWeight: '600', color: row.green ? '#16A34A' : '#1A1A2E' }}>{row.val}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: '#EBEBF0', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#1A1A2E' }}>
              <span>{t('total')}</span>
              <span style={{ color: '#E91E8C' }}>₹{(total + shipping).toLocaleString('en-IN')}</span>
            </div>
          </div>
          {savings > 0 && (
            <div style={{ marginTop: '14px', background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '1px solid #BBF7D0', borderRadius: '0px', padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: '700', margin: 0 }}>🎊 You save ₹{savings.toLocaleString('en-IN')} on this order!</p>
            </div>
          )}
        </div>

        {/* Checkout button */}
        <button onClick={() => {
            if (!user) {
              navigate('/login?redirect=/checkout')
              return
            }
            navigate('/checkout')
          }}
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', border: 'none', borderRadius: '0px', cursor: 'pointer', fontWeight: '800', fontSize: '16px', fontFamily: f, boxShadow: '0 6px 20px rgba(233,30,140,0.3)', transition: 'all 0.2s' }}>
          {t('checkout')} — ₹{(total + shipping).toLocaleString('en-IN')}
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '10px', paddingBottom: '20px' }}>🔒 100% Secure · Encrypted payments</p>
      </div>
    </div>
  )
}