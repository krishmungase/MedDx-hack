import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import FindDoctor from '../../patient/components/find-doctor'

/**
 * Doctor picker for an ASHA-assisted consult. Reuses the existing FindDoctor
 * component, just hands it the villager + triage so the embedded
 * BookDoctorDialog can attribute the booking to the village patient.
 */
const ConsultDoctorPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const triage = location.state?.triage || null
  const villager = location.state?.villager || null
  const specialtyFilter = searchParams.get('specialty') || null

  const clearSpecialty = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('specialty')
    setSearchParams(next)
  }

  if (!villager) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">
          {t('asha.consult.no_villager')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/asha/patients')}
          className="text-primary text-sm"
        >
          {t('asha.detail.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/asha/consult/start', { state: { villager } })}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('asha.consult.back_to_triage')}
      </button>

      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('asha.consult.book_eyebrow', { name: villager.name })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {triage
            ? t('doctors_page.title_triage', { specialty: triage.specialty })
            : t('doctors_page.title_default')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {triage
            ? t('doctors_page.subtitle_triage')
            : t('doctors_page.subtitle_default')}
        </p>
      </div>

      <FindDoctor
        specialtyFilter={specialtyFilter}
        onClearSpecialty={clearSpecialty}
        triage={triage}
        villagePatient={villager}
        onBooked={() =>
          navigate(`/asha/patients/${villager._id}`, { replace: true })
        }
      />
    </div>
  )
}

export default ConsultDoctorPage
