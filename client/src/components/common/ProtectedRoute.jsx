import { Navigate } from 'react-router-dom'
import useAuthStore from '../../context/useAuthStore.js'

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    const routes = { buyer: '/home', seller: '/seller/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={routes[user.role] || '/login'} replace />
  }
  return children
}