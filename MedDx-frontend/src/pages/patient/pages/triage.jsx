import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'
import { PageHeader } from '@/components'

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
      <PageHeader
        eyebrow={t('nav.triage', { defaultValue: 'Symptom check' })}
        title={t('triage.page_title')}
        description={t('triage.page_subtitle')}
      />

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
