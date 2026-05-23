import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNowStrict, isPast } from 'date-fns'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  History,
  Mic,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

import { useMyAppointments } from '@/apis'

const STATUS_TONE = {
  scheduled: 'primary',
  completed: 'sage',
  cancelled: 'destructive',
}

const JOIN_WINDOW_BEFORE_MS = 5 * 60 * 1000
const JOIN_WINDOW_AFTER_MS = 60 * 60 * 1000
const PAST_PAGE_SIZE = 4
const UPCOMING_PAGE_SIZE = 4

const isJoinable = (appt) => {
  if (appt.status !== 'scheduled') return false
  const t = new Date(appt.datetime).getTime()
  const now = Date.now()
  return now >= t - JOIN_WINDOW_BEFORE_MS && now <= t + JOIN_WINDOW_AFTER_MS
}

/** Live ticker — re-render every 30s so the countdown is fresh. */
const useNowTick = (interval = 30_000) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

const MyAppointments = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { appointments, isLoading } = useMyAppointments()
  const [pastPage, setPastPage] = useState(1)
  const [upcomingPage, setUpcomingPage] = useState(1)
  useNowTick()

  const { upcoming, past, next } = useMemo(() => {
    const upcoming = []
    const past = []
    for (const a of appointments) {
      const dt = new Date(a.datetime)
      if (a.status === 'completed' || isPast(dt)) past.push(a)
      else upcoming.push(a)
    }
    upcoming.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    past.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    return { upcoming, past, next: upcoming[0] || null }
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

  const pastTotalPages = Math.max(1, Math.ceil(past.length / PAST_PAGE_SIZE))
  const pastPageItems = past.slice(
    (pastPage - 1) * PAST_PAGE_SIZE,
    pastPage * PAST_PAGE_SIZE,
  )

  if (isLoading) return <Loading />
  if (upcoming.length === 0 && past.length === 0) return <Empty />

  return (
    <div className="space-y-10">
      {/* ── Hero: next consultation spotlight ─────────────────────────────── */}
      {next ? (
        <NextConsultationHero appt={next} onJoin={() => navigate(`/video/${next._id}`)} t={t} />
      ) : (
        <NoUpcomingHero onBook={() => navigate('/patient/doctors')} t={t} />
      )}

      {/* ── Quick stats row ────────────────────────────────────────────────── */}
      <QuickStats
        upcoming={upcoming.length}
        completed={past.length}
        nextLabel={
          next
            ? format(new Date(next.datetime), 'EEE, MMM d · h:mm a')
            : t('appointments.no_upcoming_short')
        }
        t={t}
      />

      {/* ── Upcoming queue (excluding the spotlit one) ─────────────────────── */}
      {upcomingRest.length > 0 && (
        <section className="fade-up fade-up-delay-2 space-y-4">
          <SectionHeader
            icon={CalendarClock}
            title={t('appointments.section_upcoming')}
            count={upcomingRest.length}
            hint={t('appointments.section_upcoming_hint')}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingPageItems.map((a) => (
              <UpcomingCard
                key={a._id}
                appt={a}
                onJoin={() => navigate(`/video/${a._id}`)}
              />
            ))}
          </div>
          {upcomingTotalPages > 1 && (
            <DataPagination
              page={upcomingPage}
              totalPages={upcomingTotalPages}
              onPageChange={setUpcomingPage}
            />
          )}
        </section>
      )}

      {/* ── Past visits timeline ───────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="fade-up fade-up-delay-3 space-y-4">
          <SectionHeader
            icon={History}
            title={t('appointments.section_history')}
            count={past.length}
            hint={t('appointments.section_history_hint')}
          />
          <ol className="relative space-y-3 pl-7 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-linear-to-b before:from-primary/40 before:via-border before:to-transparent">
            {pastPageItems.map((a, idx) => (
              <PastVisit
                key={a._id}
                appt={a}
                isFirst={idx === 0 && pastPage === 1}
                onView={() => navigate(`/video/${a._id}`)}
              />
            ))}
          </ol>
          {pastTotalPages > 1 && (
            <DataPagination
              page={pastPage}
              totalPages={pastTotalPages}
              onPageChange={setPastPage}
            />
          )}
        </section>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Hero — next consultation
// ─────────────────────────────────────────────────────────────────────────

const NextConsultationHero = ({ appt, onJoin, t }) => {
  const dt = new Date(appt.datetime)
  const ms = dt.getTime() - Date.now()
  const joinable = isJoinable(appt)
  const inFuture = ms > 0
  const inMinutes = Math.abs(Math.round(ms / 60000))

  const relative = (() => {
    if (joinable) return t('appointments.live_now')
    if (inFuture && inMinutes < 60)
      return t('appointments.starts_in_min', { n: inMinutes })
    return formatDistanceToNowStrict(dt, { addSuffix: true })
  })()

  return (
    <section className="fade-up relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
      <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-24 opacity-40" aria-hidden>
        <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
      </div>

      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
        {/* Left — context */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
            <span className={`relative inline-flex h-2 w-2 ${joinable ? '' : 'opacity-80'}`}>
              {joinable && (
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${joinable ? 'bg-emerald-300' : 'bg-amber-300'}`} />
            </span>
            {joinable
              ? t('appointments.consultation_open')
              : t('appointments.next_consultation')}
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
            {relative.split(' ').slice(0, 1)}{' '}
            <span className="text-white/85 font-normal italic">
              {relative.split(' ').slice(1).join(' ')}
            </span>
          </h2>

          <div className="flex items-center gap-3.5">
            <DoctorAvatar
              name={appt.doctorId?.name}
              size="lg"
              showRing={false}
              className="bg-white/15 backdrop-blur-md rounded-full"
            />
            <div>
              <p className="font-display text-lg leading-tight">
                Dr {appt.doctorId?.name || '—'}
              </p>
              <p className="text-sm text-white/75">
                {appt.doctorId?.specialty || 'Specialist'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <HeroChip icon={Clock}>
              {format(dt, "EEE, MMM d · h:mm a")}
            </HeroChip>
            {appt.triageUrgency && (
              <HeroChip icon={Sparkles}>
                {t('appointments.urgency_chip', {
                  level: t(`urgency.${appt.triageUrgency}`, {
                    defaultValue: appt.triageUrgency,
                  }),
                })}
              </HeroChip>
            )}
            <HeroChip icon={ShieldCheck}>
              {t('appointments.audited_private')}
            </HeroChip>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={onJoin}
              disabled={!joinable}
              className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="h-4 w-4" />
              {joinable
                ? t('appointments.join_consult')
                : t('appointments.joins_before')}
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

        {/* Right — micro-card with what to expect */}
        <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
            {t('appointments.what_to_expect')}
          </p>
          <ul className="space-y-3">
            <ExpectRow icon={Mic} text={t('appointments.expect_video')} />
            <ExpectRow icon={Stethoscope} text={t('appointments.expect_review')} />
            <ExpectRow icon={FileText} text={t('appointments.expect_notes')} />
            <ExpectRow icon={Heart} text={t('appointments.expect_free_first')} />
          </ul>
        </aside>
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

const ExpectRow = ({ icon: Icon, text }) => (
  <li className="flex items-start gap-2.5 text-sm text-white/85">
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 shrink-0 mt-0.5">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span className="leading-relaxed">{text}</span>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────
// Hero variant when there are no upcoming bookings
// ─────────────────────────────────────────────────────────────────────────

const NoUpcomingHero = ({ onBook, t }) => (
  <section className="fade-up relative overflow-hidden rounded-3xl bg-soft-mesh ring-1 ring-border/60 p-8 sm:p-10">
    <div className="absolute -right-10 -bottom-12 opacity-[0.07]" aria-hidden>
      <Stethoscope className="h-64 w-64" strokeWidth={1} />
    </div>
    <div className="relative max-w-xl">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3 w-3" />
        {t('appointments.no_upcoming_eyebrow')}
      </span>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-tight">
        {t('appointments.no_upcoming_title')}
      </h2>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        {t('appointments.no_upcoming_body')}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={onBook}
          className="rounded-full h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          <Stethoscope className="h-4 w-4" />
          {t('appointments.find_specialist_cta')}
        </Button>
      </div>
    </div>
  </section>
)

// ─────────────────────────────────────────────────────────────────────────
// Quick stats
// ─────────────────────────────────────────────────────────────────────────

const QuickStats = ({ upcoming, completed, nextLabel, t }) => (
  <div className="fade-up fade-up-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
    <MiniStat
      icon={CalendarClock}
      label={t('appointments.stat_upcoming')}
      value={upcoming}
      tone="primary"
    />
    <MiniStat
      icon={CheckCircle2}
      label={t('appointments.stat_completed')}
      value={completed}
      tone="sage"
    />
    <MiniStat
      icon={Clock}
      label={t('appointments.stat_next_visit')}
      value={nextLabel}
      tone="muted"
      compact
    />
    <MiniStat
      icon={ShieldCheck}
      label={t('appointments.stat_privacy')}
      value={t('appointments.stat_privacy_value')}
      hint={t('appointments.stat_privacy_hint')}
      tone="muted"
      compact
    />
  </div>
)

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  muted: 'bg-muted text-muted-foreground',
}

const MiniStat = ({ icon: Icon, label, value, hint, tone = 'primary', compact = false }) => (
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
          className={`mt-0.5 font-display tracking-tight ${
            compact ? 'text-sm font-medium leading-snug' : 'text-2xl'
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
// Section header — consistent visual cue between sections
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
// Upcoming card (one of many)
// ─────────────────────────────────────────────────────────────────────────

const UpcomingCard = ({ appt, onJoin }) => {
  const { t } = useTranslation()
  const dt = new Date(appt.datetime)
  const joinable = isJoinable(appt)
  const ms = dt.getTime() - Date.now()
  const minutes = Math.max(0, Math.round(ms / 60000))

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
      {/* Side accent bar */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          joinable
            ? 'bg-linear-to-b from-emerald-400 to-primary'
            : 'bg-linear-to-b from-primary to-primary/40'
        }`}
        aria-hidden
      />

      <div className="p-5 space-y-4 pl-6">
        <div className="flex items-start gap-3">
          <DoctorAvatar name={appt.doctorId?.name} size="md" online={joinable} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-base tracking-tight truncate">
              Dr {appt.doctorId?.name || '—'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {appt.doctorId?.specialty || 'Specialist'}
            </p>
          </div>
          <StatusBadge tone={STATUS_TONE[appt.status] || 'muted'}>
            {t(`status.${appt.status}`, { defaultValue: appt.status })}
          </StatusBadge>
        </div>

        {/* Big time + countdown */}
        <div className="rounded-xl bg-linear-to-br from-primary/8 to-transparent border border-primary/15 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xl tracking-tight tabular-nums">
              {format(dt, 'h:mm a')}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {format(dt, 'EEE, MMM d')}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-primary font-medium">
            {joinable
              ? t('appointments.live_short')
              : minutes < 60
                ? t('appointments.starts_in_min', { n: minutes })
                : t('appointments.opens_before_at', {
                    time: format(dt, 'h:mm a'),
                  })}
          </p>
        </div>

        <Button
          size="sm"
          onClick={onJoin}
          disabled={!joinable}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Video className="h-3.5 w-3.5" />
          {joinable
            ? t('appointments.join_consult')
            : t('appointments.not_yet')}
        </Button>
        {!joinable && (
          <button
            type="button"
            onClick={onJoin}
            className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-primary/80 hover:text-primary transition-colors"
            title="Bypass the 5-minute gate (demo only)"
          >
            <Rocket className="h-3 w-3" />
            Demo · Open call
          </button>
        )}
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Past visit — timeline row
// ─────────────────────────────────────────────────────────────────────────

const PastVisit = ({ appt, isFirst, onView }) => {
  const { t } = useTranslation()
  return (
    <li className="relative">
      <span
        className={`absolute -left-7 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
          appt.status === 'completed'
            ? 'bg-sage text-sage-foreground'
            : 'bg-destructive/15 text-destructive'
        }`}
        aria-hidden
      >
        {appt.status === 'completed' ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        {isFirst && (
          <span className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-pulse" aria-hidden />
        )}
      </span>

      <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/30">
        <div className="flex flex-wrap items-center gap-3">
          <DoctorAvatar name={appt.doctorId?.name} size="sm" showRing={false} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              Dr {appt.doctorId?.name || '—'}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                · {appt.doctorId?.specialty || ''}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {format(new Date(appt.datetime), "EEE, MMM d · h:mm a")}
            </p>
          </div>
          <StatusBadge tone={STATUS_TONE[appt.status] || 'muted'}>
            {t(`status.${appt.status}`, { defaultValue: appt.status })}
          </StatusBadge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="rounded-full text-primary hover:bg-primary/10"
          >
            {t('appointments.view_notes')}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Loading + empty
// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="space-y-6">
    <div className="h-56 rounded-3xl bg-muted/60 animate-pulse" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-muted/60 animate-pulse" />
      ))}
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="h-48 rounded-2xl bg-muted/60 animate-pulse" />
      ))}
    </div>
  </div>
)

const Empty = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return <NoUpcomingHero onBook={() => navigate('/patient/doctors')} t={t} />
}

export default MyAppointments
