import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

import AddAvailabilityCard from '../components/add-availability-card'
import SlotsList from '../components/slots-list'

const AvailabilityPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor · Availability"
        title="Your availability."
        description="Open windows in 30-minute steps. Patients see only your future, unbooked slots when they search for specialists."
      />

      <div className="fade-up fade-up-delay-1">
        <AddAvailabilityCard />
      </div>

      <div className="fade-up fade-up-delay-2">
        <SlotsList />
      </div>
    </div>
  )
}

export default AvailabilityPage
