import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarCheck, RefreshCw } from 'lucide-react'

import { usePlatformAppointments } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_TONE = {
  scheduled: 'bg-clinic/10 text-clinic border-clinic/25',
  completed: 'bg-sage/15 text-sage-foreground border-sage/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/25',
}

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const AppointmentsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const [status, setStatus] = useState('all')
  const { appointments, isLoading, isFetching, refetch } =
    usePlatformAppointments({
      status: status === 'all' ? undefined : status,
    })

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            Appointments.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Everything booked across MedDx. Use this view to spot stuck calls,
            unusual urgency clusters, or busy doctors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[160px] rounded-full bg-card border-border data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      <section className="fade-up fade-up-delay-1 rounded-2xl border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : appointments.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border/60">
            {appointments.map((a) => (
              <li
                key={a._id}
                className="flex flex-wrap items-center gap-4 px-6 py-3"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
                  <CalendarCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {a.patientId?.name || 'Patient'}{' '}
                    <span className="text-muted-foreground font-normal">
                      → Dr {a.doctorId?.name || '—'}
                      {a.doctorId?.specialty
                        ? ` · ${a.doctorId.specialty}`
                        : ''}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {format(new Date(a.datetime), "EEE, MMM d · h:mm a")}
                  </p>
                </div>
                {a.triageUrgency && (
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${URGENCY_TONE[a.triageUrgency] || ''}`}
                  >
                    {a.triageUrgency}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] uppercase tracking-[0.12em] bg-muted text-muted-foreground"
                >
                  {a.paymentStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[a.status] || ''}`}
                >
                  {a.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const Loading = () => (
  <div className="p-6 space-y-3">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <CalendarCheck className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      Nothing booked yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      As patients book consultations, they'll appear here.
    </p>
  </div>
)

export default AppointmentsPage
