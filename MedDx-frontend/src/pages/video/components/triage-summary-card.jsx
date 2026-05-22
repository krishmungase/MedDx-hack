import { ShieldAlert, Sparkles } from 'lucide-react'

import { StatusBadge } from '@/components'

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const TriageSummaryCard = ({ appointment }) => {
  if (!appointment?.triageSummary && !appointment?.triageUrgency) return null

  return (
    <div className="border-b border-border/60 bg-primary/5 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          AI triage (not a diagnosis)
        </p>
        {appointment.triageUrgency && (
          <StatusBadge
            tone={URGENCY_TONE[appointment.triageUrgency] || 'muted'}
            className="ml-auto"
          >
            {appointment.triageUrgency}
          </StatusBadge>
        )}
      </div>
      {appointment.triageSummary && (
        <p className="text-xs leading-relaxed">{appointment.triageSummary}</p>
      )}
      <p className="text-[10px] text-muted-foreground flex items-start gap-1 leading-relaxed">
        <ShieldAlert className="h-3 w-3 mt-0.5 shrink-0" />
        Patient's own description, summarised by AI. Verify on call.
      </p>
    </div>
  )
}

export default TriageSummaryCard
