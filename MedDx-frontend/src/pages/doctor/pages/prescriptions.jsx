import { format } from 'date-fns'
import { Notebook, RefreshCw, Stethoscope } from 'lucide-react'

import { useMyPrescriptions } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PrescriptionCard from '@/components/shared/prescription-card'

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const PrescriptionsPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { items, isLoading, isFetching, refetch } = useMyPrescriptions()

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            Prescriptions.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Every prescription you've approved and saved to a patient's record.
            Reopen one to review what you wrote.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => refetch?.()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <ul className="fade-up fade-up-delay-1 space-y-4">
          {items.map((it) => (
            <li
              key={it._id}
              className="rounded-2xl border border-border/70 bg-card overflow-hidden"
            >
              <header className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border/60 bg-card/60">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {it.patient?.name || 'Patient'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {format(new Date(it.datetime), "EEE, MMM d, yyyy · h:mm a")}
                  </p>
                </div>
                {it.triageUrgency && (
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${URGENCY_TONE[it.triageUrgency] || ''}`}
                  >
                    {it.triageUrgency}
                  </Badge>
                )}
                {it.patient?.language && it.patient.language !== 'en' && (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[9px] uppercase tracking-[0.14em]"
                  >
                    {it.patient.language}
                  </Badge>
                )}
              </header>

              <div className="p-5 space-y-3">
                {it.doctorNotes && (
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {it.doctorNotes}
                  </div>
                )}
                <PrescriptionCard
                  prescription={it.prescription}
                  printContext={{
                    doctorName: 'You',
                    patientName: it.patient?.name,
                    date: format(
                      new Date(it.datetime),
                      "EEE, MMM d, yyyy · h:mm a"
                    ),
                    notes: it.doctorNotes,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const Loading = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="rounded-2xl border border-border/70 bg-card py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <Notebook className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No prescriptions yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Prescriptions you save during a consult will show up here for your
      future reference.
    </p>
  </div>
)

export default PrescriptionsPage
