import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import FindDoctor from '../components/find-doctor'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const specialtyFilter = searchParams.get('specialty') || null
  const triage = location.state?.triage || null

  const clearSpecialty = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('specialty')
    setSearchParams(next)
    if (location.state?.triage) {
      navigate(location.pathname + (next.toString() ? `?${next}` : ''), {
        replace: true,
        state: {},
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact greeting strip — FindDoctor's own search hero leads visually */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('nav.doctors', { defaultValue: 'Doctors' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {triage
            ? t('doctors_page.title_triage', { specialty: triage.specialty })
            : t('doctors_page.title_default')}
        </h1>
      </div>

      <FindDoctor
        specialtyFilter={specialtyFilter}
        onClearSpecialty={clearSpecialty}
        triage={triage}
        onBooked={() => navigate('/patient')}
      />
    </div>
  )
}

export default DoctorsPage
