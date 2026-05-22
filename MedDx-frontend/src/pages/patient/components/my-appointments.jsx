import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format, isPast } from 'date-fns'
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Video,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useMyAppointments } from '@/apis'

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

const MyAppointments = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { appointments, isLoading } = useMyAppointments()

  const { upcoming, past } = useMemo(() => {
    const upcoming = []
    const past = []
    for (const a of appointments) {
      const dt = new Date(a.datetime)
      if (a.status === 'completed' || isPast(dt)) past.push(a)
      else upcoming.push(a)
    }
    upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    past.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    return { upcoming, past }
  }, [appointments])

  if (isLoading) return <Loading />

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <header className="px-6 py-4 border-b border-border/70">
        <h2 className="font-display text-xl tracking-tight">
          {t('appointments.card_title')}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('appointments.summary', {
            upcoming: upcoming.length,
            completed: past.length,
          })}
        </p>
      </header>

      {upcoming.length === 0 && past.length === 0 ? (
        <Empty />
      ) : (
        <div className="divide-y divide-border/60">
          {upcoming.length > 0 && (
            <Group title={t('appointments.section_upcoming')}>
              {upcoming.map((a) => (
                <Row
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
                          ? t('appointments.join_too_early')
                          : t('appointments.join_open')
                      }
                    >
                      <Video className="h-3.5 w-3.5" />
                      {isJoinable(a)
                        ? t('appointments.join_call')
                        : t('appointments.not_yet')}
                    </Button>
                  }
                />
              ))}
            </Group>
          )}

          {past.length > 0 && (
            <Group title={t('appointments.section_history')}>
              {past.map((a) => (
                <Row
                  key={a._id}
                  appt={a}
                  primary={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => navigate(`/video/${a._id}`)}
                    >
                      {t('appointments.view_notes')}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              ))}
            </Group>
          )}
        </div>
      )}
    </section>
  )
}

const Group = ({ title, children }) => (
  <div className="px-6 py-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">
      {title}
    </p>
    <ul className="space-y-2">{children}</ul>
  </div>
)

const Row = ({ appt, primary }) => {
  const { t } = useTranslation()
  const doctor = appt.doctorId
  const time = format(new Date(appt.datetime), "EEE, MMM d · h:mm a")
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
        {appt.status === 'completed' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <CalendarClock className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">
          Dr {doctor?.name || '—'}{' '}
          <span className="text-muted-foreground font-normal">
            · {doctor?.specialty || ''}
          </span>
        </p>
        <p className="text-xs text-muted-foreground font-mono tabular-nums mt-0.5">
          {time}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${
          STATUS_TONE[appt.status] || ''
        }`}
      >
        {t(`status.${appt.status}`, { defaultValue: appt.status })}
      </Badge>
      {primary}
    </li>
  )
}

const Loading = () => (
  <section className="rounded-2xl border border-border/70 bg-card p-6 space-y-3">
    {[0, 1].map((i) => (
      <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </section>
)

const Empty = () => {
  const { t } = useTranslation()
  return (
    <div className="py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
        <CalendarClock className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        {t('appointments.empty_title')}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {t('appointments.empty_body')}
      </p>
    </div>
  )
}

export default MyAppointments
