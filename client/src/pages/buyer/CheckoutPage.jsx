import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'
import {
  getAddressesAPI, addAddressAPI, createOrderAPI,
  createRazorpayOrderAPI, verifyRazorpayPaymentAPI,
} from '../../api/orderAPI.js'
import { applyCouponAPI } from '../../api/couponAPI.js'

const f = 'Poppins, sans-serif'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

// ─── Shipping calculator ───────────────────────────────────────────────────────
const FREE_SHIPPING_ABOVE = 499
const COD_FEE             = 25
const WEIGHT_SLABS = [
  { maxG: 500,   mid: 47  },
  { maxG: 1000,  mid: 70  },
  { maxG: 1500,  mid: 97  },
  { maxG: 2000,  mid: 130 },
  { maxG: 3000,  mid: 175 },
  { maxG: 5000,  mid: 237 },
  { maxG: 10000, mid: 335 },
]

function calcShippingFee(totalWeightG, subtotal) {
  if (subtotal >= FREE_SHIPPING_ABOVE) return 0
  const rounded = Math.ceil(Math.max(totalWeightG, 100) / 500) * 500
  const slab    = WEIGHT_SLABS.find(s => rounded <= s.maxG) || WEIGHT_SLABS[WEIGHT_SLABS.length - 1]
  return slab.mid
}

// ─── Load Google Maps ──────────────────────────────────────────────────────────
let googleMapsLoaded  = false
let googleMapsLoading = false
const googleMapsCallbacks = []

