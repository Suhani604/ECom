import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyOrdersAPI, cancelOrderAPI } from '../../api/orderAPI.js'

const f = 'Poppins, sans-serif'

const STATUS_STEPS = ['placed','confirmed','packed','shipped','out_for_delivery','delivered']
const STATUS_STYLE = {
  placed:           {bg:'#EFF6FF',color:'#1D4ED8'},
  confirmed:        {bg:'#EEF2FF',color:'#4338CA'},
  packed:           {bg:'#FFFBEB',color:'#B45309'},
  shipped:          {bg:'#FFF7ED',color:'#C2410C'},
  out_for_delivery: {bg:'#F5F3FF',color:'#6D28D9'},
  delivered:        {bg:'#F0FDF4',color:'#15803D'},
  cancelled:        {bg:'#FFF1F2',color:'#BE123C'},
  return_requested: {bg:'#FDF4FF',color:'#A21CAF'},
  returned:         {bg:'#F8FAFC',color:'#64748B'},
}

const TABS = [{key:'',label:'All'},{key:'placed',label:'Placed'},{key:'shipped',label:'Shipped'},{key:'delivered',label:'Delivered'},{key:'cancelled',label:'Cancelled'}]

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const {data} = await getMyOrdersAPI({page,limit:LIMIT,status:status||undefined})
      setOrders(data.data||[])
      setTotal(data.pagination?.total||0)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [page, status])

  useEffect(()=>{ fetchOrders() },[fetchOrders])

  const handleCancel = async (id) => {
    if(!window.confirm('Cancel this order?')) return
    try {
      await cancelOrderAPI(id)
      toast.success('Order cancelled')
      fetchOrders()
    } catch(e){ toast.error(e.response?.data?.message||'Cannot cancel') }
  }

  const totalPages = Math.ceil(total/LIMIT)

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFC',fontFamily:f}}>
      {/* Header */}
      <div style={{background:'white',padding:'0 20px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #E2E8F0',position:'sticky',top:0,zIndex:10,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <button onClick={()=>navigate('/')} style={{background:'#F1F5F9',border:'none',width:'36px',height:'36px',borderRadius:'0%',cursor:'pointer',fontSize:'18px'}}>←</button>
          <h1 style={{fontSize:'18px',fontWeight:'800',color:'#0F172A',margin:0}}>My Orders</h1>
        </div>
        <button onClick={fetchOrders} style={{background:'#F1F5F9',border:'none',width:'36px',height:'36px',borderRadius:'50%',cursor:'pointer',fontSize:'16px'}}>↻</button>
      </div>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'16px'}}>
        {/* Status tabs */}
        <div style={{display:'flex',gap:'6px',marginBottom:'16px',overflowX:'auto',paddingBottom:'4px'}}>
          {TABS.map(tab=>(
            <button key={tab.key} onClick={()=>{setStatus(tab.key);setPage(1)}}
              style={{padding:'8px 18px',borderRadius:'0px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:'700',fontFamily:f,whiteSpace:'nowrap',background:status===tab.key?'linear-gradient(135deg,#ec4899,#f97316)':'white',color:status===tab.key?'white':'#64748B',boxShadow:status===tab.key?'0 2px 8px rgba(236,72,153,0.3)':'0 1px 3px rgba(0,0,0,0.06)'}}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{background:'white',borderRadius:'0px',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <div style={{height:'14px',background:'#F1F5F9',borderRadius:'6px',width:'40%',marginBottom:'12px'}}/>
                <div style={{display:'flex',gap:'12px'}}>
                  <div style={{width:'64px',height:'80px',background:'#F1F5F9',borderRadius:'0px'}}/>
                  <div style={{flex:1}}>
                    <div style={{height:'12px',background:'#F1F5F9',borderRadius:'0px',width:'80%',marginBottom:'8px'}}/>
                    <div style={{height:'12px',background:'#F1F5F9',borderRadius:'6px',width:'50%'}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>📦</div>
            <h3 style={{fontSize:'20px',fontWeight:'800',color:'#0F172A',margin:'0 0 8px'}}>No orders found</h3>
            <p style={{color:'#64748B',margin:'0 0 24px',fontSize:'14px'}}>Start shopping to see your orders here</p>
            <button onClick={()=>navigate('/')} style={{padding:'13px 28px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'0px',cursor:'pointer',fontWeight:'700',fontSize:'14px',fontFamily:f}}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {orders.map(order=>{
              const stepIdx   = STATUS_STEPS.indexOf(order.status)
              const progress  = stepIdx>=0?((stepIdx+1)/STATUS_STEPS.length)*100:0
              const canCancel = ['placed','confirmed','packed'].includes(order.status)
              const sc        = STATUS_STYLE[order.status]||STATUS_STYLE.placed

              return (
                <div key={order._id} style={{background:'white',borderRadius:'0px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #F1F5F9'}}>
                  {/* Order header */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid #F8FAFC',background:'#FAFBFF'}}>
                    <div>
                      <p style={{fontSize:'11px',color:'#94A3B8',fontFamily:'monospace',margin:'0 0 2px',fontWeight:'600'}}>#{order._id.slice(-8).toUpperCase()}</p>
                      <p style={{fontSize:'12px',color:'#64748B',margin:0}}>{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:'11px',padding:'4px 10px',borderRadius:'0px',fontWeight:'700',background:sc.bg,color:sc.color}}>
                        {order.status?.replace(/_/g,' ')}
                      </span>
                      <p style={{fontSize:'11px',color:'#94A3B8',margin:'3px 0 0'}}>{order.paymentMethod==='cod'?'Cash on Delivery':'Paid Online'}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{padding:'14px 16px'}}>
                    {order.items?.slice(0,2).map((item,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:i<(order.items.length-1)&&i<1?'10px':'0'}}>
                        <img src={item.image} alt="" style={{width:'52px',height:'64px',objectFit:'cover',borderRadius:'10px',background:'#F1F5F9',flexShrink:0}} onError={e=>{e.target.style.background='#F1F5F9'}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',margin:'0 0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</p>
                          <p style={{fontSize:'11px',color:'#94A3B8',margin:'0 0 4px'}}>{item.size&&`Size: ${item.size}`} · Qty: {item.quantity}</p>
                          <p style={{fontSize:'13px',fontWeight:'700',color:'#0F172A',margin:0}}>₹{(item.sellingPrice*item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length>2 && <p style={{fontSize:'12px',color:'#94A3B8',margin:'8px 0 0'}}>+{order.items.length-2} more items</p>}
                  </div>

                  {/* Progress bar */}
                  {stepIdx>=0 && order.status!=='cancelled' && (
                    <div style={{padding:'0 16px 12px'}}>
                      <div style={{width:'100%',height:'6px',background:'#F1F5F9',borderRadius:'0px',overflow:'hidden'}}>
                        <div style={{height:'100%',background:'linear-gradient(135deg,#ec4899,#f97316)',borderRadius:'0px',width:`${progress}%`,transition:'width 0.5s'}}/>
                      </div>
                      <p style={{fontSize:'11px',color:'#ec4899',fontWeight:'700',margin:'6px 0 0',textTransform:'capitalize'}}>{order.status?.replace(/_/g,' ')}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#F8FAFC',borderTop:'1px solid #F1F5F9'}}>
                    <div>
                      <span style={{fontSize:'12px',color:'#64748B'}}>Total: </span>
                      <span style={{fontSize:'15px',fontWeight:'800',color:'#0F172A'}}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{display:'flex',gap:'8px'}}>
                      {canCancel && (
                        <button onClick={()=>handleCancel(order._id)}
                          style={{padding:'7px 14px',background:'#FFF1F2',color:'#BE123C',border:'none',borderRadius:'0px',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:f}}>
                          Cancel
                        </button>
                      )}
                      <button onClick={()=>navigate(`/order/${order._id}`)}
                        style={{padding:'7px 14px',background:'linear-gradient(135deg,#ec4899,#f97316)',color:'white',border:'none',borderRadius:'0px',cursor:'pointer',fontSize:'12px',fontWeight:'700',fontFamily:f}}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {totalPages>1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'8px 0 20px'}}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'8px 18px',border:'1.5px solid #E2E8F0',borderRadius:'0px',background:'white',cursor:page===1?'not-allowed':'pointer',opacity:page===1?0.4:1,fontFamily:f,fontSize:'13px',fontWeight:'600'}}>← Prev</button>
                <span style={{fontSize:'13px',color:'#64748B',fontWeight:'600'}}>Page {page} / {totalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'8px 18px',border:'1.5px solid #E2E8F0',borderRadius:'0px',background:'white',cursor:page===totalPages?'not-allowed':'pointer',opacity:page===totalPages?0.4:1,fontFamily:f,fontSize:'13px',fontWeight:'600'}}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}