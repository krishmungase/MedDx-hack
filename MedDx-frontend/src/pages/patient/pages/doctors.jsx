import { useNavigate } from 'react-router'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import FindDoctor from '../components/find-doctor'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          Find a specialist.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Browse verified doctors and book a 30-minute video consult at any
          open time. All bookings are free during early access.
        </p>
      </div>

      <div className="fade-up fade-up-delay-1">
        <FindDoctor onBooked={() => navigate('/patient')} />
      </div>
    </div>
  )
}

export default DoctorsPage
