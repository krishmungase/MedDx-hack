import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useTranslation as useI18n } from 'react-i18next'
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Mic,
  Sparkles,
  Zap,
} from 'lucide-react'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'
import { TriageChat } from '@/components'

import TriageForm from '../../patient/components/triage-form'
import TriageResult from '../../patient/components/triage-result'

/**
 * ASHA-facilitated consult flow.
 *
 * The ASHA holds the device; the villager (or the ASHA on their behalf)
 * speaks symptoms via the same voice-first TriageForm used in /patient/triage.
 * The triage result then routes into /asha/consult/doctor with the villager
 * context, where the ASHA picks a specialist and books on the villager's
 * behalf via the existing booking endpoint (attributed via bookedByAshaId +
 * villagePatientId).
 */
const ConsultStartPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t, i18n } = useTranslation()
  // Re-imported because TriageForm uses i18n.language for the mic locale and
  // we want to set it temporarily to the villager's language. Both hooks
  // resolve to the same i18n instance.
  void useI18n()

  const location = useLocation()
  const navigate = useNavigate()
  const villager = location.state?.villager

  const [originalLang] = useState(() => i18n.language)
  const [mode, setMode] = useState('quick') // 'quick' | 'chat'
  const [chatTriage, setChatTriage] = useState(null)
  const [chatDisclaimer, setChatDisclaimer] = useState(null)
  const [chatTranscript, setChatTranscript] = useState('')

  // Temporarily switch the UI + mic to the villager's language so the form
  // labels, voice prompts, and triage output all land in something they can
  // understand. Restored on unmount.
  useEffect(() => {
    if (villager?.language && villager.language !== i18n.language) {
      i18n.changeLanguage(villager.language)
    }
    return () => {
      if (originalLang && originalLang !== i18n.language) {
        i18n.changeLanguage(originalLang)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villager?.language])

  const { assess, isLoading, triage, disclaimer, reset, error } = useTriage()

  if (error) {
    errorToast({
      message:
        error?.response?.data?.message ||
        t('triage.submit', { defaultValue: 'Triage failed.' }),
    })
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

  const onSubmit = (payload) => {
    assess({
      data: {
        ...payload,
        // Override age/sex from the villager profile if the form didn't fill them.
        age: payload.age ?? villager.age ?? undefined,
        sex: payload.sex ?? villager.gender ?? undefined,
        language: villager.language || payload.language,
      },
    })
  }

  const onChatResult = ({ triage: t2, disclaimer: d2, transcript }) => {
    setChatTriage(t2)
    setChatDisclaimer(d2)
    setChatTranscript(transcript || '')
  }

  const onChatReset = () => {
    setChatTriage(null)
    setChatDisclaimer(null)
    setChatTranscript('')
  }

  const activeTriage = mode === 'chat' ? chatTriage : triage
  const activeDisclaimer = mode === 'chat' ? chatDisclaimer : disclaimer
  const onActiveReset = mode === 'chat' ? onChatReset : reset

  const onBook = () => {
    if (!activeTriage) return
    navigate(
      `/asha/consult/doctor?specialty=${encodeURIComponent(activeTriage.specialty)}`,
      {
        state: {
          villager,
          triage: {
            specialty: activeTriage.specialty,
            urgency: activeTriage.urgency,
            summary:
              mode === 'chat' && chatTranscript
                ? `${activeTriage.summary}\n\n--- Transcript ---\n${chatTranscript}`
                : activeTriage.summary,
            reason: activeTriage.reason,
          },
        },
      }
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate(`/asha/patients/${villager._id}`)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('asha.detail.back')}
      </button>

      {/* Villager strip */}
      <section className="rounded-3xl border border-border/70 bg-card p-5 flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-base font-semibold">
          {villager.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg tracking-tight truncate">
            {villager.name}{' '}
            {villager.age && (
              <span className="text-sm text-muted-foreground font-normal">
                · {villager.age}
              </span>
            )}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {villager.village && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {villager.village}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Mic className="h-3 w-3" />
              {t('asha.consult.speaking_in', { lang: villager.language })}
            </span>
          </div>
        </div>
      </section>

      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          {t('triage.card_eyebrow')}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('asha.consult.triage_title', { name: villager.name })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('asha.consult.triage_hint')}
        </p>
      </div>

      {!activeTriage && (
        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card p-1">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'quick'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {t('triage.mode_quick', { defaultValue: 'Quick symptom check' })}
          </button>
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {t('triage.mode_chat', { defaultValue: 'Guided voice check' })}
          </button>
        </div>
      )}

      {!activeTriage ? (
        mode === 'quick' ? (
          <TriageForm onSubmit={onSubmit} isLoading={isLoading} />
        ) : (
          <TriageChat
            language={villager.language || i18n.language}
            onResult={onChatResult}
            contextLine={t('asha.consult.book_eyebrow', { name: villager.name })}
          />
        )
      ) : (
        <TriageResult
          triage={activeTriage}
          disclaimer={activeDisclaimer}
          onReset={onActiveReset}
          onBook={onBook}
        />
      )}
    </div>
  )
}

export default ConsultStartPage
