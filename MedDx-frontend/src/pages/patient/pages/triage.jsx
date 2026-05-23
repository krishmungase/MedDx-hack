import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Globe, MessageSquare, ShieldCheck, Sparkles, Zap } from 'lucide-react'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'
import { TriageChat, VitalLine } from '@/components'

import TriageForm from '../components/triage-form'
import TriageResult from '../components/triage-result'

const TriagePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [mode, setMode] = useState('quick') // 'quick' | 'chat'
  const [chatTriage, setChatTriage] = useState(null)
  const [chatDisclaimer, setChatDisclaimer] = useState(null)
  const [chatTranscript, setChatTranscript] = useState('')

  const { assess, isLoading, triage, disclaimer, reset, error } = useTriage()

  const onSubmit = (payload) => {
    assess({ data: payload })
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

  const onBook = () => {
    if (!activeTriage) return
    navigate(
      `/patient/doctors?specialty=${encodeURIComponent(activeTriage.specialty)}`,
      {
        state: {
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
      },
    )
  }

  const onReset = () => {
    if (mode === 'chat') onChatReset()
    else reset()
  }

  if (error) {
    errorToast({
      message:
        error?.response?.data?.message ||
        'Symptom check failed — please try again.',
    })
  }

  return (
    <div className="space-y-8">
      {/* Greeting strip */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('nav.triage', { defaultValue: 'Symptom check' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('triage.page_title')}
        </h1>
      </div>

      {/* Mode toggle: quick form vs guided voice chat */}
      {!activeTriage && (
        <div className="fade-up fade-up-delay-1 inline-flex items-center gap-1 rounded-full border border-border/70 bg-card p-1">
          <ModeButton
            active={mode === 'quick'}
            onClick={() => setMode('quick')}
            icon={Zap}
            label={t('triage.mode_quick', {
              defaultValue: 'Quick symptom check',
            })}
          />
          <ModeButton
            active={mode === 'chat'}
            onClick={() => setMode('chat')}
            icon={MessageSquare}
            label={t('triage.mode_chat', {
              defaultValue: 'Guided voice check',
            })}
          />
        </div>
      )}

      {/* Intro hero — only when there's no result yet */}
      {!activeTriage && (
        <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
          <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
            <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
          </div>

          <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
                <Sparkles className="h-3 w-3" />
                AI-assisted triage · not a diagnosis
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                Tell us how{' '}
                <span className="text-white/85 font-normal italic">you're feeling.</span>
              </h2>
              <p className="text-white/80 max-w-md leading-relaxed">
                {t('triage.page_subtitle')}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <HeroChip icon={Globe}>Hindi · Marathi · English</HeroChip>
                <HeroChip icon={ShieldCheck}>Private, never sold</HeroChip>
              </div>
            </div>

            <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-white/80" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                  What happens next
                </p>
              </div>
              <StepRow n="1" text="Describe symptoms in your own words" />
              <StepRow n="2" text="AI suggests urgency + specialty" />
              <StepRow n="3" text="Book a verified doctor in one tap" />
              <p className="text-[10px] text-white/55 italic pt-2 border-t border-white/10">
                A real doctor approves every prescription — never the AI
              </p>
            </aside>
          </div>
        </section>
      )}

      {!activeTriage ? (
        <div className="fade-up fade-up-delay-2">
          {mode === 'quick' ? (
            <TriageForm onSubmit={onSubmit} isLoading={isLoading} />
          ) : (
            <TriageChat
              language={i18n.language}
              onResult={onChatResult}
            />
          )}
        </div>
      ) : (
        <TriageResult
          triage={activeTriage}
          disclaimer={activeDisclaimer}
          onReset={onReset}
          onBook={onBook}
        />
      )}
    </div>
  )
}

const ModeButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    }`}
  >
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {label}
  </button>
)

const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/95">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

const StepRow = ({ n, text }) => (
  <div className="flex items-start gap-3">
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white text-xs font-bold shrink-0">
      {n}
    </span>
    <p className="text-sm text-white/85 leading-snug pt-0.5">{text}</p>
  </div>
)

export default TriagePage
