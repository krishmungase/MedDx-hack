import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { format, isPast } from 'date-fns'
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Video,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useDoctorQueue } from '@/apis'

const STATUS_TONE = {
  scheduled: 'bg-clinic/10 text-clinic border-clinic/25',
  completed: 'bg-sage/15 text-sage-foreground border-sage/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/25',
}

const JOIN_WINDOW_BEFORE_MS = 5 * 60 * 1000
const JOIN_WINDOW_AFTER_MS = 60 * 60 * 1000

const isJoinable = (appt) => {
  if (appt.status !== 'scheduled') return false
  const t = new Date(appt.datetime).getTime()
  const now = Date.now()
  return now >= t - JOIN_WINDOW_BEFORE_MS && now <= t + JOIN_WINDOW_AFTER_MS
}

const DoctorQueue = () => {
  const navigate = useNavigate()
  const { appointments, isLoading, isFetching, refetch } = useDoctorQueue()

  const { upcoming, done } = useMemo(() => {
    const upcoming = []
    const done = []
    for (const a of appointments) {
      if (a.status === 'completed' || isPast(new Date(a.datetime)) && a.status !== 'scheduled') {
        done.push(a)
      } else {
        upcoming.push(a)
      }
    }
    return { upcoming, done }
  }, [appointments])

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/70">
        <div>
          <h2 className="font-display text-xl tracking-tight">Today's queue</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {upcoming.length} upcoming · {done.length} completed
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </header>

      {isLoading ? (
        <Loading />
      ) : upcoming.length === 0 && done.length === 0 ? (
        <Empty />
      ) : (
        <div className="divide-y divide-border/60 px-6 py-5 space-y-5 [&>*:not(:first-child)]:pt-5">
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">
                Up next
              </p>
              <ul className="space-y-2">
                {upcoming.map((a) => (
                  <QueueRow
                    key={a._id}
                    appt={a}
                    primary={
                      <Button
                        size="sm"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => navigate(`/video/${a._id}`)}
                        disabled={!isJoinable(a)}
                        title={
                          !isJoinable(a)
                            ? 'Joinable 5 minutes before the slot.'
                            : 'Open the consultation room'
                        }
                      >
                        <Video className="h-3.5 w-3.5" />
                        {isJoinable(a) ? 'Join' : 'Not yet'}
                      </Button>
                    }
                  />
                ))}
              </ul>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">
                Completed
              </p>
              <ul className="space-y-2">
                {done.map((a) => (
                  <QueueRow
                    key={a._id}
                    appt={a}
                    primary={
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => navigate(`/video/${a._id}`)}
                      >
                        Re-open
                      </Button>
                    }
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

const QueueRow = ({ appt, primary }) => {
  const patient = appt.patientId
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 text-sage-foreground shrink-0">
        {appt.status === 'completed' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <CalendarCheck className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">
          {patient?.name || 'Patient'}{' '}
          <span className="text-muted-foreground font-normal">
            · {patient?.email || ''}
          </span>
        </p>
        <p className="text-xs text-muted-foreground font-mono tabular-nums mt-0.5">
          {format(new Date(appt.datetime), "EEE, MMM d · h:mm a")}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${
          STATUS_TONE[appt.status] || ''
        }`}
      >
        {appt.status}
      </Badge>
      {primary}
    </li>
  )
}

const Loading = () => (
  <div className="px-6 py-6 space-y-3">
    {[0, 1].map((i) => (
      <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <ClipboardList className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">Quiet for now</h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Patients who book your slots will appear here. Add availability above to
      open more bookings.
    </p>
  </div>
)

export default DoctorQueue
