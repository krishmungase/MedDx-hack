import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/hooks'

const ProtectedRoute = ({ role }) => {
  const { isAuth, user } = useAuth()
  const location = useLocation()

  if (!isAuth) {
    return (
      <Navigate
        to="/auth/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (role && user?.role !== role) {
    const fallback = user?.role ? `/${user.role}` : '/auth/sign-in'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
