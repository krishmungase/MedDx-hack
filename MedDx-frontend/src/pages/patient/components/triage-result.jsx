import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Phone,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge, VitalLine } from '@/components'

const TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const URGENCY_LEVEL = {
  low: 1,
  medium: 2,
  high: 3,
  emergency: 4,
}

const TriageResult = ({ triage, onReset, onBook }) => {
  const { t } = useTranslation()
  if (!triage) return null

  const isEmergency = triage.urgency === 'emergency'
  const blurb = t(`triage.result_${triage.urgency}_blurb`)
  const level = URGENCY_LEVEL[triage.urgency] || 1

  return (
    <div className="space-y-5">
      {/* Emergency banner */}
      {isEmergency && (
        <section className="fade-up rounded-2xl border border-destructive/30 bg-linear-to-br from-destructive/15 via-destructive/8 to-transparent p-4 sm:p-5 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-white shrink-0">
            <Phone className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-lg tracking-tight text-destructive">
              {t('triage.emergency_banner_title')}
            </p>
            <p className="text-sm text-destructive/90 mt-0.5 leading-relaxed">
              {t('triage.emergency_banner_body')}
            </p>
          </div>
        </section>
      )}

      {/* Spotlight result hero */}
      <section className="fade-up relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 space-y-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
            <Stethoscope className="h-3 w-3" />
            Suggested route
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
            See a{' '}
            <span className="text-white font-bold underline decoration-emerald-300 decoration-4 underline-offset-4">
              {triage.specialty}
            </span>{' '}
            <span className="text-white/85 font-normal italic">specialist.</span>
          </h2>

          <p className="text-white/85 max-w-2xl leading-relaxed">{blurb}</p>

          {/* Urgency meter */}
          <div className="max-w-md space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/65 font-semibold">
              <span>Urgency</span>
              <span className="text-white">
                {t(`urgency.${triage.urgency}`)}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= level
                      ? step === 4
                        ? 'bg-red-300'
                        : step >= 3
                          ? 'bg-amber-300'
                          : step === 2
                            ? 'bg-amber-200'
                            : 'bg-emerald-300'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              onClick={onBook}
              size="lg"
              className={`rounded-full h-12 px-7 font-semibold shadow-lg shadow-black/10 ${
                isEmergency
                  ? 'bg-white text-destructive hover:bg-white/90'
                  : 'bg-white text-primary hover:bg-white/90'
              }`}
            >
              {t('triage.result_book', { specialty: triage.specialty })}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onReset}
              className="rounded-full h-12 px-6 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              {t('triage.result_reset')}
            </Button>
          </div>
        </div>
      </section>

      {/* Summary + reason cards */}
      <section className="fade-up fade-up-delay-1 grid md:grid-cols-2 gap-4">
        <DetailCard label={t('triage.result_summary_label')} body={triage.summary} />
        <DetailCard
          label={t('triage.result_reason_label')}
          body={triage.reason}
          muted
        />
      </section>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-border/70 bg-soft-mesh p-4 flex items-start gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
              Important
            </p>
            <StatusBadge tone={TONE[triage.urgency] || 'muted'}>
              {t('triage.result_urgency', {
                level: t(`urgency.${triage.urgency}`),
              })}
            </StatusBadge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('triage.result_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}

const DetailCard = ({ label, body, muted = false }) => (
  <div
    className={`rounded-2xl border border-border/70 p-5 space-y-2 ${
      muted ? 'bg-muted/30' : 'bg-card'
    }`}
  >
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
      {label}
    </p>
    <p className={`text-sm leading-relaxed ${muted ? 'text-muted-foreground' : ''}`}>
      {body}
    </p>
  </div>
)

export default TriageResult
