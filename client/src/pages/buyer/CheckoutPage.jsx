import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'
import {
  getAddressesAPI, addAddressAPI, createOrderAPI,
  createRazorpayOrderAPI, verifyRazorpayPaymentAPI,
} from '../../api/orderAPI.js'

const f = 'Poppins, sans-serif'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

// ─── Shipping calculator (mirrors shippingHelper.js logic on frontend) ─────────
const FREE_SHIPPING_ABOVE = 499
const COD_FEE             = 25   // flat COD handling fee
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

// ─── Load Google Maps ─────────────────────────────────────────────────────────
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

// ─── Checkout Progress Tracker ────────────────────────────────────────────────
function CheckoutStepper({ selectedAddr, payMethod }) {
  const steps = [
    { label: 'Address',       emoji: '📍', done: !!selectedAddr },
    { label: 'Payment',       emoji: '💳', done: !!payMethod    },
    { label: 'Order Summary', emoji: '🛒', done: false          },
  ]
  const activeIdx = steps.reduce((acc, s, i) => (s.done ? i + 1 : acc), 0)

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
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '3px', marginBottom: '22px',
                marginLeft: '6px', marginRight: '6px', borderRadius: '2px',
                background: i < activeIdx ? 'linear-gradient(90deg,#ec4899,#f97316)' : '#E2E8F0',
                transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, totalAmount, clearCart } = useCartStore()

  const [addresses,    setAddresses]    = useState([])
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [payMethod,    setPayMethod]    = useState('razorpay')
  const [showForm,     setShowForm]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [addrLoad,     setAddrLoad]     = useState(true)

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm()

  // ── Calculate all charges dynamically ─────────────────────────────────────
  const subtotal = totalAmount()

  const totalWeightG = items.reduce((acc, item) => {
    const w = item.shippingWeight || 500
    return acc + w * item.quantity
  }, 0)

  const mrpTotal       = items.reduce((s, i) => s + i.mrp * i.quantity, 0)
  const discount       = mrpTotal - subtotal
  const isFreeShipping = subtotal >= FREE_SHIPPING_ABOVE
  const shippingFee    = calcShippingFee(totalWeightG, subtotal)
  const codFee         = payMethod === 'cod' ? COD_FEE : 0
  const grandTotal     = subtotal + shippingFee + codFee

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
    const script  = document.createElement('script')
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async  = true
    script.onload = () => resolve(true)
    script.onerror= () => resolve(false)
    document.head.appendChild(script)
    setTimeout(() => resolve(false), 10000)
  })

    const placeOrder = async () => {
    if (!user) {
      navigate('/login?redirect=/checkout')
      return
    }
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

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0',
    borderRadius: '10px', fontSize: '13px', outline: 'none',
    fontFamily: f, boxSizing: 'border-box',
  }
  const card  = { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
  const label = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '5px' }

  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: f }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={() => navigate('/cart')} style={{ background: '#F1F5F9', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' }}>←</button>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Checkout</h1>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
        {/* ── Login Banner for guests ─────────────────────────────── */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF0F9, #F5F0FF)',
            border: '1.5px solid #ec4899',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>🔐</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px' }}>
                  Login or Signup to place your order
                </p>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  You'll need to login when you click "Place Order"
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => navigate('/login?redirect=/checkout')}
                style={{ padding: '8px 16px', background: 'white', color: '#ec4899', border: '2px solid #ec4899', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', fontFamily: f }}>
                Login
              </button>
              <button onClick={() => navigate('/signup/buyer?redirect=/checkout')}
                style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#ec4899,#f97316)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', fontFamily: f }}>
                Sign Up
              </button>
            </div>
          </div>
        )}
        {/* ── Progress Stepper ─────────────────────────────────────────────── */}
        <CheckoutStepper selectedAddr={selectedAddr} payMethod={payMethod} />

        {/* ── Address ──────────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📍</div>
              <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>Delivery Address</h2>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding:'8px 16px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
              + Add New
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(saveAddress)} style={{ background:'#F8FAFC', borderRadius:'12px', padding:'18px', marginBottom:'16px', border:'1px solid #E2E8F0' }}>
              {GOOGLE_KEY && (
                <div style={{ marginBottom:'16px' }}>
                  <label style={label}>🔍 Search with Google Maps</label>
                  <PlacesInput placeholder="Start typing your address..." onChange={() => {}} onSelect={handlePlaceSelect} style={{ ...inp, paddingRight:'34px' }} />
                  <p style={{ fontSize:'11px', color:'#94A3B8', margin:'5px 0 0' }}>Select from suggestions to auto-fill ↓</p>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div>
                  <label style={label}>Full Name *</label>
                  <input {...register('name', { required: true })} placeholder="Recipient name" style={inp} />
                  {errors.name && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Name required</p>}
                </div>
                <div>
                  <label style={label}>Phone *</label>
                  <input {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })} placeholder="10-digit mobile" style={inp} />
                  {errors.phone && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Valid phone required</p>}
                </div>
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={label}>Address Line 1 *</label>
                <input {...register('line1', { required: true })} placeholder="House no., street name" style={inp} />
                {errors.line1 && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Address required</p>}
              </div>
              <div style={{ marginBottom:'12px' }}>
                <label style={label}>Address Line 2</label>
                <input {...register('line2')} placeholder="Area, landmark (optional)" style={inp} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' }}>
                <div>
                  <label style={label}>City *</label>
                  <input {...register('city', { required: true })} placeholder="City" style={inp} />
                  {errors.city && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>Required</p>}
                </div>
                <div>
                  <label style={label}>Pincode *</label>
                  <input {...register('pincode', { required: true, pattern: /^\d{6}$/ })} placeholder="6 digits" maxLength={6} style={inp} />
                  {errors.pincode && <p style={{ fontSize:'11px', color:'#BE123C', margin:'3px 0 0' }}>6-digit required</p>}
                </div>
                <div>
                  <label style={label}>State *</label>
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
                  {loading ? 'Saving...' : 'Save Address'}
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
              <p style={{ margin:'0 0 12px', fontSize:'14px' }}>No addresses saved yet</p>
              <button onClick={() => setShowForm(true)}
                style={{ padding:'10px 20px', background:'linear-gradient(135deg,#ec4899,#f97316)', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontFamily:f, fontSize:'13px' }}>
                Add First Address
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

        {/* ── Payment Method ────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>💳</div>
            <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>Payment Method</h2>
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

        {/* ── Order Summary ─────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'36px', height:'36px', background:'#FFF0F9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🛒</div>
            <h2 style={{ fontWeight:'800', color:'#0F172A', margin:0, fontSize:'16px' }}>Order Summary</h2>
          </div>

          {/* Items */}
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

          {/* ── Myntra-style Price Details ──────────────────────────── */}
          <div style={{
            marginTop: '4px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#F1F5F9' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Price Details ({items.reduce((s, i) => s + i.quantity, 0)} Item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
              </span>
            </div>

            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Total MRP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Total MRP</span>
                <span style={{ color: '#374151' }}>₹{mrpTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Discount on MRP */}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Discount on MRP</span>
                  <span style={{ color: '#16A34A', fontWeight: '700' }}>− ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Shipping Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Shipping Fee</span>
                {shippingFee === 0
                  ? <span style={{ color: '#16A34A', fontWeight: '700' }}>FREE</span>
                  : <span style={{ color: '#374151' }}>₹{shippingFee}</span>
                }
              </div>

              {/* COD Handling Fee */}
              {payMethod === 'cod' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>COD Handling Fee</span>
                  <span style={{ color: '#374151' }}>₹{COD_FEE}</span>
                </div>
              )}

              {/* Free shipping banner */}
              {isFreeShipping && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🎉</span>
                  <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                    You saved ₹{calcShippingFee(totalWeightG, 0)} on shipping!
                  </span>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: '#E2E8F0' }} />

              {/* Total Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Total Amount</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ec4899' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Savings pill */}
              {discount > 0 && (
                <div style={{ background: '#FFF0F9', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '700' }}>
                    🛍️ You will save ₹{(discount + (isFreeShipping ? calcShippingFee(totalWeightG, 0) : 0)).toLocaleString('en-IN')} on this order
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Place Order Button ─────────────────────────────────────────────── */}
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
          {loading
            ? 'Processing...'
            : payMethod === 'cod'
              ? `Place Order (COD) — ₹${grandTotal.toLocaleString('en-IN')}`
              : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
        </button>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#94A3B8', paddingBottom:'20px' }}>
          🔒 Secure & encrypted payments powered by Razorpay
        </p>
      </div>
    </div>
  )
}