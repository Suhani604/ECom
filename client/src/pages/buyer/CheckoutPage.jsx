import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useCartStore from '../../context/useCartStore.js'
import useAuthStore from '../../context/useAuthStore.js'
import { getAddressesAPI, addAddressAPI, createOrderAPI, createRazorpayOrderAPI, verifyRazorpayPaymentAPI } from '../../api/orderAPI.js'

const f = 'Poppins, sans-serif'
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh']

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
  const { register, handleSubmit, formState:{errors}, reset } = useForm()

  const total    = totalAmount()
  const shipping = total >= 499 ? 0 : 49
  const grand    = total + shipping

  useEffect(() => { if(items.length===0) navigate('/cart') }, [items])
  useEffect(() => {
    getAddressesAPI().then(({data})=>{
      setAddresses(data.addresses||[])
      const def = data.addresses?.find(a=>a.isDefault)||data.addresses?.[0]
      if(def) setSelectedAddr(def)
    }).catch(()=>{}).finally(()=>setAddrLoad(false))
  }, [])

  const saveAddress = async (form) => {
    setLoading(true)
    try {
      const {data} = await addAddressAPI({...form, isDefault:addresses.length===0})
      setAddresses(data.addresses)
      const n = data.addresses[data.addresses.length-1]
      setSelectedAddr(n); setShowForm(false); reset()
      toast.success('Address saved!')
    } catch(e){ toast.error(e.response?.data?.message||'Failed') }
    finally{setLoading(false)}
  }

  const loadRazorpay = ()=>new Promise(res=>{
    if(window.Razorpay){res(true);return}
    const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js'
    s.onload=()=>res(true);s.onerror=()=>res(false);document.body.appendChild(s)
  })

  const placeOrder = async () => {
    if(!selectedAddr) return toast.error('Select a delivery address')
    setLoading(true)
    try {
      const payload = {
       items: items.map(i => ({
          productId:    i.productId,
          variantId:    i.variantId,      // ← ADD
          size:         i.size,
          color:        i.color,
          quantity:     i.quantity,
          seller:       i.seller,         // ← ADD (required in schema!)
          title:        i.title,
          image:        i.image,
          mrp:          i.mrp,
          sellingPrice: i.price,          // ← cart stores as "price", backend needs "sellingPrice"
          gstPercent:   i.gstPercent,     // ← ADD
        })),
        deliveryAddress:{name:selectedAddr.name,phone:selectedAddr.phone,line1:selectedAddr.line1,line2:selectedAddr.line2||'',city:selectedAddr.city,state:selectedAddr.state,pincode:selectedAddr.pincode},
        paymentMethod: payMethod,
      }
      const {data:od} = await createOrderAPI(payload)
      const order = od.order
      if(payMethod==='cod'){ clearCart(); toast.success('Order placed!'); navigate(`/order-success/${order._id}`); return }
      const loaded = await loadRazorpay()
      if(!loaded){ toast.error('Razorpay failed to load'); setLoading(false); return }
      const {data:rzp} = await createRazorpayOrderAPI(order._id)
      new window.Razorpay({
        key:rzp.keyId, amount:rzp.amount, currency:rzp.currency,
        name:'KidsMenWomen', description:'Garments Order', order_id:rzp.razorpayOrderId,
        prefill:{name:user?.name,email:user?.email,contact:user?.phone},
        theme:{color:'#ec4899'},
        handler: async(resp)=>{
          try {
            await verifyRazorpayPaymentAPI({orderId:order._id,razorpayOrderId:resp.razorpay_order_id,razorpayPaymentId:resp.razorpay_payment_id,razorpaySignature:resp.razorpay_signature})
            clearCart(); toast.success('Payment successful! 🎉'); navigate(`/order-success/${order._id}`)
          } catch
          { toast.error('Payment verification failed') }
        },
        modal:{ondismiss:()=>{toast('Payment cancelled',{icon:'⚠️'});setLoading(false)}},
      }).open()
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); setLoading(false) }
  }

  const inp = {width:'100%',padding:'10px 14px',border:'1.5px solid #E2E8F0',borderRadius:'10px',fontSize:'13px',outline:'none',fontFamily:f,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFC',fontFamily:f}}>
      <div style={{background:'white',padding:'0 20px',height:'60px',display:'flex',alignItems:'center',gap:'14px',borderBottom:'1px solid #E2E8F0',position:'sticky',top:0,zIndex:10,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <button onClick={()=>navigate('/cart')} style={{background:'#F1F5F9',border:'none',width:'36px',height:'36px',borderRadius:'0%',cursor:'pointer',fontSize:'18px'}}>←</button>
        <h1 style={{fontSize:'18px',fontWeight:'800',color:'#0F172A',margin:0}}>Checkout</h1>
      </div>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'20px 16px',display:'flex',flexDirection:'column',gap:'16px'}}>

        {/* Address section */}
        <div style={{background:'white',borderRadius:'0px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'36px',height:'36px',background:'#FFF0F9',borderRadius:'0px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>📍</div>
              <h2 style={{fontWeight:'800',color:'#0F172A',margin:0,fontSize:'16px'}}>Delivery Address</h2>
            </div>
            <button onClick={()=>setShowForm(!showForm)}
              style={{padding:'8px 16px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'0px',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:f}}>
              + Add New
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(saveAddress)} style={{background:'#F8FAFC',borderRadius:'0px',padding:'18px',marginBottom:'16px',border:'1px solid #E2E8F0'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>Full Name *</label>
                  <input {...register('name',{required:true})} placeholder="Recipient name" style={inp}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>Phone *</label>
                  <input {...register('phone',{required:true,pattern:/^[6-9]\d{9}$/})} placeholder="10-digit mobile" style={inp}/>
                  {errors.phone && <p style={{fontSize:'11px',color:'#BE123C',margin:'3px 0 0'}}>Valid phone required</p>}
                </div>
              </div>
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>Address Line 1 *</label>
                <input {...register('line1',{required:true})} placeholder="House no., street name" style={inp}/>
              </div>
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>Address Line 2</label>
                <input {...register('line2')} placeholder="Area, landmark (optional)" style={inp}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>City *</label>
                  <input {...register('city',{required:true})} placeholder="City" style={inp}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>Pincode *</label>
                  <input {...register('pincode',{required:true,pattern:/^\d{6}$/})} placeholder="6 digits" maxLength={6} style={inp}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'700',color:'#374151',marginBottom:'5px'}}>State *</label>
                  <select {...register('state',{required:true})} style={{...inp,background:'white'}}>
                    <option value="">State</option>
                    {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button type="button" onClick={()=>{setShowForm(false);reset()}} style={{flex:1,padding:'11px',border:'1.5px solid #E2E8F0',background:'white',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontFamily:f,fontSize:'13px',color:'#64748B'}}>Cancel</button>
                <button type="submit" disabled={loading} style={{flex:1,padding:'11px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontFamily:f,fontSize:'13px'}}>
                  {loading?'Saving...':'Save Address'}
                </button>
              </div>
            </form>
          )}

          {addrLoad ? (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {[1,2].map(i=><div key={i} style={{height:'64px',background:'#F1F5F9',borderRadius:'0px'}}/>)}
            </div>
          ) : addresses.length===0 ? (
            <div style={{textAlign:'center',padding:'28px',color:'#94A3B8'}}>
              <div style={{fontSize:'36px',marginBottom:'10px'}}>📍</div>
              <p style={{margin:'0 0 12px',fontSize:'14px'}}>No addresses saved yet</p>
              <button onClick={()=>setShowForm(true)} style={{padding:'10px 20px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontWeight:'700',fontFamily:f,fontSize:'13px'}}>Add First Address</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {addresses.map(addr=>(
                <div key={addr._id} onClick={()=>setSelectedAddr(addr)}
                  style={{padding:'14px',borderRadius:'0px',border:`2px solid ${selectedAddr?._id===addr._id?'#ec4899':'#E2E8F0'}`,background:selectedAddr?._id===addr._id?'#FFF0F9':'white',cursor:'pointer',transition:'all 0.2s',display:'flex',alignItems:'flex-start',gap:'12px'}}>
                  <div style={{width:'20px',height:'20px',borderRadius:'0%',border:`2px solid ${selectedAddr?._id===addr._id?'#ec4899':'#CBD5E1'}`,background:selectedAddr?._id===addr._id?'#ec4899':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}}>
                    {selectedAddr?._id===addr._id && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'white'}}/>}
                  </div>
                  <div>
                    <p style={{fontWeight:'700',color:'#0F172A',margin:'0 0 3px',fontSize:'14px'}}>{addr.name} · {addr.phone}</p>
                    <p style={{fontSize:'12px',color:'#64748B',margin:0,lineHeight:'1.5'}}>{addr.line1}{addr.line2?`, ${addr.line2}`:''}, {addr.city}, {addr.state} — {addr.pincode}</p>
                    {addr.isDefault && <span style={{fontSize:'11px',color:'#ec4899',fontWeight:'700'}}>✓ Default</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment method */}
        <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <div style={{width:'36px',height:'36px',background:'#FFF0F9',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>💳</div>
            <h2 style={{fontWeight:'800',color:'#0F172A',margin:0,fontSize:'16px'}}>Payment Method</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {[
              {key:'razorpay',emoji:'💳',label:'Online Payment',sub:'UPI, Credit/Debit Card, Net Banking'},
              {key:'cod',     emoji:'💵',label:'Cash on Delivery',sub:'Pay when your order arrives'},
            ].map(method=>(
              <div key={method.key} onClick={()=>setPayMethod(method.key)}
                style={{padding:'14px',borderRadius:'12px',border:`2px solid ${payMethod===method.key?'#ec4899':'#E2E8F0'}`,background:payMethod===method.key?'#FFF0F9':'white',cursor:'pointer',display:'flex',alignItems:'center',gap:'14px',transition:'all 0.2s'}}>
                <div style={{width:'20px',height:'20px',borderRadius:'50%',border:`2px solid ${payMethod===method.key?'#ec4899':'#CBD5E1'}`,background:payMethod===method.key?'#ec4899':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {payMethod===method.key && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'white'}}/>}
                </div>
                <span style={{fontSize:'22px'}}>{method.emoji}</span>
                <div>
                  <p style={{fontWeight:'700',color:'#0F172A',margin:0,fontSize:'14px'}}>{method.label}</p>
                  <p style={{fontSize:'12px',color:'#64748B',margin:0}}>{method.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <div style={{width:'36px',height:'36px',background:'#FFF0F9',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🛒</div>
            <h2 style={{fontWeight:'800',color:'#0F172A',margin:0,fontSize:'16px'}}>Order Summary</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
            {items.map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <img src={item.image} alt="" style={{width:'48px',height:'56px',objectFit:'cover',borderRadius:'8px',background:'#F1F5F9',flexShrink:0}} onError={e=>{e.target.style.background='#F1F5F9'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'12px',fontWeight:'600',color:'#374151',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</p>
                  <p style={{fontSize:'11px',color:'#94A3B8',margin:0}}>{item.size&&`Size: ${item.size}`} {item.color&&`· ${item.color}`} · Qty: {item.quantity}</p>
                </div>
                <span style={{fontSize:'14px',fontWeight:'700',color:'#0F172A',flexShrink:0}}>₹{(item.price*item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #F1F5F9',paddingTop:'14px',display:'flex',flexDirection:'column',gap:'8px',fontSize:'14px'}}>
            <div style={{display:'flex',justifyContent:'space-between',color:'#64748B'}}><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',color:'#64748B'}}><span>Shipping</span><span style={{color:shipping===0?'#16A34A':'#374151',fontWeight:shipping===0?'700':'400'}}>{shipping===0?'FREE':`₹${shipping}`}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:'800',color:'#0F172A',fontSize:'16px',paddingTop:'6px',borderTop:'1px solid #F1F5F9'}}><span>Total</span><span>₹{grand.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <button onClick={placeOrder} disabled={loading||!selectedAddr}
          style={{width:'100%',padding:'16px',background:loading||!selectedAddr?'#E2E8F0':'linear-gradient(135deg,#ec4899,#f97316)',color:loading||!selectedAddr?'#94A3B8':'white',border:'none',borderRadius:'14px',cursor:loading||!selectedAddr?'not-allowed':'pointer',fontWeight:'800',fontSize:'16px',fontFamily:f,boxShadow:loading||!selectedAddr?'none':'0 4px 15px rgba(236,72,153,0.3)'}}>
          {loading?'Processing...':(payMethod==='cod'?`Place Order (COD) — ₹${grand.toLocaleString('en-IN')}`:`Pay ₹${grand.toLocaleString('en-IN')}`)}
        </button>
        <p style={{textAlign:'center',fontSize:'12px',color:'#94A3B8',paddingBottom:'20px'}}>🔒 Secure & encrypted payments powered by Razorpay</p>
      </div>
    </div>
  )
}