import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'

import { logout } from '@/store'
import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'

const DoctorHomePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onLogout = () => {
    dispatch(logout())
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <div className="bg-grain min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center fade-up">
        <p className="text-xs uppercase tracking-[0.2em] text-clinic font-semibold">
          Doctor
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight leading-tight">
          Welcome, Dr. {user?.name?.split(' ')[0] || ''}.
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Your workspace — availability, queue, consultations, and earnings —
          lands in Phase 3 and beyond.
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-full"
          onClick={onLogout}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}

export default DoctorHomePage
