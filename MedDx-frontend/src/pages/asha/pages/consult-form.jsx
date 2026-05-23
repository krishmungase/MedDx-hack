import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, Mic, Sparkles } from 'lucide-react'

import { useTriage } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { errorToast } from '@/lib'

import TriageForm from '../../patient/components/triage-form'
import TriageResult from '../../patient/components/triage-result'

const AshaConsultFormPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const villager = location.state?.villager

  const [originalLang] = useState(() => i18n.language)

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
        age: payload.age ?? villager.age ?? undefined,
        sex: payload.sex ?? villager.gender ?? undefined,
        language: villager.language || payload.language,
      },
    })
  }

  const onBook = () => {
    if (!triage) return
    navigate(
      `/asha/consult/doctor?specialty=${encodeURIComponent(triage.specialty)}`,
      {
        state: {
          villager,
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

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate('/asha/consult/start', { state: { villager } })}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('triage.chooser_back', { defaultValue: 'Back' })}
      </button>

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

      {!triage ? (
        <TriageForm onSubmit={onSubmit} isLoading={isLoading} />
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

export default AshaConsultFormPage
