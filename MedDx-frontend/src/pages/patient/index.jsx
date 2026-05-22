import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'

import { logout } from '@/store'
import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'

const PatientHomePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
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
          Patient
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight leading-tight">
          Hello, {user?.name?.split(' ')[0] || 'there'}.
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Your patient workspace will land in Phase 4 with symptom checker,
          doctor search, and video consults.
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

export default PatientHomePage
