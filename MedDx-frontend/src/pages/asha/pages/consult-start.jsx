import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Mic,
  Pencil,
  ShieldCheck,
} from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

/**
 * ASHA-facilitated consult flow — chooser page.
 *
 * Two big picture-led cards: "Speak to us" (chatbot) vs "Fill a form" (one-shot).
 * Each routes to a dedicated sub-page so the experiences never overlap.
 */
const ConsultStartPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const villager = location.state?.villager

  const [originalLang] = useState(() => i18n.language)

  // Temporarily switch to the villager's language so the chooser, mic labels,
  // and downstream triage all match what they speak. Restored on unmount.
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

  // Hand the villager off to the sub-pages via location state.
  const goChat = () =>
    navigate('/asha/consult/start/chat', { state: { villager } })
  const goForm = () =>
    navigate('/asha/consult/start/form', { state: { villager } })

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

      <div className="fade-up flex flex-col gap-1 text-center pt-2">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('triage.chooser_title', {
            defaultValue: 'How would you like to start?',
          })}
        </h1>
        <p className="mt-1 text-muted-foreground text-base">
          {t('triage.chooser_subtitle', {
            defaultValue: 'Both ways send you to the right doctor.',
          })}
        </p>
      </div>

      <div className="fade-up fade-up-delay-1 grid sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={goChat}
          className="group relative overflow-hidden rounded-3xl bg-hero-mesh text-white p-7 sm:p-9 text-left shadow-xl shadow-primary/25 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
          <div className="relative space-y-5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30">
              <Mic className="h-10 w-10" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
                {t('triage.chooser_chat_eyebrow', {
                  defaultValue: 'Best for spoken help',
                })}
              </p>
              <h2 className="font-display text-2xl tracking-tight leading-tight">
                {t('triage.chooser_chat_title', {
                  defaultValue: 'Speak to us.',
                })}
              </h2>
              <p className="text-white/85 leading-relaxed text-sm">
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

        <button
          type="button"
          onClick={goForm}
          className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border/70 p-7 sm:p-9 text-left transition-all hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          <div className="relative space-y-5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Pencil className="h-10 w-10" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                {t('triage.chooser_form_eyebrow', {
                  defaultValue: 'Fastest if you can read',
                })}
              </p>
              <h2 className="font-display text-2xl tracking-tight leading-tight">
                {t('triage.chooser_form_title', {
                  defaultValue: 'Fill a short form.',
                })}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
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

export default ConsultStartPage
