import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Globe, ShieldCheck, Sparkles } from 'lucide-react'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'
import { VitalLine } from '@/components'

import TriageForm from '../components/triage-form'
import TriageResult from '../components/triage-result'

const TriageFormPage = () => {
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
      },
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
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate('/patient/triage')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('triage.chooser_back', { defaultValue: 'Back' })}
      </button>

      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('nav.triage', { defaultValue: 'Symptom check' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('triage.page_title')}
        </h1>
      </div>

      {!triage && (
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

      {!triage ? (
        <div className="fade-up fade-up-delay-2">
          <TriageForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      ) : (
        <TriageResult
          triage={triage}
          disclaimer={disclaimer}
          onReset={reset}
          onBook={onBook}
        />
      )}
    </div>
  )
}

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

export default TriageFormPage
