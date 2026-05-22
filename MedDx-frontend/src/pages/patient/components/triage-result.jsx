import {
  ArrowRight,
  Phone,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const URGENCY_META = {
  low: {
    label: 'Low',
    tone: 'bg-sage/15 text-sage-foreground border-sage/30',
    blurb: 'Likely self-limiting — book a routine consult when convenient.',
  },
  medium: {
    label: 'Medium',
    tone: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    blurb: 'You should see a doctor in the next 1–3 days.',
  },
  high: {
    label: 'High',
    tone: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
    blurb: 'Try to book a same-day slot with the recommended specialist.',
  },
  emergency: {
    label: 'Emergency',
    tone: 'bg-destructive/15 text-destructive border-destructive/30',
    blurb:
      'Please contact local emergency services right now. Do not wait for an online consult.',
  },
}

const TriageResult = ({ triage, disclaimer, onReset, onBook }) => {
  if (!triage) return null
  const meta = URGENCY_META[triage.urgency] || URGENCY_META.medium
  const isEmergency = triage.urgency === 'emergency'

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      {isEmergency && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-6 py-4 flex items-start gap-3">
          <Phone className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-display text-base tracking-tight text-destructive">
              This looks like an emergency.
            </p>
            <p className="text-sm text-destructive/90 mt-0.5 leading-relaxed">
              Please call your local emergency number now (India: 112). MedDx
              can still book you a free urgent video consult below, but it is
              not a substitute for emergency care.
            </p>
          </div>
        </div>
      )}

      <header className="px-6 py-5 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={`rounded-full text-[11px] uppercase tracking-[0.14em] ${meta.tone}`}
          >
            {meta.label} urgency
          </Badge>
          <span className="text-xs text-muted-foreground">
            Suggested specialty
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <Stethoscope className="h-3.5 w-3.5 text-clinic" />
            {triage.specialty}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {meta.blurb}
        </p>
      </header>

      <div className="px-6 py-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-1">
            What the assistant heard
          </p>
          <p className="text-sm leading-relaxed">{triage.summary}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-1">
            Why this urgency + specialty
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {triage.reason}
          </p>
        </div>

        {disclaimer && (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3 flex items-start gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-clinic mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {disclaimer}
            </p>
          </div>
        )}
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
          Start over
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
          Find a {triage.specialty} specialist
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </section>
  )
}

export default TriageResult
