import { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiRefreshCw, FiUserX, FiUserCheck, FiDownload, FiMenu } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getAllBuyersAPI, toggleBlockAPI } from '../../api/adminAPI.js'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import NotificationBell from '../../components/common/NotificationBell.jsx'

const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg,#FCE4F3,#EDD6FD)', color: '#9333EA' },
  { bg: 'linear-gradient(135deg,#DCF5FF,#D0EBFF)', color: '#1D6FA4' },
  { bg: 'linear-gradient(135deg,#DCFCE7,#D5F5D3)', color: '#16A34A' },
  { bg: 'linear-gradient(135deg,#FFF3DC,#FEEAC8)', color: '#D97706' },
  { bg: 'linear-gradient(135deg,#FFE4E6,#FFD5D5)', color: '#DC2626' },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function getAvatarStyle(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

const f = 'Poppins, sans-serif'

export default function AdminBuyersPage() {
  const [sideOpen,      setSideOpen]      = useState(false)
  const [buyers,        setBuyers]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(1)
  const [total,         setTotal]         = useState(0)
  const [activeTab,     setActiveTab]     = useState('all')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const LIMIT = 10

  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAllBuyersAPI({ page, limit: LIMIT, search: search || undefined })
      setBuyers(data.data)
      setTotal(data.pagination.total)
    } catch { toast.error('Failed to load buyers') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchBuyers() }, [fetchBuyers])

  const handleBlock = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Block' : 'Unblock'} "${name}"?`)) return
    try {
      await toggleBlockAPI(id)
      toast.success(isActive ? 'Buyer blocked' : 'Buyer unblocked')
      fetchBuyers()
    } catch { toast.error('Failed') }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const activeCount  = buyers.filter(b => b.isActive).length
  const blockedCount = buyers.filter(b => !b.isActive).length

  const visibleBuyers = buyers.filter(b =>
    filterStatus === 'all' ? true : filterStatus === 'active' ? b.isActive : !b.isActive
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: f, background: '#F9F9FB' }}>
      <AdminSidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: 'white', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EBEBF0', position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSideOpen(true)} style={{ background: '#F9F9FB', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex' }} className="lg:hidden">☰</button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A2E', margin: 0, fontFamily: f }}>Buyers</h1>
            <span style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', color: 'white', padding: '3px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>{total} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' }}>AD</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px', marginBottom: '22px' }}>
            {[
              { label: 'Total Buyers', val: total,        icon: '👥', accent: '#E91E8C', light: '#FDF0F8', badge: '↑ 12% this month', up: true },
              { label: 'Active',       val: activeCount,  icon: '✅', accent: '#16A34A', light: '#DCFCE7', badge: '↑ 88.4%',           up: true },
              { label: 'Orders Today', val: 847,          icon: '🛍️', accent: '#0EA5E9', light: '#E0F2FE', badge: '↑ 5.2%',            up: true },
              { label: 'Blocked',      val: blockedCount, icon: '🚫', accent: '#DC2626', light: '#FEE2E2', badge: '↓ 11.6%',           up: false },
            ].map(({ label, val, icon, accent, light, badge, up }) => (
              <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '18px 20px', border: '1px solid #EBEBF0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', borderRadius: '0 16px 0 70px', background: accent, opacity: 0.07 }} />
                <div style={{ fontSize: '20px', position: 'absolute', right: '16px', top: '16px', opacity: 0.25 }}>{icon}</div>
                <p style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px', fontWeight: '600' }}>{label}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A2E', margin: '0 0 6px' }}>{val.toLocaleString('en-IN')}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '500', background: up ? '#DCFCE7' : '#FEE2E2', color: up ? '#16A34A' : '#DC2626' }}>{badge}</span>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <FiSearch style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#C0C0D0' }} size={14} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, email or phone..."
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1px solid #EBEBF0', borderRadius: '12px', fontSize: '13px', fontFamily: f, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {[['all', 'All Buyers'], ['active', 'Active'], ['blocked', 'Blocked']].map(([val, label]) => (
              <button key={val} onClick={() => { setFilterStatus(val); setPage(1) }}
                style={{ padding: '9px 16px', border: filterStatus === val ? 'none' : '1px solid #EBEBF0', borderRadius: '12px', background: filterStatus === val ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'white', color: filterStatus === val ? 'white' : '#6B7280', fontSize: '13px', fontFamily: f, cursor: 'pointer', fontWeight: filterStatus === val ? '600' : '400', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: filterStatus === val ? '0 4px 12px rgba(233,30,140,0.25)' : 'none' }}>
                {label}
              </button>
            ))}

            <button onClick={fetchBuyers} style={{ width: '42px', height: '42px', border: '1px solid #EBEBF0', borderRadius: '12px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>
              <FiRefreshCw size={15} />
            </button>

            <button style={{ padding: '9px 18px', borderRadius: '12px', background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', border: 'none', color: 'white', fontSize: '13px', fontFamily: f, cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <FiDownload size={14} /> Export
            </button>
          </div>

          {/* Table card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #EBEBF0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #EBEBF0', padding: '0 20px' }}>
              {[['all', 'All Buyers'], ['new', 'New This Week'], ['highvalue', 'High Value']].map(([val, label]) => (
                <button key={val} onClick={() => setActiveTab(val)}
                  style={{ padding: '14px 16px', fontSize: '13px', color: activeTab === val ? '#E91E8C' : '#6B7280', cursor: 'pointer', border: 'none', borderBottom: activeTab === val ? '2px solid #E91E8C' : '2px solid transparent', background: 'none', fontFamily: f, fontWeight: activeTab === val ? '600' : '400', transition: 'all 0.2s', marginBottom: '-1px' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#FCFCFE' }}>
                    {['Buyer', 'Email', 'Phone', 'Status', 'Joined', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                      <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #F8D0EC', borderTopColor: '#E91E8C', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: '8px', verticalAlign: 'middle' }} />
                      Loading buyers...
                    </td></tr>
                  ) : visibleBuyers.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>No buyers found
                    </td></tr>
                  ) : visibleBuyers.map(buyer => {
                    const av = getAvatarStyle(buyer.name)
                    return (
                      <tr key={buyer._id} style={{ borderTop: '1px solid #EBEBF0', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FDF6FB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{getInitials(buyer.name)}</div>
                            <div>
                              <p style={{ fontWeight: '600', color: '#1A1A2E', margin: 0, fontSize: '13px' }}>{buyer.name}</p>
                              <p style={{ fontSize: '11px', color: '#B0B0C0', margin: 0 }}>#{buyer._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B4B6B' }}>{buyer.email}</td>
                        <td style={{ padding: '14px 16px', color: '#4B4B6B' }}>{buyer.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: buyer.isActive ? '#DCFCE7' : '#FEE2E2', color: buyer.isActive ? '#16A34A' : '#DC2626' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: buyer.isActive ? '#22C55E' : '#F87171' }} />
                            {buyer.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8', fontSize: '12px' }}>{new Date(buyer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => handleBlock(buyer._id, buyer.name, buyer.isActive)}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: f, display: 'inline-flex', alignItems: 'center', gap: '5px', background: buyer.isActive ? '#FEE2E2' : '#DCFCE7', color: buyer.isActive ? '#DC2626' : '#16A34A', transition: 'all 0.18s' }}>
                            {buyer.isActive ? <><FiUserX size={12} /> Block</> : <><FiUserCheck size={12} /> Unblock</>}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #EBEBF0', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} buyers</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: '6px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '12px', fontFamily: f }}>← Prev</button>
                  {[...Array(Math.min(3, totalPages))].map((_, i) => (
                    <button key={i + 1} onClick={() => setPage(i + 1)}
                      style={{ minWidth: '32px', height: '32px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: f, background: page === i + 1 ? 'linear-gradient(135deg,#E91E8C,#7C3AED)' : 'white', color: page === i + 1 ? 'white' : '#4B4B6B', border: page === i + 1 ? 'none' : '1px solid #EBEBF0' }}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: '6px 14px', border: '1px solid #EBEBF0', borderRadius: '8px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontSize: '12px', fontFamily: f }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}