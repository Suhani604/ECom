import { Navigate } from 'react-router-dom'
import useDeliveryStore from '../../context/useDeliveryStore'

export default function DeliveryProtectedRoute({ children }) {
  const isLoggedIn = useDeliveryStore((s) => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/delivery/login" replace />
  return children
}