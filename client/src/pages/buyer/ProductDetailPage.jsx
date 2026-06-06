import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'
import { getCurrentLocation, isGeolocationAvailable } from '../../utils/geolocation.js'

const f = 'Poppins, sans-serif'

// ── Delivery Options — fixed: handles 304 cache + local fallback ───────────────
function DeliveryOptions() {
  const [pincode,  setPincode]  = useState('')
  const [checking, setChecking] = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [geoLoading,  setGeoLoading]  = useState(false)
const [geoDetected, setGeoDetected] = useState(null)

  const PINCODE_DB = {
    110: { state: 'Delhi',             district: 'New Delhi' },
    400: { state: 'Maharashtra',       district: 'Mumbai' },
    401: { state: 'Maharashtra',       district: 'Mumbai Suburban' },
    402: { state: 'Maharashtra',       district: 'Raigad' },
    410: { state: 'Maharashtra',       district: 'Pune' },
    411: { state: 'Maharashtra',       district: 'Pune' },
    412: { state: 'Maharashtra',       district: 'Pune' },
    413: { state: 'Maharashtra',       district: 'Solapur' },
    414: { state: 'Maharashtra',       district: 'Ahmednagar' },
    415: { state: 'Maharashtra',       district: 'Satara' },
    416: { state: 'Maharashtra',       district: 'Kolhapur' },
    421: { state: 'Maharashtra',       district: 'Thane' },
    422: { state: 'Maharashtra',       district: 'Nashik' },
    423: { state: 'Maharashtra',       district: 'Nashik' },
    424: { state: 'Maharashtra',       district: 'Dhule' },
    425: { state: 'Maharashtra',       district: 'Jalgaon' },
    426: { state: 'Maharashtra',       district: 'Buldhana' },
    427: { state: 'Maharashtra',       district: 'Akola' },
    428: { state: 'Maharashtra',       district: 'Washim' },
    431: { state: 'Maharashtra',       district: 'Aurangabad' },
    432: { state: 'Maharashtra',       district: 'Aurangabad' },
    440: { state: 'Maharashtra',       district: 'Nagpur' },
    441: { state: 'Maharashtra',       district: 'Nagpur' },
    442: { state: 'Maharashtra',       district: 'Wardha' },
    443: { state: 'Maharashtra',       district: 'Buldhana' },
    444: { state: 'Maharashtra',       district: 'Amravati' },
    445: { state: 'Maharashtra',       district: 'Yavatmal' },
    452: { state: 'Madhya Pradesh',    district: 'Indore' },
    462: { state: 'Madhya Pradesh',    district: 'Bhopal' },
    474: { state: 'Madhya Pradesh',    district: 'Gwalior' },
    482: { state: 'Madhya Pradesh',    district: 'Jabalpur' },
    492: { state: 'Chhattisgarh',      district: 'Raipur' },
    500: { state: 'Telangana',         district: 'Hyderabad' },
    501: { state: 'Telangana',         district: 'Ranga Reddy' },
    515: { state: 'Andhra Pradesh',    district: 'Anantapur' },
    520: { state: 'Andhra Pradesh',    district: 'Krishna' },
    530: { state: 'Andhra Pradesh',    district: 'Visakhapatnam' },
    560: { state: 'Karnataka',         district: 'Bangalore Urban' },
    570: { state: 'Karnataka',         district: 'Mysore' },
    580: { state: 'Karnataka',         district: 'Dharwad' },
    600: { state: 'Tamil Nadu',        district: 'Chennai' },
    620: { state: 'Tamil Nadu',        district: 'Tiruchirappalli' },
    625: { state: 'Tamil Nadu',        district: 'Madurai' },
    641: { state: 'Tamil Nadu',        district: 'Coimbatore' },
    670: { state: 'Kerala',            district: 'Kannur' },
    680: { state: 'Kerala',            district: 'Thrissur' },
    682: { state: 'Kerala',            district: 'Ernakulam' },
    695: { state: 'Kerala',            district: 'Thiruvananthapuram' },
    700: { state: 'West Bengal',       district: 'Kolkata' },
    711: { state: 'West Bengal',       district: 'Howrah' },
    751: { state: 'Odisha',            district: 'Bhubaneswar' },
    781: { state: 'Assam',             district: 'Guwahati' },
    800: { state: 'Bihar',             district: 'Patna' },
    826: { state: 'Jharkhand',         district: 'Dhanbad' },
    834: { state: 'Jharkhand',         district: 'Ranchi' },
    302: { state: 'Rajasthan',         district: 'Jaipur' },
    313: { state: 'Rajasthan',         district: 'Udaipur' },
    342: { state: 'Rajasthan',         district: 'Jodhpur' },
    380: { state: 'Gujarat',           district: 'Ahmedabad' },
    390: { state: 'Gujarat',           district: 'Vadodara' },
    394: { state: 'Gujarat',           district: 'Surat' },
    141: { state: 'Punjab',            district: 'Ludhiana' },
    143: { state: 'Punjab',            district: 'Amritsar' },
    160: { state: 'Chandigarh',        district: 'Chandigarh' },
    201: { state: 'Uttar Pradesh',     district: 'Gautam Buddha Nagar' },
    208: { state: 'Uttar Pradesh',     district: 'Kanpur Nagar' },
    211: { state: 'Uttar Pradesh',     district: 'Prayagraj' },
    221: { state: 'Uttar Pradesh',     district: 'Varanasi' },
    226: { state: 'Uttar Pradesh',     district: 'Lucknow' },
    250: { state: 'Uttar Pradesh',     district: 'Meerut' },
    282: { state: 'Uttar Pradesh',     district: 'Agra' },
    248: { state: 'Uttarakhand',       district: 'Dehradun' },
    122: { state: 'Haryana',           district: 'Gurgaon' },
    132: { state: 'Haryana',           district: 'Karnal' },
    180: { state: 'Jammu & Kashmir',   district: 'Jammu' },
    190: { state: 'Jammu & Kashmir',   district: 'Srinagar' },
    403: { state: 'Goa',               district: 'North Goa' },
    737: { state: 'Sikkim',            district: 'East Sikkim' },
    744: { state: 'Andaman and Nicobar', district: 'South Andaman' },
    795: { state: 'Manipur',           district: 'Imphal East' },
    796: { state: 'Mizoram',           district: 'Aizawl' },
    797: { state: 'Nagaland',          district: 'Kohima' },
    799: { state: 'Tripura',           district: 'West Tripura' },
    793: { state: 'Meghalaya',         district: 'East Khasi Hills' },
  }

  const METROS = new Set([
    'Mumbai', 'New Delhi', 'Bangalore Urban', 'Chennai', 'Hyderabad',
    'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Nagpur',
    'Lucknow', 'Chandigarh', 'Gurgaon',
  ])

  const NO_COD = new Set(['Andaman and Nicobar', 'Lakshadweep'])

  const localLookup = (pin) => {
    const prefix = parseInt(pin.slice(0, 3))
    const entry  = PINCODE_DB[prefix]
    if (!entry) return null
    const { state, district } = entry
    const isMetro      = METROS.has(district)
    const deliveryDays = isMetro ? 2 : 4
    const deliveryDate = new Date(Date.now() + deliveryDays * 86400000)
      .toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    return {
      available:    true,
      pincode:      pin,
      state,
      district,
      deliveryDate,
      deliveryDays,
      codAvailable: !NO_COD.has(state),
      areas:        [],
      message:      `Delivery available in ${district}, ${state}`,
    }
  }

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setError('Please enter a valid 6-digit pincode')
      return
    }
    setError('')
    setChecking(true)
    setResult(null)

    try {
      const { data } = await api.get(`/orders/check-pincode?pincode=${pincode}`, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })

      const payload = data?.data

      if (payload && typeof payload.available !== 'undefined') {
        setResult(payload)
        return
      }

      const local = localLookup(pincode)
      if (local) { setResult(local); return }

      setResult({ available: false, pincode, message: 'Pincode not serviceable.' })

    } catch {
      const local = localLookup(pincode)
      if (local) {
        setResult(local)
      } else {
        setError('Could not check pincode. Please try again.')
      }
    } finally {
      setChecking(false)
    }
  }
      const detectLocation = async () => {
        if (!isGeolocationAvailable()) {
          setError('Geolocation not supported by your browser')
          return
        }
        setGeoLoading(true)
        setError('')
        setResult(null)
        try {
          const { latitude, longitude, accuracy } = await getCurrentLocation()

          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const addr = data.address || {}

          const road      = addr.road || addr.pedestrian || addr.footway || ''
          const suburb    = addr.suburb || addr.neighbourhood || addr.quarter || ''
          const village   = addr.village || addr.town || ''
          const city      = addr.city || addr.town || addr.village || addr.county || ''
          const district  = addr.state_district || addr.county || city
          const state     = addr.state || ''
          const pin       = addr.postcode?.replace(/\s/g, '').slice(0, 6)

          const parts       = [road, suburb, village, city].filter(Boolean)
          const uniqueParts = [...new Set(parts)]
          const fullAddress = uniqueParts.join(', ') + (pin ? ` - ${pin}` : '') + (state ? `, ${state}` : '')

          setGeoDetected({
            lat: latitude,
            lon: longitude,
            accuracy: Math.round(accuracy),
            address: fullAddress,
            district,
            state,
          })

          if (pin && /^\d{6}$/.test(pin)) {
            setPincode(pin)
            setChecking(true)
            try {
              const { data: apiData } = await api.get(
                `/orders/check-pincode?pincode=${pin}`,
                { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } }
              )
              const payload = apiData?.data
              if (payload && typeof payload.available !== 'undefined') {
                setResult(payload)
              } else {
                setResult(localLookup(pin) || { available: false, pincode: pin, message: 'Pincode not serviceable.' })
              }
            } catch {
              setResult(localLookup(pin) || { available: false, pincode: pin, message: 'Could not check pincode.' })
            } finally {
              setChecking(false)
            }
          } else {
            setError('Pincode detect झाला नाही. Manual enter करा.')
          }
        } catch (err) {
          setError(err.message || 'Location fetch failed.')
        } finally {
          setGeoLoading(false)
        }
      }
  const handleKey = e => { if (e.key === 'Enter') check() }

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px', background: '#FAFAFA' }}>
        <span>🚚</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Options</span>
      </div>
      <div style={{ padding: '14px 16px', borderBottom: result || error ? '1px solid #F1F5F9' : 'none' }}>
       {/* Detect Location Button */}
