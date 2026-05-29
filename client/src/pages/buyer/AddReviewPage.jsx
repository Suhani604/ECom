import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { submitReviewAPI, editReviewAPI, checkOrderReviewsAPI } from '../../api/reviewAPI.js'
import { getMyOrdersAPI } from '../../api/orderAPI.js'

const f = 'Poppins, sans-serif'

const STAR_LABELS   = ['', 'Very Bad', 'Bad', 'Ok-Ok', 'Good', 'Very Good']
const STAR_MESSAGES = ['', 'Oh-no! We are sorry to hear that 😔', "We'll try to do better 🙏", 'Thanks for your feedback!', 'Glad you liked it! 😊', 'Awesome! You made our day! 🎉']
const LOW_REASONS   = [
  { icon: '👕', label: 'Product Quality Issues' },
  { icon: '📦', label: 'Wrong / Missing Product' },
  { icon: '🔧', label: 'Defective / Damaged Product' },
  { icon: '💬', label: 'Other Reasons' },
]

export default function AddReviewPage() {
  const navigate  = useNavigate()
  const { orderId, productId } = useParams()

  const [step,           setStep]       = useState(1)   // 1=Rating, 2=Photos, 3=Comment
  const [rating,         setRating]     = useState(0)
  const [hovered,        setHovered]    = useState(0)
  const [selectedReason, setReason]     = useState('')
  const [images,         setImages]     = useState([])  // base64 previews (upload to cloudinary yourself)
  const [comment,        setComment]    = useState('')
  const [title,          setTitle]      = useState('')
  const [loading,        setLoading]    = useState(false)
  const [existingReview, setExisting]   = useState(null)
  const [orderItem,      setOrderItem]  = useState(null)

  // Load order item info + check if already reviewed
  useEffect(() => {
    const init = async () => {
      try {
        const [ordersRes, checkRes] = await Promise.all([
          getMyOrdersAPI({ page: 1, limit: 50 }),
          checkOrderReviewsAPI(orderId),
        ])
        const order = ordersRes.data.data?.find(o => o._id === orderId)
        if (order) {
          const item = order.items?.find(i => i.product === productId || i.product?._id === productId)
          setOrderItem(item)
        }
        const existing = checkRes.data.reviews?.find(r => r.product === productId || r.product?._id === productId)
        if (existing) {
          setExisting(existing)
          setRating(existing.rating)
        }
      } catch { /* silent */ }
    }
    init()
  }, [orderId, productId])

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setImages(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating')
    setLoading(true)
    try {
      const payload = { orderId, productId, rating, title, comment, images }
      if (existingReview?._id) {
        await editReviewAPI(existingReview._id, { rating, title, comment, images })
      } else {
        await submitReviewAPI(payload)
      }
      toast.success(existingReview ? 'Review updated!' : 'Review submitted! 🎉')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally { setLoading(false) }
  }

  const activeRating = hovered || rating

  // ── STEP HEADER ──
  const steps = ['Rating', 'Photos & Videos', 'Comment']

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: f, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: 'white', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#0F172A' }}>←</button>
        <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {existingReview ? 'Edit Review' : 'Add Feedback'}
        </h1>
      </div>

      {/* Step indicator */}
      <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
          {steps.map((s, i) => {
            const idx   = i + 1
            const done  = step > idx
            const active = step === idx
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    background: done ? '#10B981' : active ? 'white' : 'white',
                    color: done ? 'white' : active ? '#3B82F6' : '#94A3B8',
                    border: done ? '2px solid #10B981' : active ? '2px solid #3B82F6' : '2px solid #E2E8F0',
                  }}>
                    {done ? '✓' : idx}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: active ? '#3B82F6' : done ? '#10B981' : '#94A3B8', whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: '60px', height: '2px', background: step > idx ? '#10B981' : '#E2E8F0', margin: '0 4px', marginBottom: '18px' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── STEP 1: RATING ─── */}
      {step === 1 && (
        <div style={{ flex: 1, padding: '24px 16px' }}>

          {/* Product info */}
          {orderItem && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '14px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <img src={orderItem.image} alt="" style={{ width: '52px', height: '64px', objectFit: 'cover', borderRadius: '8px', background: '#F1F5F9', flexShrink: 0 }} onError={e => { e.target.style.background = '#F1F5F9' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderItem.title}</p>
                {orderItem.size && <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Size: {orderItem.size}</p>}
              </div>
            </div>
          )}

          {/* Stars */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill={i <= activeRating ? '#EF4444' : 'none'} stroke={i <= activeRating ? '#EF4444' : '#CBD5E1'} strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span style={{ fontSize: '10px', color: i <= activeRating ? '#EF4444' : '#94A3B8', fontWeight: '600' }}>{STAR_LABELS[i]}</span>
                </div>
              ))}
            </div>

            {activeRating > 0 && (
              <p style={{ fontSize: '13px', color: activeRating <= 2 ? '#EF4444' : activeRating === 3 ? '#F59E0B' : '#10B981', fontWeight: '500', margin: '8px 0 0' }}>
                {STAR_MESSAGES[activeRating]}
              </p>
            )}
          </div>

          {/* Low-rating reasons */}
          {activeRating > 0 && activeRating <= 2 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 14px' }}>Tell us more about the Product</p>
              {LOW_REASONS.map(r => (
                <div key={r.label} onClick={() => setReason(r.label)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: `1.5px solid ${selectedReason === r.label ? '#3B82F6' : '#E2E8F0'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '10px', background: selectedReason === r.label ? '#EFF6FF' : 'white', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '22px' }}>{r.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{r.label}</span>
                  </div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${selectedReason === r.label ? '#3B82F6' : '#CBD5E1'}`, background: selectedReason === r.label ? '#3B82F6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedReason === r.label && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { if (!rating) return toast.error('Please select a rating'); setStep(2) }}
            style={{ width: '100%', padding: '14px', background: rating ? 'linear-gradient(135deg,#ec4899,#f97316)' : '#F1F5F9', color: rating ? 'white' : '#94A3B8', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: rating ? 'pointer' : 'not-allowed', fontFamily: f }}>
            Next →
          </button>
        </div>
      )}

      {/* ─── STEP 2: PHOTOS & VIDEOS ─── */}
      {step === 2 && (
        <div style={{ flex: 1, padding: '24px 16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px' }}>Add Photos</p>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px' }}>Help others with your experience (optional)</p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {images.length < 5 && (
                <label style={{ width: '80px', height: '80px', border: '2px dashed #E2E8F0', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                  <span style={{ fontSize: '24px', color: '#94A3B8' }}>+</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>Add photo</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAdd} />
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)}
              style={{ flex: 1, padding: '14px', background: 'white', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: f }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)}
              style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg,#ec4899,#f97316)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: f }}>
              Next →
            </button>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: f, marginTop: '8px' }}>
            {loading ? 'Submitting...' : 'Skip & Submit'}
          </button>
        </div>
      )}

      {/* ─── STEP 3: COMMENT ─── */}
      {step === 3 && (
        <div style={{ flex: 1, padding: '24px 16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>

            {/* Rating summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i <= rating ? '#F59E0B' : 'none'} stroke={i <= rating ? '#F59E0B' : '#CBD5E1'} strokeWidth="1.5">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', marginLeft: '4px' }}>{STAR_LABELS[rating]}</span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Review Title (optional)</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience..."
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: f, boxSizing: 'border-box', background: '#FAFAFA' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Your Review (optional)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Tell others what you think about this product..."
                rows={5}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: f, boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA' }} />
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0', textAlign: 'right' }}>{comment.length}/500</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(2)}
              style={{ flex: 1, padding: '14px', background: 'white', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: f }}>
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 2, padding: '14px', background: loading ? '#F1F5F9' : 'linear-gradient(135deg,#ec4899,#f97316)', color: loading ? '#94A3B8' : 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: f }}>
              {loading ? 'Submitting...' : existingReview ? 'Update Review ✓' : 'Submit Review ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}