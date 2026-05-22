import { ShieldAlert, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const TriageSummaryCard = ({ appointment }) => {
  if (!appointment?.triageSummary && !appointment?.triageUrgency) return null

  return (
    <div className="border-b border-border/60 bg-clinic/5 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-clinic" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          AI triage (not a diagnosis)
        </p>
        {appointment.triageUrgency && (
          <Badge
            variant="outline"
            className={`ml-auto rounded-full text-[10px] uppercase tracking-[0.14em] ${URGENCY_TONE[appointment.triageUrgency] || ''}`}
          >
            {appointment.triageUrgency}
          </Badge>
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
