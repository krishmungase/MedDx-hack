import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

import DoctorQueue from '../components/doctor-queue'

const QueuePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || ''

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor · Queue"
        title={`Welcome back, Dr. ${first}.`}
        description="Today's bookings live here. Joining a call opens 5 minutes before the slot start."
      />

      <div className="fade-up fade-up-delay-1">
        <DoctorQueue />
      </div>
    </div>
  )
}

export default QueuePage