<button
  onClick={detectLocation}
  disabled={geoLoading}
  style={{
    width: '100%', padding: '9px', marginBottom: '10px',
    background: geoLoading ? '#F1F5F9' : '#EFF6FF',
    border: '1.5px dashed #93C5FD', borderRadius: '8px',
    cursor: geoLoading ? 'not-allowed' : 'pointer',
    fontSize: '12px', fontWeight: '700', color: '#2563EB',
    fontFamily: f, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px',
  }}>
  {geoLoading
    ? <><span style={{ display:'inline-block', width:'12px', height:'12px', border:'2px solid #2563EB', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/> Detecting location...</>
    : <>📍 Use my current location</>
  }
</button>

{/* Location Captured UI */}
{geoDetected && (
  <div style={{
    marginBottom: '10px', padding: '10px 14px',
    background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
      <span style={{ fontSize:'16px' }}>✅</span>
      <span style={{ fontSize:'13px', fontWeight:'700', color:'#15803D' }}>Location captured</span>
    </div>
    <p style={{ fontSize:'12px', color:'#374151', margin:'0 0 2px', fontWeight:'600' }}>
      📍 {geoDetected.address}
    </p>
    <p style={{ fontSize:'11px', color:'#64748B', margin:0 }}>
      {geoDetected.lat.toFixed(6)}°N, {geoDetected.lon.toFixed(6)}°E · Accuracy: ±{geoDetected.accuracy}m
    </p>
    <button
      onClick={() => { setGeoDetected(null); setResult(null); setPincode('') }}
      style={{ marginTop:'6px', fontSize:'11px', color:'#2563EB', background:'none', border:'none', cursor:'pointer', fontWeight:'600', padding:0, fontFamily:f }}>
      🔄 Refresh Location
    </button>
  </div>
)}

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: `1.5px solid ${error ? '#ef4444' : '#CBD5E1'}`, borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <span style={{ padding: '0 10px', fontSize: '16px' }}>📍</span>
            <input
              value={pincode}
              onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setResult(null); setError('') }}
              onKeyDown={handleKey}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontWeight: '600', color: '#0F172A', padding: '10px 0', background: 'transparent', fontFamily: f }}
            />
          </div>
          <button
            onClick={check}
            disabled={pincode.length !== 6 || checking}
            style={{ padding: '10px 20px', background: pincode.length === 6 && !checking ? '#ec4899' : '#E2E8F0', color: pincode.length === 6 && !checking ? 'white' : '#94A3B8', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: pincode.length === 6 ? 'pointer' : 'not-allowed', fontFamily: f, whiteSpace: 'nowrap', minWidth: '72px', transition: 'all 0.2s' }}>
            {checking
              ? <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : 'Check'}
          </button>
        </div>
        {error && <p style={{ fontSize: '11px', color: '#ef4444', margin: '6px 0 0', fontWeight: '600' }}>{error}</p>}
      </div>

      {result?.available && (
        <div style={{ padding: '4px 0' }}>
          {[
            { icon: '✅', text: `Delivery available in ${result.district || result.city || result.state}`, bold: true,  color: '#15803D', bg: '#F0FDF4' },
            { icon: '📅', text: `Get it by ${result.deliveryDate} (${result.deliveryDays} day${result.deliveryDays > 1 ? 's' : ''})`, bold: true, color: '#0F172A', bg: 'white' },
            ...(result.codAvailable
              ? [{ icon: '💵', text: 'Cash on Delivery available',          bold: false, color: '#374151', bg: 'white'    }]
              : [{ icon: '🚫', text: 'COD not available for this pincode',  bold: false, color: '#DC2626', bg: '#FFF1F2' }]
            ),
            { icon: '↩️', text: 'Easy 7-day return & exchange', bold: false, color: '#374151', bg: 'white' },
            { icon: '✅', text: '100% Original Products',       bold: false, color: '#374151', bg: 'white' },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 16px', background: row.bg, borderBottom: i < arr.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: row.bold ? '700' : '500', color: row.color }}>{row.text}</span>
            </div>
          ))}
          {result.areas?.length > 0 && (
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 16px', background: '#FAFBFF' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                📮 Delivery areas in {pincode}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.areas.map((area, i) => (
                  <span key={i} style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '99px', color: '#374151' }}>
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && !result.available && (
        <div style={{ padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#FFF1F2', borderBottom: '1px solid #F8FAFC' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#BE123C', margin: '0 0 2px' }}>Delivery not available</p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{result.message}</p>
            </div>
          </div>
          {[
            { icon: '↩️', text: 'Easy 7-day return & exchange' },
            { icon: '✅', text: '100% Original Products' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 16px', borderBottom: i === 0 ? '1px solid #F8FAFC' : 'none' }}>
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>{row.text}</span>
            </div>
          ))}
        </div>
      )}

      {!result && !checking && (
        <div style={{ padding: '4px 0' }}>
          {[
            { icon: '↩️', text: 'Easy 7-day return & exchange' },
            { icon: '✅', text: '100% Original Products' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 16px', borderBottom: i === 0 ? '1px solid #F8FAFC' : 'none' }}>
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>{row.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Stars ──────────────────────────────────────────────────────────────────────
function Stars({ rating, size=14, interactive=false, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <span style={{display:'inline-flex',gap:'3px'}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i}
          onClick={()=>interactive&&onRate&&onRate(i)}
          onMouseEnter={()=>interactive&&setHover(i)}
          onMouseLeave={()=>interactive&&setHover(0)}
          style={{fontSize:`${size}px`,color:(interactive?(hover||rating):rating)>=i?'#f59e0b':'#E2E8F0',lineHeight:1,cursor:interactive?'pointer':'default',transition:'color 0.1s'}}>★</span>
      ))}
    </span>
  )
}

// ── Quick Review Modal — buyer can rate directly from product page ─────────────
function QuickReviewModal({ productId, productTitle, onClose, onSubmitted }) {
  const navigate = useNavigate()
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [title,   setTitle]   = useState('')
  const [hover,   setHover]   = useState(0)
  const [loading, setLoading] = useState(false)

  const LABELS = ['', 'Very Bad', 'Bad', 'Ok-Ok', 'Good', 'Very Good']

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating')
    setLoading(true)
    try {
      await api.post('/reviews', { productId, rating, title, comment })
      toast.success('Review submitted! 🎉')
      onSubmitted()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={onClose}>
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0F172A', margin:0 }}>Write a Review</h3>
            <p style={{ fontSize:'12px', color:'#94A3B8', margin:'3px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'280px' }}>{productTitle}</p>
          </div>
          <button onClick={onClose} style={{ background:'#F1F5F9', border:'none', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B' }}>×</button>
        </div>

        {/* Stars */}
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'8px' }}>
          {[1,2,3,4,5].map(i => (
            <span key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              style={{ fontSize:'36px', cursor:'pointer', color: i <= (hover||rating) ? '#f59e0b' : '#E2E8F0', transition:'color 0.1s, transform 0.1s', transform: i <= (hover||rating) ? 'scale(1.15)' : 'scale(1)', display:'inline-block' }}>★</span>
          ))}
        </div>
        {(hover||rating) > 0 && (
          <p style={{ textAlign:'center', fontSize:'13px', fontWeight:'600', color: (hover||rating) <= 2 ? '#ef4444' : (hover||rating) === 3 ? '#f59e0b' : '#16a34a', margin:'0 0 16px' }}>
            {LABELS[hover||rating]}
          </p>
        )}

        {/* Title */}
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', outline:'none', fontFamily:f, boxSizing:'border-box', marginBottom:'10px', background:'#FAFAFA' }} />

        {/* Comment */}
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={3}
          style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', outline:'none', fontFamily:f, boxSizing:'border-box', resize:'vertical', background:'#FAFAFA', marginBottom:'16px' }} />

        {/* Buttons */}
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'12px', background:'white', color:'#64748B', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:f }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || !rating}
            style={{ flex:2, padding:'12px', background: rating && !loading ? 'linear-gradient(135deg,#ec4899,#f97316)' : '#F1F5F9', color: rating && !loading ? 'white' : '#94A3B8', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'700', cursor: rating && !loading ? 'pointer' : 'not-allowed', fontFamily:f }}>
            {loading ? 'Submitting...' : 'Submit Review ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reviews Section ────────────────────────────────────────────────────────────
function ReviewsSection({ productId, productTitle }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [reviews,      setReviews]      = useState([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(1)
  const [breakdown,    setBreakdown]    = useState({})
  const [error,        setError]        = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const LIMIT = 5

  const fetchReviews = () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    api.get(`/reviews/product/${productId}`, { params: { page, limit: LIMIT } })
      .then(({ data }) => {
        setReviews(data.reviews || [])
        setTotal(data.total || 0)
        const map = {}
        ;(data.breakdown || []).forEach(b => { map[b._id] = b.count })
        setBreakdown(map)
      })
      .catch(err => {
        console.error('Reviews fetch error:', err)
        setError('Could not load reviews')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [productId, page])

  const totalPages  = Math.ceil(total / LIMIT)
  const totalCount  = Object.values(breakdown).reduce((a,b)=>a+b, 0)
  const weightedSum = Object.entries(breakdown).reduce((a,[star,cnt])=>a+(parseInt(star)*cnt), 0)
  const avgRating   = totalCount > 0 ? weightedSum / totalCount : 0

  const handleWriteReview = () => {
    if (!user) { navigate('/login'); return }
    setShowModal(true)
  }

  return (
    <>
      {showModal && (
        <QuickReviewModal
          productId={productId}
          productTitle={productTitle}
          onClose={() => setShowModal(false)}
          onSubmitted={() => { setPage(1); fetchReviews() }}
        />
      )}

      <div style={{marginTop:'24px'}}>
        {/* Header with Write Review button */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',background:'#FAFAFA',border:'1px solid #E2E8F0',borderRadius:'12px 12px 0 0'}}>
          <h3 style={{fontSize:'13px',fontWeight:'800',color:'#0F172A',margin:0,textTransform:'uppercase',letterSpacing:'0.06em'}}>⭐ Ratings & Reviews</h3>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            {total > 0 && <span style={{fontSize:'12px',color:'#94A3B8',fontWeight:'600'}}>{total} review{total!==1?'s':''}</span>}
            {/* ── Write Review button — any logged-in buyer can rate ── */}
            <button onClick={handleWriteReview}
              style={{
                padding:'6px 14px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:f,
                background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white',
                border:'none', borderRadius:'20px',
                boxShadow:'0 2px 10px rgba(236,72,153,0.35)',
                transition:'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 16px rgba(236,72,153,0.45)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 10px rgba(236,72,153,0.35)'}}>
              ✍️ Write Review
            </button>
          </div>
        </div>

        <div style={{border:'1px solid #E2E8F0',borderTop:'none',borderRadius:'0 0 12px 12px',overflow:'hidden'}}>
          {loading ? (
            <div style={{padding:'32px',textAlign:'center'}}>
              <div style={{width:'28px',height:'28px',border:'3px solid #ec4899',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto'}}/>
              <p style={{fontSize:'12px',color:'#94A3B8',marginTop:'10px'}}>Loading reviews...</p>
            </div>
          ) : error ? (
            <div style={{padding:'28px',textAlign:'center'}}>
              <p style={{fontSize:'13px',color:'#ef4444'}}>{error}</p>
            </div>
          ) : total === 0 ? (
            <div style={{padding:'36px 20px',textAlign:'center',background:'white'}}>
              <div style={{fontSize:'40px',marginBottom:'10px'}}>⭐</div>
              <p style={{fontSize:'14px',fontWeight:'700',color:'#0F172A',margin:'0 0 4px'}}>No reviews yet</p>
              <p style={{fontSize:'13px',color:'#94A3B8',margin:'0 0 16px'}}>Be the first to share your experience!</p>
              <button onClick={handleWriteReview}
                style={{padding:'10px 24px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'20px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:f,boxShadow:'0 4px 14px rgba(236,72,153,0.3)'}}>
                ✍️ Write the First Review
              </button>
            </div>
          ) : (
            <>
              <div style={{padding:'20px 18px',borderBottom:'1px solid #F1F5F9',display:'flex',gap:'24px',alignItems:'center',background:'#FAFFFD'}}>
                <div style={{textAlign:'center',flexShrink:0}}>
                  <p style={{fontSize:'46px',fontWeight:'900',color:'#0F172A',margin:0,lineHeight:1,letterSpacing:'-2px'}}>{avgRating.toFixed(1)}</p>
                  <Stars rating={avgRating} size={16}/>
                  <p style={{fontSize:'11px',color:'#94A3B8',margin:'5px 0 0',fontWeight:'600'}}>{totalCount} ratings</p>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:'5px'}}>
                  {[5,4,3,2,1].map(star=>{
                    const count=breakdown[star]||0; const pct=totalCount>0?(count/totalCount)*100:0
                    return (
                      <div key={star} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'11px',fontWeight:'700',color:'#64748B',width:'10px',textAlign:'right',flexShrink:0}}>{star}</span>
                        <span style={{color:'#f59e0b',fontSize:'11px',flexShrink:0}}>★</span>
                        <div style={{flex:1,height:'6px',background:'#F1F5F9',borderRadius:'3px',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${pct}%`,borderRadius:'3px',transition:'width 0.6s ease',background:star>=4?'#22c55e':star===3?'#f59e0b':'#ef4444'}}/>
                        </div>
                        <span style={{fontSize:'11px',color:'#94A3B8',width:'20px',flexShrink:0,fontWeight:'600'}}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {reviews.map((review, i) => (
                <div key={review._id} style={{padding:'16px 18px',borderBottom:i<reviews.length-1?'1px solid #F8FAFC':'none',background:'white'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#ec4899,#f97316)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'14px',fontWeight:'800',flexShrink:0}}>
                        {review.buyer?.name?.[0]?.toUpperCase()||'?'}
                      </div>
                      <div>
                        <p style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',margin:0}}>{review.buyer?.name||'Verified Buyer'}</p>
                        <p style={{fontSize:'11px',color:'#94A3B8',margin:0,fontWeight:'500'}}>
                          {new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                          {review.order && <span style={{marginLeft:'6px',background:'#F0FDF4',color:'#16a34a',padding:'1px 6px',borderRadius:'4px',fontSize:'10px',fontWeight:'700'}}>✓ Verified Purchase</span>}
                        </p>
                      </div>
                    </div>
                    <span style={{fontSize:'12px',fontWeight:'800',padding:'4px 10px',borderRadius:'20px',display:'flex',alignItems:'center',gap:'3px',flexShrink:0,
                      background:review.rating>=4?'#F0FDF4':review.rating===3?'#FFFBEB':'#FFF1F2',
                      color:review.rating>=4?'#15803D':review.rating===3?'#B45309':'#BE123C'}}>
                      ★ {review.rating}
                    </span>
                  </div>
                  <Stars rating={review.rating} size={13}/>
                  {review.title&&<p style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',margin:'8px 0 4px'}}>{review.title}</p>}
                  {review.comment&&<p style={{fontSize:'13px',color:'#475569',margin:'6px 0 0',lineHeight:'1.7'}}>{review.comment}</p>}
                  {review.images?.length>0&&(
                    <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
                      {review.images.map((img,idx)=>(
                        <img key={idx} src={img} alt="" onClick={()=>window.open(img,'_blank')}
                          style={{width:'64px',height:'64px',objectFit:'cover',borderRadius:'8px',border:'1px solid #E2E8F0',cursor:'pointer'}}
                          onError={e=>e.target.style.display='none'}/>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {totalPages > 1 && (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'14px',background:'#FAFAFA',borderTop:'1px solid #F1F5F9'}}>
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                    style={{padding:'7px 16px',border:'1.5px solid #E2E8F0',borderRadius:'8px',background:'white',cursor:page===1?'not-allowed':'pointer',opacity:page===1?0.4:1,fontSize:'12px',fontWeight:'600',fontFamily:f}}>← Prev</button>
                  <span style={{fontSize:'12px',color:'#64748B',fontWeight:'600'}}>{page} / {totalPages}</span>
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                    style={{padding:'7px 16px',border:'1.5px solid #E2E8F0',borderRadius:'8px',background:'white',cursor:page===totalPages?'not-allowed':'pointer',opacity:page===totalPages?0.4:1,fontSize:'12px',fontWeight:'600',fontFamily:f}}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
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
  const [mousePos, setMousePos] = useState({x:50,y:50})

  useEffect(()=>{
    api.get(`/products/${id}`)
      .then(({data})=>{
        setProduct(data.product)
        const first=data.product.variants?.find(v=>v.stock>0)
        if(first){setSelSize(first.size);setSelColor(first.color||'')}
      })
      .catch(()=>toast.error('Product not found'))
      .finally(()=>setLoading(false))
  },[id])

  if(loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:f}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'40px',height:'40px',border:'3px solid #ec4899',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'#94A3B8',fontSize:'14px'}}>Loading...</p>
      </div>
    </div>
  )

  if(!product) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:f}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'56px',marginBottom:'12px'}}>😕</div>
        <p style={{color:'#64748B',marginBottom:'20px'}}>Product not found</p>
        <button onClick={()=>navigate('/')} style={{padding:'12px 28px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'12px',cursor:'pointer',fontWeight:'700',fontFamily:f}}>Go Home</button>
      </div>
    </div>
  )

  const sizes=[...new Set(product.variants?.map(v=>v.size)||[])]
  const colors=[...new Set(product.variants?.filter(v=>v.size===selSize).map(v=>v.color).filter(Boolean)||[])]
  const selVariant=product.variants?.find(v=>v.size===selSize&&(v.color===selColor||!selColor))
  const inStock=selVariant?selVariant.stock>0:false
  const discount=product.mrp>product.sellingPrice?Math.round(((product.mrp-product.sellingPrice)/product.mrp)*100):0
  const inCart=items.some(i=>i.productId===product._id&&i.size===selSize)

  const handleAddToCart=()=>{
    if(!selSize) return toast.error('Please select a size')
    if(!inStock) return toast.error('Out of stock')
    addItem({productId:product._id,variantId:selVariant?._id,title:product.title,image:product.images?.[0]||'',size:selSize,color:selColor,price:product.sellingPrice,mrp:product.mrp,seller:product.seller?._id,gstPercent:product.gstPercent,quantity:qty})
    toast.success('Added to cart! 🛒')
  }

  const handleMouseMove=(e)=>{
  const rect=e.currentTarget.getBoundingClientRect()
  // Clamp between 20%–80% so zoom never hits edges
  const x = Math.min(80, Math.max(20, ((e.clientX-rect.left)/rect.width)*100))
  const y = Math.min(80, Math.max(20, ((e.clientY-rect.top)/rect.height)*100))
  setMousePos({x, y})
}
  const formatKey=key=>key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()).trim()
  const additionalEntries=product.additionalDetails?Object.entries(product.additionalDetails).filter(([,v])=>v!==null&&v!==undefined&&v!==''):[]

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFC',fontFamily:f}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .thumb-btn{transition:all 0.15s ease} .thumb-btn:hover{border-color:#ec4899!important;transform:scale(1.04)}
        .size-btn{transition:all 0.15s ease} .size-btn:hover{border-color:#ec4899!important;background:#FFF0F9!important}
        .action-btn{transition:all 0.2s} .action-btn:hover:not(:disabled){transform:translateY(-1px)}
       @media(max-width:768px){
      .product-grid{grid-template-columns:1fr!important;padding:12px 12px 90px!important;}
      .product-sticky{position:static!important;flex-direction:column!important;}
      .main-product-grid{grid-template-columns:1fr!important;gap:16px!important;}
    }
      `}</style>

      {/* Header */}
      <div style={{background:'white',padding:'0 20px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:30,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',}}>
        <button onClick={()=>navigate(-1)} style={{background:'#F1F5F9',border:'none',width:'36px',height:'36px',borderRadius:'50%',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <span style={{fontWeight:'700',fontSize:'15px',color:'#0F172A'}}>Product Details</span>
        <button onClick={()=>navigate('/cart')} style={{position:'relative',background:'none',border:'none',cursor:'pointer',padding:'6px'}}>
          <span style={{fontSize:'22px'}}>🛒</span>
          {items.length>0&&<span style={{position:'absolute',top:0,right:0,width:'16px',height:'16px',background:'#ec4899',color:'white',fontSize:'9px',fontWeight:'800',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{items.reduce((s,i)=>s+i.quantity,0)}</span>}
          
        </button>
      </div>

      <div className="main-product-grid" style={{maxWidth:'1200px',margin:'0 auto',padding:'24px 20px 90px',display:'grid',gridTemplateColumns:'min(50%, 500px) 1fr',gap:'32px',alignItems:'start'}}>

        {/* LEFT: sticky image */}
        <div style={{position:'static',display:'flex',flexDirection:'row',gap:'12px'}}>
          {product.images?.length>1&&(
            <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'70px',flexShrink:0}}>
              {product.images.map((img,i)=>(
                <button key={i} className="thumb-btn" onClick={()=>setImgIdx(i)}
                  style={{width:'64px',height:'80px',borderRadius:'6px',overflow:'hidden',border:`2.5px solid ${imgIdx===i?'#ec4899':'#E2E8F0'}`,cursor:'pointer',padding:0,background:'white',boxShadow:imgIdx===i?'0 0 0 3px #fce7f3':'none'}}>
                  <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </button>
              ))}
            </div>
          )}
          <div style={{flex:1,position:'relative',minWidth:0}}>
            {discount>0&&<div style={{position:'absolute',top:'14px',left:'14px',zIndex:5,background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',fontSize:'12px',fontWeight:'800',padding:'5px 12px',borderRadius:'6px'}}>{discount}% OFF</div>}
            <div
              onMouseEnter={()=>setZoom(true)}
              onMouseLeave={()=>setZoom(false)}
              style={{width:'100%',aspectRatio:'3/4',overflow:'hidden',cursor:'zoom-in',background:'#F8FAFC',borderRadius:'0px',boxShadow:'0 4px 20px rgba(0,0,0,0.10)',position:'relative'}}>
              <img
                src={product.images?.[imgIdx]}
                alt={product.title}
                style={{
                  width:'100%',
                  height:'100%',
                  objectFit:'cover',
                  display:'block',
                  transform: zoom ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                  transformOrigin: 'center center',
                }}
                onError={e=>{e.target.style.background='#F1F5F9'}}
              />
              {!zoom&&<div style={{position:'absolute',bottom:'14px',right:'14px',background:'rgba(0,0,0,0.45)',backdropFilter:'blur(4px)',color:'white',fontSize:'11px',padding:'5px 12px',borderRadius:'6px',pointerEvents:'none'}}>🔍</div>}
            </div>
          </div>
        </div>

        {/* RIGHT: details + reviews */}
        <div style={{display:'flex',flexDirection:'column'}}>

          {/* Brand + title + rating — real-time from DB */}
          <div style={{marginBottom:'14px'}}>
            {product.brand&&<p style={{fontSize:'12px',color:'#94A3B8',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 6px'}}>{product.brand}</p>}
            <h1 style={{fontSize:'20px',fontWeight:'800',color:'#0F172A',lineHeight:'1.4',margin:0}}>{product.title}</h1>

            {/* ── Real-time rating badge (like Myntra) ── */}
            {product.reviewCount > 0 ? (
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'#16a34a',padding:'4px 10px',borderRadius:'6px'}}>
                  <span style={{fontSize:'13px',fontWeight:'800',color:'white'}}>{product.averageRating}</span>
                  <span style={{color:'#fff',fontSize:'13px'}}>★</span>
                </span>
                <span style={{fontSize:'13px',color:'#64748B',fontWeight:'500'}}>|</span>
                <span style={{fontSize:'13px',color:'#64748B',fontWeight:'500'}}>
                  {product.reviewCount >= 1000
                    ? `${(product.reviewCount/1000).toFixed(1)}k`
                    : product.reviewCount} Ratings
                </span>
              </div>
            ) : (
              <p style={{fontSize:'12px',color:'#94A3B8',marginTop:'6px'}}>No ratings yet — be the first!</p>
            )}
          </div>

          {/* Price */}
          <div style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid #F1F5F9'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:'12px',marginBottom:'4px'}}>
              <span style={{fontSize:'28px',fontWeight:'800',color:'#0F172A'}}>₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
              {discount>0&&<><span style={{fontSize:'16px',color:'#94A3B8',textDecoration:'line-through'}}>₹{product.mrp?.toLocaleString('en-IN')}</span><span style={{fontSize:'14px',fontWeight:'800',color:'#16A34A'}}>{discount}% OFF</span></>}
            </div>
            <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>Inclusive of all taxes · GST {product.gstPercent}%</p>
          </div>

          {/* Sizes */}
          {sizes.length>0&&(
            <div style={{marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                <span style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',textTransform:'uppercase',letterSpacing:'0.06em'}}>Select Size</span>
                {selVariant&&<span style={{fontSize:'12px',color:selVariant.stock<5?'#DC2626':'#16A34A',fontWeight:'600'}}>{selVariant.stock} in stock</span>}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                {sizes.map(size=>{const v=product.variants?.find(vv=>vv.size===size);const has=v?.stock>0;return(
                  <button key={size} className="size-btn" onClick={()=>{if(has){setSelSize(size);setSelColor('')}}} disabled={!has}
                    style={{minWidth:'52px',padding:'8px 16px',borderRadius:'6px',border:`2px solid ${selSize===size?'#ec4899':'#E2E8F0'}`,background:selSize===size?'#FFF0F9':'white',color:selSize===size?'#ec4899':has?'#374151':'#CBD5E1',fontWeight:'700',fontSize:'13px',cursor:has?'pointer':'not-allowed',textDecoration:!has?'line-through':'none',fontFamily:f}}>{size}</button>
                )})}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length>0&&(
            <div style={{marginBottom:'20px'}}>
              <span style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',display:'block',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Color</span>
              <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                {colors.map(color=><button key={color} className="size-btn" onClick={()=>setSelColor(color)}
                  style={{padding:'8px 18px',borderRadius:'6px',border:`2px solid ${selColor===color?'#ec4899':'#E2E8F0'}`,background:selColor===color?'#FFF0F9':'white',color:selColor===color?'#ec4899':'#374151',fontWeight:'700',fontSize:'13px',cursor:'pointer',fontFamily:f}}>{color}</button>)}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}}>
            <span style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',textTransform:'uppercase',letterSpacing:'0.06em'}}>Quantity</span>
            <div style={{display:'flex',alignItems:'center',border:'1.5px solid #E2E8F0',borderRadius:'8px',overflow:'hidden'}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:'38px',height:'38px',background:'#F8FAFC',border:'none',cursor:'pointer',fontSize:'18px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center',color:'#374151'}}>−</button>
              <span style={{width:'40px',textAlign:'center',fontWeight:'800',fontSize:'14px',color:'#0F172A',borderLeft:'1px solid #E2E8F0',borderRight:'1px solid #E2E8F0',height:'38px',lineHeight:'38px'}}>{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(selVariant?.stock||10,q+1))} style={{width:'38px',height:'38px',background:'#F8FAFC',border:'none',cursor:'pointer',fontSize:'18px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center',color:'#374151'}}>+</button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{display:'flex',gap:'12px',marginBottom:'28px'}}>
            <button onClick={handleAddToCart} disabled={!inStock} className="action-btn"
              style={{flex:1,height:'48px',background:'white',color:inStock?'#ec4899':'#94A3B8',border:`2px solid ${inStock?'#ec4899':'#E2E8F0'}`,borderRadius:'8px',cursor:inStock?'pointer':'not-allowed',fontWeight:'700',fontSize:'13px',fontFamily:f,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>
              🛍️ {inCart?'Added to Bag':'Add to Bag'}
            </button>
              <button onClick={()=>{handleAddToCart();if(inStock&&selSize)navigate('/checkout')}} disabled={!inStock} className="action-btn"
              style={{flex:1,height:'48px',background:inStock?'linear-gradient(135deg,#ec4899,#f97316)':'#E2E8F0',color:inStock?'white':'#94A3B8',border:'none',borderRadius:'8px',cursor:inStock?'pointer':'not-allowed',fontWeight:'700',fontSize:'13px',fontFamily:f,boxShadow:inStock?'0 4px 14px rgba(236,72,153,0.35)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',letterSpacing:'0.05em',textTransform:'uppercase'}}>
              🤩 Buy Now
            </button>
          </div>

          <DeliveryOptions />

          {/* Description */}
        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
  {product.description?.split('\n').map((item, index) => (
    item.trim() && (
      <span
        key={index}
        style={{
          fontSize:'14px',
          color:'#282C3F',
          lineHeight:'22px'
        }}
      >
        {item}
      </span>
    )
  ))}
</div>

          {/* Additional Details */}
          {additionalEntries.length>0&&(
            <div style={{marginBottom:'16px',borderRadius:'10px',border:'1px solid #F1F5F9',overflow:'hidden'}}>
              <div style={{padding:'12px 16px',background:'#FAFAFA',borderBottom:'1px solid #F1F5F9'}}>
                <h3 style={{fontSize:'12px',fontWeight:'800',color:'#0F172A',margin:0,textTransform:'uppercase',letterSpacing:'0.06em'}}>Product Details</h3>
              </div>
              {additionalEntries.map(([key,value],i)=>(
                <div key={key} style={{display:'flex',alignItems:'center',padding:'11px 16px',background:i%2===0?'white':'#FAFAFA',borderBottom:i<additionalEntries.length-1?'1px solid #F1F5F9':'none'}}>
                  <span style={{flex:'0 0 48%',fontSize:'12px',fontWeight:'600',color:'#94A3B8',textTransform:'capitalize'}}>{formatKey(key)}</span>
                  <span style={{flex:1,fontSize:'13px',fontWeight:'700',color:'#0F172A'}}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Seller */}
          {product.seller&&(
            <div style={{padding:'14px 16px',background:'#F8FAFC',borderRadius:'10px',border:'1px solid #F1F5F9'}}>
              <p style={{fontSize:'11px',color:'#94A3B8',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Sold by</p>
              <p style={{fontSize:'14px',fontWeight:'700',color:'#0F172A',margin:0}}>{product.seller?.sellerDetails?.businessName||product.seller?.name}</p>
            </div>
          )}

          {/* Reviews — pass productTitle for the modal */}
          <ReviewsSection productId={id} productTitle={product.title} />
        </div>
      </div>
    </div>
  )
}