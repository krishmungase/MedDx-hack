import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

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
      <PageHeader
        eyebrow={t('nav.doctors', { defaultValue: 'Doctors' })}
        title={
          triage
            ? t('doctors_page.title_triage', { specialty: triage.specialty })
            : t('doctors_page.title_default')
        }
        description={
          triage
            ? t('doctors_page.subtitle_triage')
            : t('doctors_page.subtitle_default')
        }
      />

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