function loadGoogleMaps(apiKey) {
  return new Promise((resolve) => {
    if (googleMapsLoaded) { resolve(true); return }
    googleMapsCallbacks.push(resolve)
    if (googleMapsLoading) return
    googleMapsLoading = true
    window.__googleMapsReady = () => {
      googleMapsLoaded = true
      googleMapsCallbacks.forEach(cb => cb(true))
    }
    const script  = document.createElement('script')
    script.src    = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsReady`
    script.async  = true
    script.defer  = true
    script.onerror = () => googleMapsCallbacks.forEach(cb => cb(false))
    document.head.appendChild(script)
  })
}

function parsePlaceResult(place) {
  const get = (type) =>
    place.address_components?.find(c => c.types.includes(type))?.long_name || ''
  const streetNumber = get('street_number')
  const route        = get('route')
  const sublocality  = get('sublocality_level_1') || get('sublocality')
  const locality     = get('locality')
  const district     = get('administrative_area_level_3') || get('administrative_area_level_2')
  const state        = get('administrative_area_level_1')
  const pincode      = get('postal_code')
  const line1 = [streetNumber, route].filter(Boolean).join(' ') || sublocality || locality
  const line2 = sublocality && line1 !== sublocality ? sublocality : ''
  const city  = locality || district
  return { line1, line2, city, state, pincode }
}

function PlacesInput({ value, onChange, onSelect, placeholder, style, error }) {
  const inputRef   = useRef(null)
  const acRef      = useRef(null)
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!GOOGLE_KEY) return
    loadGoogleMaps(GOOGLE_KEY).then((loaded) => {
      if (!loaded || !inputRef.current || acRef.current) return
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address'],
        types:  ['address'],
      })
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace()
        if (!place.address_components) return
        onSelect(parsePlaceResult(place))
        if (inputRef.current)
          inputRef.current.value = place.formatted_address || ''
      })
    })
    return () => {
      if (acRef.current && window.google?.maps?.event)
        window.google.maps.event.clearInstanceListeners(acRef.current)
    }
  }, [GOOGLE_KEY])

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        defaultValue={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...style, border: `1.5px solid ${error ? '#ef4444' : '#E2E8F0'}` }}
        autoComplete="off"
      />
      {GOOGLE_KEY && (
        <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', opacity:0.5, pointerEvents:'none' }}>📍</span>
      )}
    </div>
  )
}

// ─── Checkout Progress Tracker ─────────────────────────────────────────────────
// FIX: The line between Address→Payment now fills as soon as an address is selected.
// The line between Payment→Order Summary fills when both address AND payment are set.
function CheckoutStepper({ selectedAddr, payMethod, orderPlaced }) {
  const steps = [
    { label: 'Address',       emoji: '📍', done: !!selectedAddr },
    { label: 'Payment',       emoji: '💳', done: orderPlaced    },
    { label: 'Order Summary', emoji: '🛒', done: false          },
  ]

  // activeIdx = how many steps are fully completed
  const activeIdx = steps.reduce((acc, s, i) => (s.done ? i + 1 : acc), 0)

  // connector i is "filled" when the step on its LEFT side is done
  // i.e. connector 0 (Address→Payment) fills when Address is done (selectedAddr set)
  //      connector 1 (Payment→Order) fills when Payment is done too
  const connectorFilled = (i) => i < activeIdx

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      marginBottom: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: i < activeIdx
                  ? 'linear-gradient(135deg,#ec4899,#f97316)'
                  : i === activeIdx ? '#FFF0F9' : '#F1F5F9',
                border: i === activeIdx
                  ? '2px solid #ec4899'
                  : i < activeIdx ? 'none' : '2px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', transition: 'all 0.3s ease', flexShrink: 0,
              }}>
                {i < activeIdx
                  ? <span style={{ color: 'white', fontSize: '16px', fontWeight: '800' }}>✓</span>
                  : <span style={{ fontSize: '16px' }}>{step.emoji}</span>
                }
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: i <= activeIdx ? '700' : '500',
                color: i < activeIdx ? '#ec4899' : i === activeIdx ? '#0F172A' : '#94A3B8',
                whiteSpace: 'nowrap', fontFamily: f,
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line — fills based on whether the LEFT step is done */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '3px', marginBottom: '22px',
                marginLeft: '6px', marginRight: '6px', borderRadius: '2px',
                background: connectorFilled(i)
                  ? 'linear-gradient(90deg,#ec4899,#f97316)'
                  : '#E2E8F0',
                transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, totalAmount, clearCart } = useCartStore()
  const { t } = useTranslation()

  const [addresses,    setAddresses]    = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [payMethod,    setPayMethod]    = useState('razorpay')
  const [showForm,     setShowForm]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [addrLoad,     setAddrLoad]     = useState(true)
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm()
  const [couponCode,      setCouponCode]      = useState('')
  const [appliedCoupon,   setAppliedCoupon]   = useState(null)
  const [couponLoading,   setCouponLoading]   = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)

  // ── Charges ────────────────────────────────────────────────────────────────
  const subtotal       = totalAmount()
  const totalWeightG   = items.reduce((acc, item) => acc + (item.shippingWeight || 500) * item.quantity, 0)
  const mrpTotal       = items.reduce((s, i) => s + i.mrp * i.quantity, 0)
  const discount       = mrpTotal - subtotal
  const isFreeShipping = subtotal >= FREE_SHIPPING_ABOVE
  const shippingFee    = calcShippingFee(totalWeightG, subtotal)
  const codFee         = payMethod === 'cod' ? COD_FEE : 0
 const couponDiscount = appliedCoupon?.discount || 0
const grandTotal     = subtotal + shippingFee + codFee - couponDiscount

  const orderPlacedRef = useRef(false)

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) navigate('/cart')
  }, [items])

  useEffect(() => {
    if (!user) return
    getAddressesAPI()
      .then(({ data }) => {
        setAddresses(data.addresses || [])
        const def = data.addresses?.find(a => a.isDefault) || data.addresses?.[0]
        if (def) setSelectedAddr(def)
      })
      .catch(() => {})
      .finally(() => setAddrLoad(false))
  }, [])

  // ── AUTO-FILL: when "Add New" form opens, pre-fill name & phone from user profile ──
  const openAddForm = () => {
  setShowForm(true)
  setTimeout(async () => {
    // 1. name & phone from user profile
    if (user?.name)  setValue('name',  user.name)
    if (user?.phone) setValue('phone', user.phone)

    // 2. ProductDetailPage pe detect hui location se fill karo
    let geoFilled = false
    try {
      const saved = localStorage.getItem('vg_geo')
      if (saved) {
        const geo = JSON.parse(saved)
        const parts = [geo.road, geo.suburb, geo.village].filter(Boolean)
        const line1 = [...new Set(parts)].join(', ')
        if (line1)    setValue('line1',   line1)
        if (geo.city) setValue('city',    geo.city)
        if (geo.pin && /^\d{6}$/.test(geo.pin)) setValue('pincode', geo.pin)
        if (geo.state) {
          const match = STATES.find(s => s.toLowerCase() === geo.state.toLowerCase())
          if (match) setValue('state', match)
        }
        toast.success('📍 Location auto-filled!', { duration: 2000 })
        geoFilled = true
      }
    } catch {}

    // 3. Fallback — existing selected address se fill karo
    if (!geoFilled && selectedAddr) {
      if (selectedAddr.city)    setValue('city',    selectedAddr.city)
      if (selectedAddr.state)   setValue('state',   selectedAddr.state)
      if (selectedAddr.pincode) setValue('pincode', selectedAddr.pincode)
    }

    // 4. Live GPS fallback (agar localStorage mein kuch nahi)
    if (!geoFilled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const res  = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const data = await res.json()
            const addr = data.address || {}
            const road    = addr.road || addr.pedestrian || addr.footway || ''
            const suburb  = addr.suburb || addr.neighbourhood || addr.quarter || ''
            const village = addr.village || addr.town || ''
            const city    = addr.city || addr.town || addr.village || addr.county || ''
            const state   = addr.state || ''
            const pin     = addr.postcode?.replace(/\s/g, '').slice(0, 6) || ''
            const line1   = [...new Set([road, suburb, village].filter(Boolean))].join(', ')
            if (line1) setValue('line1',   line1)
            if (city)  setValue('city',    city)
            if (pin && /^\d{6}$/.test(pin)) setValue('pincode', pin)
            if (state) {
              const match = STATES.find(s => s.toLowerCase() === state.toLowerCase())
              if (match) setValue('state', match)
            }
            toast.success('📍 Location auto-filled!', { duration: 2000 })
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    }
  }, 50)
}

  const handlePlaceSelect = useCallback((parsed) => {
    if (parsed.line1)   setValue('line1',   parsed.line1)
    if (parsed.line2)   setValue('line2',   parsed.line2)
    if (parsed.city)    setValue('city',    parsed.city)
    if (parsed.pincode) setValue('pincode', parsed.pincode)
    if (parsed.state) {
      const match = STATES.find(s => s.toLowerCase() === parsed.state.toLowerCase())
      if (match) setValue('state', match)
    }
    toast.success('Address filled from Google Maps 📍', { duration: 2000 })
  }, [setValue])

  const saveAddress = async (form) => {
    setLoading(true)
    try {
      const { data } = await addAddressAPI({ ...form, isDefault: addresses.length === 0 })
      setAddresses(data.addresses)
      const newAddr = data.addresses[data.addresses.length - 1]
      setSelectedAddr(newAddr)
      setShowForm(false)
      reset()
      toast.success('Address saved!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save address')
    } finally { setLoading(false) }
  }

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script   = document.createElement('script')
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async   = true
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
    setTimeout(() => resolve(false), 10000)
  })
 
    const handleApplyCoupon = async () => {
  if (!couponCode.trim()) return toast.error('Enter a coupon code')
  setCouponLoading(true)
  try {
    const { data } = await applyCouponAPI(couponCode.trim(), subtotal)
    setAppliedCoupon({ code: data.couponCode, discount: data.discount, description: data.description })
    toast.success(data.message)
    setShowCouponModal(false)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Invalid coupon')
  } finally { setCouponLoading(false) }
}

const handleRemoveCoupon = () => {
  setAppliedCoupon(null)
  setCouponCode('')
  toast.success('Coupon removed')
}

  const placeOrder = async () => {
    if (!user) { navigate('/login?redirect=/checkout'); return }
    if (!selectedAddr) return toast.error('Select a delivery address')
    setLoading(true)
    try {
      if (payMethod === 'razorpay') {
        const loaded = await loadRazorpay()
        if (!loaded) { toast.error('Razorpay failed to load. Check internet.'); setLoading(false); return }
      }

      const payload = {
        items: items.map(i => ({
          productId:    i.productId,
          variantId:    i.variantId,
          size:         i.size,
          color:        i.color,
          quantity:     i.quantity,
          seller:       i.seller,
          title:        i.title,
          image:        i.image,
          mrp:          i.mrp,
          sellingPrice: i.price,
          gstPercent:   i.gstPercent,
        })),
        deliveryAddress: {
          name:    selectedAddr.name,
          phone:   selectedAddr.phone,
          line1:   selectedAddr.line1,
          line2:   selectedAddr.line2 || '',
          city:    selectedAddr.city,
          state:   selectedAddr.state,
          pincode: selectedAddr.pincode,
        },
        paymentMethod: payMethod,
        couponCode: appliedCoupon?.code || '',
        discount:   couponDiscount,
      }

      const { data: od } = await createOrderAPI(payload)
      const order = od.order

      if (payMethod === 'cod') {
        orderPlacedRef.current = true
        clearCart()
        toast.success('Order placed!')
        navigate(`/order-success/${order._id}`, { replace: true })
        return
      }

      const { data: rzp } = await createRazorpayOrderAPI(order._id)
      new window.Razorpay({
        key:         rzp.keyId,
        amount:      rzp.amount,
        currency:    rzp.currency,
        name:        'VogueCart',
        description: 'Fashion Order',
        order_id:    rzp.razorpayOrderId,
        prefill:     { name: user?.name, email: user?.email, contact: user?.phone },
        theme:       { color: '#ec4899' },
        handler: async (resp) => {
          try {
            await verifyRazorpayPaymentAPI({
              orderId:           order._id,
              razorpayOrderId:   resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            })
            orderPlacedRef.current = true
            clearCart()
            toast.success('Payment successful! 🎉')
            navigate(`/order-success/${order._id}`, { replace: true })
          } catch {
            toast.error('Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => { toast('Payment cancelled', { icon: '⚠️' }); setLoading(false) },
        },
      }).open()

    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order')
      setLoading(false)
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inp   = { width:'100%', padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:'10px', fontSize:'13px', outline:'none', fontFamily:f, boxSizing:'border-box' }
  const card  = { background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }
  const label = { display:'block', fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'5px' }
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:f }}>

      {/* Header */}
      <div style={{ background:'white', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'1px solid #E2E8F0', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={() => navigate('/cart')} style={{ background:'#F1F5F9', border:'none', width:'36px', height:'36px', borderRadius:'8px', cursor:'pointer', fontSize:'18px' }}>←</button>
        <h1 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', margin:0 }}>{t('checkout')}</h1>
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ── Login Banner ─────────────────────────────────────────────── */}
        {!user && (
          <div style={{ background:'linear-gradient(135deg,#FFF0F9,#F5F0FF)', border:'1.5px solid #ec4899', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'28px' }}>🔐</span>
              <div>
                <p style={{ fontSize:'14px', fontWeight:'800', color:'#0F172A', margin:'0 0 2px' }}>Login or Signup to place your order</p>
                <p style={{ fontSize:'12px', color:'#64748B', margin:0 }}>You'll need to login when you click "Place Order"</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
              <button onClick={() => navigate('/login?redirect=/checkout')}
                style={{ padding:'8px 16px', background:'white', color:'#ec4899', border:'2px solid #ec4899', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'12px', fontFamily:f }}>
                Login
              </button>
              <button onClick={() => navigate('/signup/buyer?redirect=/checkout')}
                style={{ padding:'8px 16px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'12px', fontFamily:f }}>
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ── Progress Stepper ─────────────────────────────────────────── */}
       <CheckoutStepper selectedAddr={selectedAddr} payMethod={payMethod} orderPlaced={orderPlacedRef.current} />

        {/* ── Address ──────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📍</div>
              <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>{t('deliveryAddress')}</h2>
            </div>
            {/* CHANGED: onClick now calls openAddForm() instead of setShowForm(!showForm) */}
            <button onClick={() => showForm ? (setShowForm(false), reset()) : openAddForm()}
              style={{ padding:'8px 16px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
              + {t('addNew')}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(saveAddress)} style={{ background:'#F8FAFC', borderRadius:'12px', padding:'18px', marginBottom:'16px', border:'1px solid #E2E8F0' }}>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <label style={label}>{t('fullName')}*</label>
                  <input {...register('name', { required: true })} placeholder="Recipient name" style={inp} />
                  {errors.name && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Name required</p>}
                </div>
                <div>
                  <label style={label}>{t('phone')}*</label>
                  <input {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} placeholder="10-digit mobile" style={inp} />
                  {errors.phone && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Valid phone required</p>}
                </div>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={label}>{t('addressLine1')}*</label>
                <input {...register('line1', { required: true })} placeholder="House no., street name" style={inp} />
                {errors.line1 && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Address required</p>}
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={label}>{t('addressLine2')}</label>
                <input {...register('line2')} placeholder="Area, landmark (optional)" style={inp} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' }}>
                <div>
                  <label style={label}>{t('city')}*</label>
                  <input {...register('city', { required: true })} placeholder="City" style={inp} />
                  {errors.city && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Required</p>}
                </div>
                <div>
                  <label style={label}>{t('pincode')}*</label>
                  <input {...register('pincode', { required: true, pattern: /^\d{6}$/ })} placeholder="6 digits" maxLength={6} style={inp} />
                  {errors.pincode && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>6-digit required</p>}
                </div>
                <div>
                  <label style={label}>{t('state')} *</label>
                  <select {...register('state', { required: true })} style={{ ...inp, background:'white' }}>
                    <option value="">State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Required</p>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={() => { setShowForm(false); reset() }}
                  style={{ flex:1, padding:'11px', border:'1.5px solid #E2E8F0', background:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontFamily:f, fontSize:'13px', color:'#64748B' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex:1, padding:'11px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontFamily:f, fontSize:'13px' }}>
                 {loading ? t('saving') : t('saveAddress')}
                </button>
              </div>
            </form>
          )}

          {addrLoad ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[1,2].map(i => <div key={i} style={{ height:'64px', background:'#F1F5F9', borderRadius:'10px' }} />)}
            </div>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px', color:'#94A3B8' }}>
              <div style={{ fontSize:'36px', marginBottom:'10px' }}>📍</div>
              <p style={{ margin:'0 0 12px', fontSize:'14px' }}>{t('noAddressSaved')}</p>
              <button onClick={openAddForm}
                style={{ padding:'10px 20px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontFamily:f, fontSize:'13px' }}>
                {t('addFirstAddress')}
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {addresses.map(addr => (
                <div key={addr._id} onClick={() => setSelectedAddr(addr)}
                  style={{ padding:'14px', borderRadius:'12px', border:`2px solid ${selectedAddr?._id===addr._id ? '#ec4899' : '#E2E8F0'}`, background:selectedAddr?._id===addr._id ? '#FFF0F9' : 'white', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'flex-start', gap:'12px' }}>
                  <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${selectedAddr?._id===addr._id ? '#ec4899' : '#CBD5E1'}`, background:selectedAddr?._id===addr._id ? '#ec4899' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' }}>
                    {selectedAddr?._id===addr._id && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'white' }} />}
                  </div>
                  <div>
                    <p style={{ fontWeight:'700', color:'#0F172A', margin:'0 0 3px', fontSize:'14px' }}>{addr.name} · {addr.phone}</p>
                    <p style={{ fontSize:'12px', color:'#64748B', margin:0, lineHeight:'1.5' }}>
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    {addr.isDefault && <span style={{ fontSize:'11px', color:'#ec4899', fontWeight:'700' }}>✓ Default</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Payment Method ────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>💳</div>
            <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>{t('paymentMethod')}</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { key:'razorpay', emoji:'💳', label:'Online Payment',   sub:'UPI, Credit/Debit Card, Net Banking' },
              { key:'cod',      emoji:'💵', label:'Cash on Delivery', sub:`Pay when order arrives · +₹${COD_FEE} handling fee` },
            ].map(method => (
              <div key={method.key} onClick={() => setPayMethod(method.key)}
                style={{ padding:'14px', borderRadius:'12px', border:`2px solid ${payMethod===method.key ? '#ec4899' : '#E2E8F0'}`, background:payMethod===method.key ? '#FFF0F9' : 'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', transition:'all 0.2s' }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${payMethod===method.key ? '#ec4899' : '#CBD5E1'}`, background:payMethod===method.key ? '#ec4899' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {payMethod===method.key && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'white' }} />}
                </div>
                <span style={{ fontSize:'22px' }}>{method.emoji}</span>
                <div>
                  <p style={{ fontWeight:'700', color:'#0F172A', margin:0, fontSize:'14px' }}>{method.label}</p>
                  <p style={{ fontSize:'12px', color:'#64748B', margin:0 }}>{method.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Coupon Section ── */}
<div style={card}>
  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom: appliedCoupon ? '12px' : '0' }}>
    <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🏷️</div>
    <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px', flex:1 }}>Coupons</h2>
    {!appliedCoupon ? (
      <button onClick={() => setShowCouponModal(true)}
        style={{ padding:'8px 16px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
        APPLY
      </button>
    ) : (
      <button onClick={handleRemoveCoupon}
        style={{ padding:'6px 12px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
        REMOVE
      </button>
    )}
  </div>
  {appliedCoupon && (
    <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'10px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'10px' }}>
      <span style={{ fontSize:'20px' }}>✅</span>
      <div>
        <p style={{ fontSize:'13px', fontWeight:'800', color:'#15803D', margin:'0 0 2px' }}>"{appliedCoupon.code}" Applied! You save ₹{appliedCoupon.discount}</p>
        {appliedCoupon.description && <p style={{ fontSize:'11px', color:'#16A34A', margin:0 }}>{appliedCoupon.description}</p>}
      </div>
    </div>
  )}
</div>

{/* ── Coupon Modal ── */}
{showCouponModal && (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
    onClick={e => e.target === e.currentTarget && setShowCouponModal(false)}>
    <div style={{ background:'white', borderRadius:'2px', padding:'24px 20px', width:'100%', maxWidth:'480px', maxHeight:'80vh', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <h3 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'18px' }}>Apply Coupon</h3>
        <button onClick={() => setShowCouponModal(false)}
          style={{ background:'#F1F5F9', border:'none', width:'32px', height:'32px', borderRadius:'8px', cursor:'pointer', fontSize:'18px' }}>×</button>
      </div>
      <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
          placeholder="Enter coupon code"
          style={{ flex:1, padding:'12px 14px', border:'1.5px solid #ec4899', borderRadius:'10px', fontSize:'14px', fontWeight:'700', outline:'none', fontFamily:f, letterSpacing:'1px' }} />
        <button onClick={handleApplyCoupon} disabled={couponLoading}
          style={{ padding:'12px 20px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'14px', fontFamily:f }}>
          {couponLoading ? '...' : 'CHECK'}
        </button>
      </div>
      <p style={{ fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'12px' }}>Available Offers</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {[
          { code:'FIRST50',    desc:'50% off on first order (max ₹200)', min:'Min. ₹299', tag:'First Order' },
          { code:'WELCOME100', desc:'₹100 off on orders above ₹499',     min:'Min. ₹499', tag:'New User' },
          { code:'REFER50',    desc:'₹50 off for referred users',         min:'Min. ₹199', tag:'Referral' },
        ].map(c => (
          <div key={c.code} style={{ border:'1.5px dashed #E2E8F0', borderRadius:'12px', padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                <span style={{ background:'#FFF0F9', color:'#ec4899', fontSize:'12px', fontWeight:'800', padding:'2px 8px', borderRadius:'6px', border:'1px dashed #ec4899' }}>{c.code}</span>
                <span style={{ background:'#EFF6FF', color:'#3B82F6', fontSize:'10px', fontWeight:'700', padding:'2px 6px', borderRadius:'4px' }}>{c.tag}</span>
              </div>
              <p style={{ fontSize:'12px', color:'#374151', margin:'0 0 2px' }}>{c.desc}</p>
              <p style={{ fontSize:'11px', color:'#94A3B8', margin:0 }}>{c.min}</p>
            </div>
            <button onClick={() => { setCouponCode(c.code); setTimeout(handleApplyCoupon, 100) }}
              style={{ padding:'8px 14px', background:'white', color:'#ec4899', border:'1.5px solid #ec4899', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'12px', fontFamily:f, flexShrink:0 }}>
              APPLY
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      
        {/* ── Order Summary ─────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🛒</div>
            <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>{t('orderSummary')}</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <img src={item.image} alt="" style={{ width:'48px', height:'56px', objectFit:'cover', borderRadius:'8px', background:'#F1F5F9', flexShrink:0 }} onError={e => { e.target.style.background = '#F1F5F9' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'12px', fontWeight:'600', color:'#374151', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</p>
                  <p style={{ fontSize:'11px', color:'#94A3B8', margin:0 }}>{item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`} · Qty: {item.quantity}</p>
                </div>
                <span style={{ fontSize:'14px', fontWeight:'700', color:'#0F172A', flexShrink:0 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'4px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #E2E8F0', background:'#F1F5F9' }}>
              <span style={{ fontSize:'12px', fontWeight:'800', color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Price Details ({items.reduce((s, i) => s + i.quantity, 0)} Item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
              </span>
            </div>
            <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                <span style={{ color:'#64748B' }}>Total MRP</span>
                <span style={{ color:'#374151' }}>₹{mrpTotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                  <span style={{ color:'#64748B' }}>Discount on MRP</span>
                  <span style={{ color:'#16A34A', fontWeight:'700' }}>− ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                <span style={{ color:'#64748B' }}>Shipping Fee</span>
                {shippingFee === 0
                  ? <span style={{ color:'#16A34A', fontWeight:'700' }}>FREE</span>
                  : <span style={{ color:'#374151' }}>₹{shippingFee}</span>
                }
              </div>
              {couponDiscount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                <span style={{ color:'#64748B' }}>Coupon Discount ({appliedCoupon?.code})</span>
                <span style={{ color:'#16A34A', fontWeight:'700' }}>− ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
              {payMethod === 'cod' && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                  <span style={{ color:'#64748B' }}>COD Handling Fee</span>
                  <span style={{ color:'#374151' }}>₹{COD_FEE}</span>
                </div>
              )}
              {isFreeShipping && (
                <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'8px 12px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'14px' }}>🎉</span>
                  <span style={{ fontSize:'12px', color:'#16A34A', fontWeight:'600' }}>You saved ₹{calcShippingFee(totalWeightG, 0)} on shipping!</span>
                </div>
              )}
              <div style={{ height:'1px', background:'#E2E8F0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'15px', fontWeight:'800', color:'#0F172A' }}>{t('total')}</span>
                <span style={{ fontSize:'20px', fontWeight:'900', color:'#ec4899' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ background:'#FFF0F9', border:'1px solid #fbcfe8', borderRadius:'8px', padding:'10px 14px', textAlign:'center' }}>
                  <span style={{ fontSize:'13px', color:'#ec4899', fontWeight:'700' }}>
                    🛍️ You will save ₹{(discount + (isFreeShipping ? calcShippingFee(totalWeightG, 0) : 0)).toLocaleString('en-IN')} on this order
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Place Order Button ─────────────────────────────────────────── */}
        <button
          onClick={placeOrder}
          disabled={loading || !selectedAddr}
          style={{
            width:'100%', padding:'16px',
            background: loading || !selectedAddr ? '#E2E8F0' : 'linear-gradient(135deg,#ec4899,#f97316)',
            color: loading || !selectedAddr ? '#94A3B8' : 'white',
            border:'none', borderRadius:'14px',
            cursor: loading || !selectedAddr ? 'not-allowed' : 'pointer',
            fontWeight:'800', fontSize:'16px', fontFamily:f,
            boxShadow: loading || !selectedAddr ? 'none' : '0 4px 15px rgba(236,72,153,0.3)',
          }}>
         {loading ? t('processing') : payMethod === 'cod'
                ? `${t('placeOrderCOD')} — ₹${grandTotal.toLocaleString('en-IN')}`
                : `${t('pay')} ₹${grandTotal.toLocaleString('en-IN')}`}
        </button>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#94A3B8', paddingBottom:'20px' }}>
          🔒 Secure &amp; encrypted payments powered by Razorpay
        </p>
      </div>
    </div>
  )
}