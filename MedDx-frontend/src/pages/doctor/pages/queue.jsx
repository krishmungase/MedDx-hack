import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import DoctorQueue from '../components/doctor-queue'

const QueuePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || ''

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          Welcome back, Dr. {first}.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Today's bookings live here. Joining a call opens 5 minutes before the
          slot start.
        </p>
      </div>

      <div className="fade-up fade-up-delay-1">
        <DoctorQueue />
      </div>
    </div>
  )
}

export default QueuePage
