import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Phone,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components'

const TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const TriageResult = ({ triage, disclaimer, onReset, onBook }) => {
  const { t } = useTranslation()
  if (!triage) return null

  const isEmergency = triage.urgency === 'emergency'
  const blurb = t(`triage.result_${triage.urgency}_blurb`)

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      {isEmergency && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-6 py-4 flex items-start gap-3">
          <Phone className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-display text-base tracking-tight text-destructive">
              {t('triage.emergency_banner_title')}
            </p>
            <p className="text-sm text-destructive/90 mt-0.5 leading-relaxed">
              {t('triage.emergency_banner_body')}
            </p>
          </div>
        </div>
      )}

      <header className="px-6 py-5 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={TONE[triage.urgency] || 'muted'}>
            {t('triage.result_urgency', {
              level: t(`urgency.${triage.urgency}`),
            })}
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            {t('triage.result_specialty_label')}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            {triage.specialty}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {blurb}
        </p>
      </header>

      <div className="px-6 py-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-1">
            {t('triage.result_summary_label')}
          </p>
          <p className="text-sm leading-relaxed">{triage.summary}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-1">
            {t('triage.result_reason_label')}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {triage.reason}
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/40 p-3 flex items-start gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('triage.result_disclaimer')}
          </p>
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-border/60 bg-card/50 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={onReset}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t('triage.result_reset')}
        </Button>
        <Button
          type="button"
          onClick={onBook}
          className={`rounded-full h-11 px-6 ${
            isEmergency
              ? 'bg-destructive text-white hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {t('triage.result_book', { specialty: triage.specialty })}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </section>
  )
}

export default TriageResult
