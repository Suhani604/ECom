import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiLogOut, FiX, FiGrid, FiUsers, FiPackage,
  FiShoppingBag, FiTrendingUp, FiStar, FiImage, FiLayers, FiTruck
} from 'react-icons/fi'
import useAuthStore from '../../context/useAuthStore.js'

const LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', Icon: FiGrid },
  { path: '/admin/sellers',   label: 'Sellers',   Icon: FiShoppingBag },
  { path: '/admin/products',  label: 'Products',  Icon: FiPackage },
  { path: '/admin/buyers',    label: 'Buyers',    Icon: FiUsers },
  { path: '/admin/orders',    label: 'Orders',    Icon: FiTrendingUp },
  { path: '/admin/reviews',   label: 'Reviews',   Icon: FiStar },
  { path: '/admin/banners',   label: 'Banners',   Icon: FiImage },
  // LINKS array mein Banners ke neeche add karo
  { path: '/admin/categories', label: 'Categories', Icon: FiLayers },
  { path: '/admin/categories',         label: 'Categories', Icon: FiLayers },
  { path: '/admin/delivery-partners',  label: 'Delivery',   Icon: FiTruck  },
]

export default function AdminSidebar({ open, onClose }) {
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-white border-r border-gray-100
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto`}
        style={{ fontFamily: 'Poppins, sans-serif', boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>S</div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: '#E91E8C' }}>Style<span style={{ color: '#7C3AED' }}>Hub</span></p>
              <p className="text-xs text-gray-400 leading-tight">Admin Console</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <FiX size={16} />
          </button>
        </div>

        <div className="mx-4 mt-4 mb-1 px-3 py-2.5 rounded-xl flex items-center gap-3" style={{ background: '#FDF0F8' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#E91E8C,#7C3AED)' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>

        <p className="px-5 pt-4 pb-1 text-xs font-bold text-gray-300 uppercase tracking-widest">Main</p>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {LINKS.map(({ path, label, Icon }) => (
            <NavLink key={path} to={path} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg,#E91E8C,#7C3AED)', boxShadow: '0 4px 12px rgba(233,30,140,0.25)' }
                : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}