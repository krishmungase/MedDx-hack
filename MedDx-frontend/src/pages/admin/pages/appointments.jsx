import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react'

import { usePlatformAppointments } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

const STATUS_TONE = {
  scheduled: 'primary',
  completed: 'sage',
  cancelled: 'destructive',
}

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 8

const AppointmentsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  // Fetch all + filtered separately so the hero stays informed of the global counts
  const all = usePlatformAppointments({})
  const filteredApi = usePlatformAppointments({
    status: status === 'all' ? undefined : status,
  })

  const totalAll = all.appointments?.length || 0
  const counts = useMemo(() => {
    const c = { scheduled: 0, completed: 0, cancelled: 0 }
    for (const a of all.appointments || []) {
      if (c[a.status] !== undefined) c[a.status]++
    }
    return c
  }, [all.appointments])

  const totalPages = Math.max(
    1,
    Math.ceil((filteredApi.appointments?.length || 0) / PAGE_SIZE),
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const pageItems = useMemo(
    () =>
      (filteredApi.appointments || []).slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
      ),
    [filteredApi.appointments, page],
  )

  const isLoading = all.isLoading || filteredApi.isLoading
  const isFetching = filteredApi.isFetching

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Admin · Appointments
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Appointments.
        </h1>
      </div>

      {/* Hero with status breakdown bar */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <CalendarCheck className="h-3 w-3" />
              Platform-wide
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {totalAll.toLocaleString()}{' '}
              <span className="text-white/85 font-normal italic">
                consultations booked
              </span>
            </h2>
            <p className="text-white/80 max-w-md leading-relaxed">
              Everything booked across MedDx. Use this view to spot stuck
              calls, unusual urgency clusters, or busy doctors.
            </p>

            {/* Stacked status bar */}
            {totalAll > 0 && (
              <div className="space-y-2 max-w-md">
                <div className="h-3 rounded-full bg-white/15 overflow-hidden ring-1 ring-white/10 flex">
                  <span
                    className="bg-emerald-300 transition-all"
                    style={{
                      width: `${(counts.completed / totalAll) * 100}%`,
                    }}
                  />
                  <span
                    className="bg-sky-300 transition-all"
                    style={{
                      width: `${(counts.scheduled / totalAll) * 100}%`,
                    }}
                  />
                  <span
                    className="bg-rose-300 transition-all"
                    style={{
                      width: `${(counts.cancelled / totalAll) * 100}%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.14em] text-white/65 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {counts.completed} done
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    {counts.scheduled} scheduled
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                    {counts.cancelled} cancelled
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* At a glance */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                At a glance
              </p>
            </div>
            <GlanceRow
              icon={CheckCircle2}
              label="Completed"
              value={counts.completed}
            />
            <GlanceRow
              icon={Clock}
              label="Scheduled"
              value={counts.scheduled}
            />
            <GlanceRow
              icon={XCircle}
              label="Cancelled"
              value={counts.cancelled}
            />
          </aside>
        </div>
      </section>

      {/* Stat cards */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={CalendarCheck}
          label="Total"
          value={totalAll}
          tone="primary"
        />
        <BigStat
          icon={CheckCircle2}
          label="Completed"
          value={counts.completed}
          tone="sage"
        />
        <BigStat
          icon={Clock}
          label="Scheduled"
          value={counts.scheduled}
          tone="amber"
        />
        <BigStat
          icon={XCircle}
          label="Cancelled"
          value={counts.cancelled}
          tone="muted"
        />
      </section>

      {/* List */}
      <section className="fade-up fade-up-delay-3 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <div>
            <h2 className="font-display text-xl tracking-tight leading-none">
              All consultations
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredApi.appointments?.length || 0}{' '}
              {status === 'all' ? 'total' : status}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 w-40 rounded-full bg-card border-border data-[size=default]:h-9">
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
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => filteredApi.refetch?.()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </header>

        {isLoading ? (
          <Loading />
        ) : (filteredApi.appointments || []).length === 0 ? (
          <Empty status={status} />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {pageItems.map((a) => (
                <AppointmentRow key={a._id} appt={a} />
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="border-t border-border/60 px-6 py-4">
                <DataPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const GlanceRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 shrink-0">
      <Icon className="h-3.5 w-3.5 text-white" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-white/70">{label}</p>
    </div>
    <p className="font-display text-xl tracking-tight tabular-nums">{value}</p>
  </div>
)

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}

const BigStat = ({ icon: Icon, label, value, tone = 'primary' }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${TONE_BG[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-display text-2xl tracking-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────

const AppointmentRow = ({ appt }) => (
  <li className="px-6 py-4 transition-colors hover:bg-muted/30">
    <div className="flex flex-wrap items-center gap-4">
      {/* Patient */}
      <div className="flex items-center gap-2.5 min-w-0">
        <DoctorAvatar name={appt.patientId?.name} size="sm" tone="sage" showRing={false} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {appt.patientId?.name || 'Patient'}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {appt.patientId?.email}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />

      {/* Doctor */}
      <div className="flex items-center gap-2.5 min-w-0">
        <DoctorAvatar name={appt.doctorId?.name} size="sm" tone="primary" showRing={false} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            Dr {appt.doctorId?.name || '—'}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {appt.doctorId?.specialty || ''}
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="text-right ml-auto">
        <p className="font-mono text-sm tabular-nums">
          {format(new Date(appt.datetime), 'h:mm a')}
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {format(new Date(appt.datetime), 'EEE, MMM d')}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5">
        {appt.triageUrgency && (
          <StatusBadge tone={URGENCY_TONE[appt.triageUrgency] || 'muted'}>
            {appt.triageUrgency}
          </StatusBadge>
        )}
        <StatusBadge tone="muted">{appt.paymentStatus}</StatusBadge>
        <StatusBadge tone={STATUS_TONE[appt.status] || 'muted'}>
          {appt.status}
        </StatusBadge>
      </div>
    </div>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="p-6 space-y-3">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = ({ status }) => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <CalendarCheck className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      {status === 'all' ? 'Nothing booked yet' : `No ${status} consultations`}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
      As patients book consultations, they'll appear here.
    </p>
  </div>
)

export default AppointmentsPage
