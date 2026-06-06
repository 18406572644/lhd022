import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/user'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const user = useUserStore((state) => state.user)
  const location = useLocation()

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AuthGuard
