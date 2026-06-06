import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiBell, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../api/axiosInstance.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import useAuthStore from '../../context/useAuthStore.js'

const f = '"DM Sans", Poppins, sans-serif'

const STATUS_STYLE = {
  online:    { bg: '#F0FDF4', color: '#15803D', label: '🟢 Online'  },
  offline:   { bg: '#F1F5F9', color: '#64748B', label: '⚫ Offline' },
  approved:  { bg: '#EFF6FF', color: '#1D4ED8', label: '✅ Approved' },
  pending:   { bg: '#FFFBEB', color: '#B45309', label: '⏳ Pending'  },
}

export default function AdminDeliveryPartnersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [sideOpen,   setSideOpen]   = useState(false)
  const [partners,   setPartners]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [approving,  setApproving]  = useState(null)
  const [filter,     setFilter]     = useState('all')

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/delivery-partners')
      setPartners(data.data?.partners || data.partners || data.data || [])
    } catch { toast.error('Failed to load delivery partners') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  const approvePartner = async (id) => {
    setApproving(id)
    try {
      await api.put(`/admin/delivery-partners/${id}/approve`)
      toast.success('Delivery partner approved!')
      fetchPartners()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve')
    } finally { setApproving(null) }
  }

  const filtered = partners.filter(p => {
    if (filter === 'pending')  return !p.isApproved
    if (filter === 'approved') return p.isApproved
    if (filter === 'online')   return p.isOnline
    return true
  })

  const pendingCount  = partners.filter(p => !p.isApproved).length
  const onlineCount   = partners.filter(p => p.isOnline).length
  const approvedCount = partners.filter(p => p.isApproved).length

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: f }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .tab-btn { padding:7px 14px; border:1.5px solid #E2E8F0; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; font-family:${f}; background:white; color:#64748B; transition:all 0.15s; }
        .tab-btn.active { background:linear-gradient(135deg,#f97316,#ec4899); color:white; border-color:transparent; }
        .partner-card { background:white; border-radius:14px; border:1px solid #F1F5F9; box-shadow:0 2px 10px rgba(0,0,0,0.06); transition:box-shadow 0.2s; overflow:hidden; }
        .partner-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.1); }
      `}</style>

      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">Delivery Partners</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{partners.length} total partners</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span style={{ fontSize:'11px', background:'#FFFBEB', color:'#B45309', padding:'4px 10px', borderRadius:'20px', fontWeight:'700', border:'1px solid #FDE68A' }}>
                ⏳ {pendingCount} pending approval
              </span>
            )}
            <button onClick={fetchPartners} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 text-base">↻</button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background:'linear-gradient(135deg,#ec4899,#f97316)' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 space-y-5 max-w-5xl w-full mx-auto">

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
            {[
              { label:'Total Partners', value: partners.length, bg:'#EFF6FF', color:'#1D4ED8', emoji:'🛵' },
              { label:'Online Now',     value: onlineCount,     bg:'#F0FDF4', color:'#15803D', emoji:'🟢' },
              { label:'Pending Approval', value: pendingCount,  bg:'#FFFBEB', color:'#B45309', emoji:'⏳' },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, borderRadius:'14px', padding:'16px', border:`1px solid ${s.color}20` }}>
                <p style={{ fontSize:'11px', color:s.color, fontWeight:'700', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.emoji} {s.label}</p>
                <p style={{ fontSize:'28px', fontWeight:'900', color:s.color, margin:0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[
              { key:'all',      label:`All (${partners.length})` },
              { key:'pending',  label:`⏳ Pending (${pendingCount})` },
              { key:'approved', label:`✅ Approved (${approvedCount})` },
              { key:'online',   label:`🟢 Online (${onlineCount})` },
            ].map(t => (
              <button key={t.key} className={`tab-btn${filter === t.key ? ' active' : ''}`}
                onClick={() => setFilter(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Partners list */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#94A3B8' }}>
              <div style={{ width:'32px', height:'32px', border:'3px solid #ec4899', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
              Loading partners...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'56px', marginBottom:'12px' }}>🛵</div>
              <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>No partners found</h3>
              <p style={{ color:'#64748B', fontSize:'14px' }}>No delivery partners in this category</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {filtered.map(partner => (
                <div key={partner._id} className="partner-card">
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderBottom:'1px solid #F8FAFC', background:'#FAFBFF' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'16px', fontWeight:'800', flexShrink:0 }}>
                        {partner.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p style={{ fontSize:'14px', fontWeight:'700', color:'#0F172A', margin:'0 0 2px' }}>{partner.name}</p>
                        <p style={{ fontSize:'11px', color:'#94A3B8', margin:0 }}>{partner.phone} · {partner.email}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:'700', ...(partner.isOnline ? STATUS_STYLE.online : STATUS_STYLE.offline) }}>
                        {partner.isOnline ? '🟢 Online' : '⚫ Offline'}
                      </span>
                      <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:'700', ...(partner.isApproved ? STATUS_STYLE.approved : STATUS_STYLE.pending) }}>
                        {partner.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding:'13px 18px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
                    <div>
                      <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 2px', fontWeight:'600' }}>VEHICLE</p>
                      <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', margin:0 }}>{partner.vehicleNumber || '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 2px', fontWeight:'600' }}>SERVICE AREA</p>
                      <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', margin:0 }}>
                        {partner.serviceArea?.city || '—'} — {partner.serviceArea?.pincode || '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize:'11px', color:'#94A3B8', margin:'0 0 2px', fontWeight:'600' }}>TOTAL ORDERS</p>
                      <p style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', margin:0 }}>{partner.totalOrders || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding:'10px 18px 13px', borderTop:'1px solid #F1F5F9', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ fontSize:'12px', color:'#64748B', fontWeight:'600' }}>
                        ⭐ {partner.rating?.toFixed(1) || '5.0'} rating
                      </span>
                      <span style={{ color:'#CBD5E1' }}>·</span>
                      <span style={{ fontSize:'12px', color:'#64748B', fontWeight:'600' }}>
                        💰 ₹{partner.totalEarnings || 0} earned
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      {!partner.isApproved && (
                        <button
                          disabled={approving === partner._id}
                          onClick={() => approvePartner(partner._id)}
                          style={{ padding:'7px 16px', background: approving === partner._id ? '#E2E8F0' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: approving === partner._id ? '#94A3B8' : 'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:f }}>
                          {approving === partner._id ? '...' : '✅ Approve'}
                        </button>
                      )}
                      {partner.isApproved && (
                        <span style={{ fontSize:'12px', color:'#15803D', fontWeight:'700', padding:'7px 16px', background:'#F0FDF4', borderRadius:'8px', border:'1px solid #BBF7D0' }}>
                          ✅ Active Partner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}