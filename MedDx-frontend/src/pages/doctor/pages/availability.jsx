import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import AddAvailabilityCard from '../components/add-availability-card'
import SlotsList from '../components/slots-list'

const AvailabilityPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          Your availability.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Open windows in 30-minute steps. Patients see only your future,
          unbooked slots when they search for specialists.
        </p>
      </div>

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
