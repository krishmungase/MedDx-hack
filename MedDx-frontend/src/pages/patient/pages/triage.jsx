import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Mic, Pencil, ShieldCheck } from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

/**
 * Chooser page. Two huge picture-led cards so a low-literacy user can pick
 * by icon alone:
 *   1. Speak to us (chatbot)
 *   2. Fill the form (one-shot quick triage)
 *
 * Each card routes to its own page so the experiences never overlap.
 */
const TriagePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="fade-up flex flex-col gap-1 text-center pt-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('nav.triage', { defaultValue: 'Symptom check' })}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
          {t('triage.chooser_title', {
            defaultValue: 'How would you like to start?',
          })}
        </h1>
        <p className="mt-2 text-muted-foreground text-base">
          {t('triage.chooser_subtitle', {
            defaultValue: 'Both ways send you to the right doctor.',
          })}
        </p>
      </div>

      <div className="fade-up fade-up-delay-1 grid sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Chat / voice card — primary CTA, big mic icon */}
        <button
          type="button"
          onClick={() => navigate('/patient/triage/chat')}
          className="group relative overflow-hidden rounded-3xl bg-hero-mesh text-white p-8 sm:p-10 text-left shadow-xl shadow-primary/25 transition-transform hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
          <div className="relative space-y-6">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30">
              <Mic className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
                {t('triage.chooser_chat_eyebrow', {
                  defaultValue: 'Best for spoken help',
                })}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight">
                {t('triage.chooser_chat_title', {
                  defaultValue: 'Speak to us.',
                })}
              </h2>
              <p className="text-white/85 leading-relaxed text-sm sm:text-base">
                {t('triage.chooser_chat_body', {
                  defaultValue:
                    'Tap the mic and answer a few short questions. No typing needed.',
                })}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              {t('triage.chooser_start', { defaultValue: 'Start' })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        {/* Form / quick card — secondary CTA */}
        <button
          type="button"
          onClick={() => navigate('/patient/triage/form')}
          className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border/70 p-8 sm:p-10 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          <div className="relative space-y-6">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Pencil className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                {t('triage.chooser_form_eyebrow', {
                  defaultValue: 'Fastest if you can read',
                })}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight">
                {t('triage.chooser_form_title', {
                  defaultValue: 'Fill a short form.',
                })}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {t('triage.chooser_form_body', {
                  defaultValue:
                    'Type or speak your symptoms once. Get a result instantly.',
                })}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {t('triage.chooser_start', { defaultValue: 'Start' })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5 w-full">
        <ShieldCheck className="h-3 w-3 text-primary" />
        {t('triage.chooser_footer', {
          defaultValue:
            'Both options are AI-guided — a real doctor reviews your case.',
        })}
      </p>
    </div>
  )
}

export default TriagePage
