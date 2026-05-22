import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'

import TriageForm from '../components/triage-form'
import TriageResult from '../components/triage-result'

const TriagePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { assess, isLoading, triage, disclaimer, reset, error } = useTriage()

  const onSubmit = (payload) => {
    assess({ data: payload })
  }

  const onBook = () => {
    if (!triage) return
    navigate(
      `/patient/doctors?specialty=${encodeURIComponent(triage.specialty)}`,
      {
        state: {
          triage: {
            specialty: triage.specialty,
            urgency: triage.urgency,
            summary: triage.summary,
            reason: triage.reason,
          },
        },
      }
    )
  }

  if (error) {
    errorToast({
      message:
        error?.response?.data?.message ||
        'Symptom check failed — please try again.',
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          {t('triage.page_title')}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          {t('triage.page_subtitle')}
        </p>
      </div>

      {!triage ? (
        <div className="fade-up fade-up-delay-1">
          <TriageForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      ) : (
        <div className="fade-up fade-up-delay-1">
          <TriageResult
            triage={triage}
            disclaimer={disclaimer}
            onReset={reset}
            onBook={onBook}
          />
        </div>
      )}
    </div>
  )
}

export default TriagePage
