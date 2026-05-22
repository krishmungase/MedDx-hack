import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import FindDoctor from '../components/find-doctor'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const specialtyFilter = searchParams.get('specialty') || null
  // Triage context is passed via router state from the symptom-check page.
  const triage = location.state?.triage || null

  const clearSpecialty = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('specialty')
    setSearchParams(next)
    // Also drop the triage banner — the patient explicitly opted out of it.
    if (location.state?.triage) {
      navigate(location.pathname + (next.toString() ? `?${next}` : ''), {
        replace: true,
        state: {},
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          {triage ? `Specialists in ${triage.specialty}.` : 'Find a specialist.'}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          {triage
            ? 'These doctors match the specialty suggested by your symptom check. Pick a time that suits you.'
            : 'Browse verified doctors and book a 30-minute video consult at any open time. All bookings are free during early access.'}
        </p>
      </div>

      <div className="fade-up fade-up-delay-1">
        <FindDoctor
          specialtyFilter={specialtyFilter}
          onClearSpecialty={clearSpecialty}
          triage={triage}
          onBooked={() => navigate('/patient')}
        />
      </div>
    </div>
  )
}

export default DoctorsPage
