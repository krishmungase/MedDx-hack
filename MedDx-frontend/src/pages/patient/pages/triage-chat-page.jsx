import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { TriageChat } from '@/components'

import TriageResult from '../components/triage-result'

const TriageChatPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [triage, setTriage] = useState(null)
  const [disclaimer, setDisclaimer] = useState(null)
  const [transcript, setTranscript] = useState('')

  const onResult = ({ triage: t2, disclaimer: d2, transcript: tx }) => {
    setTriage(t2)
    setDisclaimer(d2)
    setTranscript(tx || '')
  }

  const onReset = () => {
    setTriage(null)
    setDisclaimer(null)
    setTranscript('')
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
            summary: transcript
              ? `${triage.summary}\n\n--- Transcript ---\n${transcript}`
              : triage.summary,
            reason: triage.reason,
          },
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/patient/triage')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('triage.chooser_back', { defaultValue: 'Back' })}
      </button>

      {!triage ? (
        <TriageChat language={i18n.language} onResult={onResult} />
      ) : (
        <TriageResult
          triage={triage}
          disclaimer={disclaimer}
          onReset={onReset}
          onBook={onBook}
        />
      )}
    </div>
  )
}

export default TriageChatPage
