import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { format, formatDistanceToNowStrict, isPast } from 'date-fns'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  RefreshCw,
  Rocket,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

import { useDoctorQueue } from '@/apis'

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

const JOIN_WINDOW_BEFORE_MS = 5 * 60 * 1000
const JOIN_WINDOW_AFTER_MS = 60 * 60 * 1000
const DONE_PAGE_SIZE = 4
const UPCOMING_PAGE_SIZE = 8

const isJoinable = (appt) => {
  if (appt.status !== 'scheduled') return false
  const t = new Date(appt.datetime).getTime()
  const now = Date.now()
  return now >= t - JOIN_WINDOW_BEFORE_MS && now <= t + JOIN_WINDOW_AFTER_MS
}

const useNowTick = (interval = 30_000) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

const DoctorQueue = () => {
  const navigate = useNavigate()
  const { appointments, isLoading, isFetching, refetch } = useDoctorQueue()
  const [donePage, setDonePage] = useState(1)
  const [upcomingPage, setUpcomingPage] = useState(1)
  useNowTick()

  const { upcoming, done, next } = useMemo(() => {
    const upcoming = []
    const done = []
    for (const a of appointments) {
      if (
        a.status === 'completed' ||
        (isPast(new Date(a.datetime)) && a.status !== 'scheduled')
      ) {
        done.push(a)
      } else {
        upcoming.push(a)
      }
    }
    upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    done.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    return { upcoming, done, next: upcoming[0] || null }
  }, [appointments])

  const upcomingRest = next ? upcoming.slice(1) : upcoming
  const upcomingTotalPages = Math.max(
    1,
    Math.ceil(upcomingRest.length / UPCOMING_PAGE_SIZE),
  )
  const upcomingPageItems = upcomingRest.slice(
    (upcomingPage - 1) * UPCOMING_PAGE_SIZE,
    upcomingPage * UPCOMING_PAGE_SIZE,
  )
  const doneTotalPages = Math.max(1, Math.ceil(done.length / DONE_PAGE_SIZE))
  const donePageItems = done.slice(
    (donePage - 1) * DONE_PAGE_SIZE,
    donePage * DONE_PAGE_SIZE,
  )

  if (isLoading) return <Loading />

  return (
    <div className="space-y-8">
      {/* ── Hero stats row ─────────────────────────────────────────────────── */}
      <section className="fade-up grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={CalendarCheck}
          label="Today queue"
          value={upcoming.length}
          tone="primary"
        />
        <BigStat
          icon={CheckCircle2}
          label="Completed"
          value={done.length}
          tone="sage"
        />
        <BigStat
          icon={Clock}
          label="Next at"
          value={
            next ? format(new Date(next.datetime), 'h:mm a') : '—'
          }
          hint={next ? format(new Date(next.datetime), 'EEE, MMM d') : 'No upcoming'}
          compact
          tone="muted"
        />
        <BigStat
          icon={Users}
          label="All patients"
          value={upcoming.length + done.length}
          tone="muted"
        />
      </section>

      {/* ── Next patient spotlight ────────────────────────────────────────── */}
      {next ? (
        <NextPatientSpotlight
          appt={next}
          onJoin={() => navigate(`/video/${next._id}`)}
        />
      ) : (
        <QuietHero onRefresh={() => refetch()} isFetching={isFetching} />
      )}

      {/* ── Rest of the queue as a table ──────────────────────────────────── */}
      {upcomingRest.length > 0 && (
        <section className="fade-up fade-up-delay-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader
              icon={ClipboardList}
              title="Up next"
              count={upcomingRest.length}
              hint="Scheduled for today"
            />
            <Button
              variant="outline"
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
          </div>
          <UpcomingTable
            items={upcomingPageItems}
            onJoin={(id) => navigate(`/video/${id}`)}
          />
          {upcomingTotalPages > 1 && (
            <DataPagination
              page={upcomingPage}
              totalPages={upcomingTotalPages}
              onPageChange={setUpcomingPage}
            />
          )}
        </section>
      )}

      {/* ── Completed list ────────────────────────────────────────────────── */}
      {done.length > 0 && (
        <section className="fade-up fade-up-delay-3 space-y-4">
          <SectionHeader
            icon={CheckCircle2}
            title="Completed"
            count={done.length}
            hint="Earlier today and before"
          />
          <ul className="space-y-2">
            {donePageItems.map((a) => (
              <DoneRow
                key={a._id}
                appt={a}
                onReopen={() => navigate(`/video/${a._id}`)}
              />
            ))}
          </ul>
          {doneTotalPages > 1 && (
            <DataPagination
              page={donePage}
              totalPages={doneTotalPages}
              onPageChange={setDonePage}
            />
          )}
        </section>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Stat cards
// ─────────────────────────────────────────────────────────────────────────

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  muted: 'bg-muted text-muted-foreground',
}

const BigStat = ({ icon: Icon, label, value, hint, tone = 'primary', compact = false }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${TONE_BG[tone]}`}
        aria-hidden
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 font-display tracking-tight tabular-nums ${
            compact ? 'text-base font-medium leading-snug' : 'text-2xl'
          }`}
        >
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// Spotlight
// ─────────────────────────────────────────────────────────────────────────

const NextPatientSpotlight = ({ appt, onJoin }) => {
  const dt = new Date(appt.datetime)
  const joinable = isJoinable(appt)
  const ms = dt.getTime() - Date.now()
  const minutes = Math.max(0, Math.round(ms / 60000))

  const relative = joinable
    ? 'Live now'
    : minutes < 60
      ? `Starts in ${minutes} min`
      : formatDistanceToNowStrict(dt, { addSuffix: true })

  return (
    <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
      <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
        <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
      </div>

      <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
            <span className="relative inline-flex h-2 w-2">
              {joinable && (
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${joinable ? 'bg-emerald-300' : 'bg-amber-300'}`} />
            </span>
            {joinable ? 'Patient waiting' : 'Next patient'}
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
            {relative.split(' ').slice(0, 1)}{' '}
            <span className="text-white/85 font-normal italic">
              {relative.split(' ').slice(1).join(' ')}
            </span>
          </h2>

          <div className="flex items-center gap-3.5">
            <DoctorAvatar
              name={
                appt.villagePatientId?.name || appt.patientId?.name
              }
              size="lg"
              showRing={false}
              tone="sage"
              className="bg-white/15 backdrop-blur-md rounded-full"
            />
            <div>
              <p className="font-display text-lg leading-tight">
                {appt.villagePatientId?.name ||
                  appt.patientId?.name ||
                  'Patient'}
                {appt.villagePatientId?.age && (
                  <span className="text-white/75 font-normal ml-2 text-base">
                    · {appt.villagePatientId.age}
                  </span>
                )}
              </p>
              <p className="text-sm text-white/75 truncate">
                {appt.villagePatientId
                  ? `${appt.villagePatientId.gender && appt.villagePatientId.gender !== 'prefer_not_to_say' ? appt.villagePatientId.gender + ' · ' : ''}${appt.villagePatientId.village || ''}`
                  : appt.patientId?.email || ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HeroChip icon={Clock}>{format(dt, "EEE, MMM d · h:mm a")}</HeroChip>
            {appt.triageUrgency && (
              <HeroChip icon={Sparkles}>{appt.triageUrgency} urgency</HeroChip>
            )}
            {appt.bookedByAshaId && (
              <HeroChip icon={Sparkles}>
                ASHA-assisted · {appt.bookedByAshaId.name}
                {appt.bookedByAshaId.village
                  ? `, ${appt.bookedByAshaId.village}`
                  : ''}
              </HeroChip>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onJoin}
              disabled={!joinable}
              className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/10 disabled:opacity-50"
            >
              <Video className="h-4 w-4" />
              {joinable ? 'Open consultation room' : 'Joins 5 min before'}
              {joinable && <ArrowRight className="h-4 w-4" />}
            </Button>
            {!joinable && (
              <Button
                size="lg"
                onClick={onJoin}
                variant="ghost"
                className="rounded-full h-12 px-5 text-white/95 hover:text-white hover:bg-white/15 ring-1 ring-white/30 backdrop-blur-md"
                title="Bypass the 5-minute gate (demo only)"
              >
                <Rocket className="h-4 w-4" />
                Demo · Open call
              </Button>
            )}
          </div>
        </div>

        {/* AI triage panel */}
        {appt.triageSummary && (
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                AI triage summary
              </p>
            </div>
            <p className="text-sm leading-relaxed text-white/90 line-clamp-6">
              {appt.triageSummary}
            </p>
            <p className="text-[10px] text-white/55 italic pt-2 border-t border-white/10">
              Patient's own description — verify on call
            </p>
          </aside>
        )}
      </div>
    </section>
  )
}

const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/95">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

// ─────────────────────────────────────────────────────────────────────────

const QuietHero = ({ onRefresh, isFetching }) => (
  <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-soft-mesh ring-1 ring-border/60 p-8 sm:p-10 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <ClipboardList className="h-6 w-6" />
    </span>
    <h2 className="mt-5 font-display text-2xl sm:text-3xl tracking-tight">
      Quiet for now.
    </h2>
    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
      Patients who book your slots will show up here. Open more availability to
      take more bookings.
    </p>
    <Button
      variant="outline"
      size="sm"
      className="mt-5 rounded-full"
      onClick={onRefresh}
      disabled={isFetching}
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
      />
      Refresh
    </Button>
  </section>
)

// ─────────────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, count, hint }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <div>
      <h3 className="font-display text-lg tracking-tight leading-none">
        {title}
        {typeof count === 'number' && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {count}
          </span>
        )}
      </h3>
      {hint && (
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────

const UpcomingTable = ({ items, onJoin }) => (
  <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Patient
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Time
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Triage
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Status
            </TableHead>
            <TableHead className="text-right text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <UpcomingRow key={a._id} appt={a} onJoin={() => onJoin(a._id)} />
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

const UpcomingRow = ({ appt, onJoin }) => {
  const dt = new Date(appt.datetime)
  const joinable = isJoinable(appt)
  const ms = dt.getTime() - Date.now()
  const minutes = Math.max(0, Math.round(ms / 60000))
  const statusText = joinable
    ? 'Live now'
    : minutes < 60
      ? `In ${minutes} min`
      : 'Joins 5 min before'

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <DoctorAvatar
            name={appt.villagePatientId?.name || appt.patientId?.name}
            size="sm"
            tone="sage"
            online={joinable}
            showRing={false}
          />
          <div className="min-w-0">
            <div className="font-medium truncate">
              {appt.villagePatientId?.name ||
                appt.patientId?.name ||
                'Patient'}
              {appt.villagePatientId?.age && (
                <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                  · {appt.villagePatientId.age}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {appt.villagePatientId
                ? appt.villagePatientId.village || 'Village patient'
                : appt.patientId?.email || ''}
            </div>
            {appt.bookedByAshaId && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-primary font-semibold">
                <Sparkles className="h-2.5 w-2.5" />
                ASHA · {appt.bookedByAshaId.name}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm tabular-nums">
        <div className="font-medium">{format(dt, 'h:mm a')}</div>
        <div className="text-xs text-muted-foreground">
          {format(dt, 'EEE, MMM d')}
        </div>
      </TableCell>
      <TableCell>
        {appt.triageUrgency ? (
          <StatusBadge tone={URGENCY_TONE[appt.triageUrgency] || 'muted'}>
            {appt.triageUrgency}
          </StatusBadge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            joinable ? 'text-emerald-600' : 'text-muted-foreground'
          }`}
        >
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              joinable ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          >
            {joinable && (
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
            )}
          </span>
          {statusText}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center gap-2 justify-end">
          <Button
            size="sm"
            onClick={onJoin}
            disabled={!joinable}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Video className="h-3.5 w-3.5" />
            {joinable ? 'Join' : 'Not yet'}
          </Button>
          {!joinable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onJoin}
              className="rounded-full text-primary/80 hover:text-primary hover:bg-primary/10"
              title="Bypass the 5-minute gate (demo only)"
            >
              <Rocket className="h-3.5 w-3.5" />
              Demo
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const DoneRow = ({ appt, onReopen }) => (
  <li className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/30">
    <DoctorAvatar
      name={appt.villagePatientId?.name || appt.patientId?.name}
      size="sm"
      showRing={false}
      tone="sage"
    />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">
        {appt.villagePatientId?.name || appt.patientId?.name || 'Patient'}
        {appt.bookedByAshaId && (
          <span className="ml-1.5 text-[10px] uppercase tracking-[0.12em] text-primary font-semibold">
            · ASHA
          </span>
        )}
      </p>
      <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
        {format(new Date(appt.datetime), "EEE, MMM d · h:mm a")}
      </p>
    </div>
    <StatusBadge tone={STATUS_TONE[appt.status] || 'muted'}>
      {appt.status}
    </StatusBadge>
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full text-primary hover:bg-primary/10"
      onClick={onReopen}
    >
      <FileText className="h-3.5 w-3.5" />
      Re-open
    </Button>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
      ))}
    </div>
    <div className="h-56 rounded-3xl bg-muted/60 animate-pulse" />
    <div className="grid sm:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-48 rounded-2xl bg-muted/60 animate-pulse" />
      ))}
    </div>
  </div>
)

export default DoctorQueue
