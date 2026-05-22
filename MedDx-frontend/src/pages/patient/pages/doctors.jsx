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
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          {triage
            ? t('doctors_page.title_triage', { specialty: triage.specialty })
            : t('doctors_page.title_default')}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          {triage
            ? t('doctors_page.subtitle_triage')
            : t('doctors_page.subtitle_default')}
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
