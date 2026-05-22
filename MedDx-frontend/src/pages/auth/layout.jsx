import { Navigate, Outlet } from 'react-router'

import { useAuth } from '@/hooks'

const AuthLayout = () => {
  const { isAuth, user } = useAuth()
  if (isAuth && user?.role) {
    return <Navigate to={`/${user.role}`} replace />
  }
  return <Outlet />
}

export default AuthLayout
