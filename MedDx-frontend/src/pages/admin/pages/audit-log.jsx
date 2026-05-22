import { useMemo, useState } from 'react'
import { format, isToday, isYesterday, startOfDay } from 'date-fns'
import {
  ArrowRight,
  Calendar,
  Eye,
  Filter,
  Lock,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { useAuditLog } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

const PAGE_SIZE = 12

const dayLabel = (date) => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d, yyyy')
}

const AuditLogPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { entries, isLoading, isFetching, refetch } = useAuditLog()
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.viewer?.name?.toLowerCase().includes(q) ||
        e.patient?.name?.toLowerCase().includes(q) ||
        e.viewer?.specialty?.toLowerCase().includes(q),
    )
  }, [entries, query])

  const stats = useMemo(() => {
    const today = startOfDay(new Date()).getTime()
    const todayCount = entries.filter(
      (e) => new Date(e.viewedAt).getTime() >= today,
    ).length
    const uniqueViewers = new Set(entries.map((e) => e.viewer?._id || e.viewer?.email)).size
    const uniquePatients = new Set(entries.map((e) => e.patient?._id || e.patient?.email)).size
    return { todayCount, uniqueViewers, uniquePatients }
  }, [entries])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Group page items by calendar day for the timeline
  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of pageItems) {
      const key = startOfDay(new Date(e.viewedAt)).getTime()
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [pageItems])

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Admin · Audit log
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Audit log.
        </h1>
      </div>

      {/* Hero — privacy promise */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <ShieldCheck className="h-3 w-3" />
              Built on consent · Logged forever
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {entries.length.toLocaleString()}{' '}
              <span className="text-white/85 font-normal italic">
                record views logged
              </span>
            </h2>

            <p className="text-white/80 max-w-xl leading-relaxed">
              Every time a doctor opens a patient's medical record on a video
              call we record it here. Patients view their own records freely —
              those don't generate audit entries.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <HeroChip icon={Lock}>End-to-end encrypted</HeroChip>
              <HeroChip icon={ShieldCheck}>Patient consent required</HeroChip>
            </div>
          </div>

          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                At a glance
              </p>
            </div>
            <GlanceRow icon={Calendar} label="Today" value={stats.todayCount} />
            <GlanceRow icon={Users} label="Doctors viewing" value={stats.uniqueViewers} />
            <GlanceRow icon={Eye} label="Patients" value={stats.uniquePatients} />
            <p className="text-[10px] text-white/55 italic pt-2 border-t border-white/10">
              Patient views of their own records don't appear here
            </p>
          </aside>
        </div>
      </section>

      {/* Stat cards */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={Eye}
          label="Total views"
          value={entries.length}
          tone="primary"
        />
        <BigStat icon={Calendar} label="Today" value={stats.todayCount} tone="sage" />
        <BigStat
          icon={Users}
          label="Doctors"
          value={stats.uniqueViewers}
          tone="amber"
        />
        <BigStat
          icon={Eye}
          label="Patients"
          value={stats.uniquePatients}
          tone="muted"
        />
      </section>

      {/* Activity feed */}
      <section className="fade-up fade-up-delay-3 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ScrollText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight leading-none">
                Activity feed
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'event' : 'events'}
                {query && (
                  <>
                    {' '}
                    matching <span className="text-primary">"{query}"</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name…"
                aria-label="Filter audit log"
                className="h-9 pl-8 w-48 rounded-full bg-background"
              />
            </div>
            <Button
              variant="outline"
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
        </header>

        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty hasQuery={!!query} />
        ) : (
          <>
            <div className="px-6 py-5 space-y-6">
              {grouped.map(([dayMs, items]) => (
                <DayGroup
                  key={dayMs}
                  date={new Date(dayMs)}
                  items={items}
                />
              ))}
            </div>

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

const DayGroup = ({ date, items }) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Calendar className="h-3.5 w-3.5" />
      </span>
      <p className="font-display text-base tracking-tight">{dayLabel(date)}</p>
      <span className="ml-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground tabular-nums">
        {items.length}
      </span>
      <div className="flex-1 h-px bg-border/60" aria-hidden />
    </div>
    <ol className="relative space-y-2 pl-7 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-linear-to-b before:from-primary/40 before:via-border before:to-transparent">
      {items.map((e, i) => (
        <AuditEntry key={`${e.viewedAt}-${i}`} entry={e} />
      ))}
    </ol>
  </div>
)

const AuditEntry = ({ entry }) => (
  <li className="relative">
    <span
      className="absolute -left-7 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-card"
      aria-hidden
    >
      <Eye className="h-3 w-3" />
    </span>
    <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 flex flex-wrap items-center gap-3 transition-colors hover:border-primary/30 hover:bg-muted/30">
      {/* Viewer */}
      <div className="flex items-center gap-2.5 min-w-0">
        <DoctorAvatar
          name={entry.viewer?.name}
          size="sm"
          tone="primary"
          showRing={false}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            Dr {entry.viewer?.name || '—'}
          </p>
          {entry.viewer?.specialty && (
            <p className="text-[10px] text-muted-foreground truncate">
              {entry.viewer.specialty}
            </p>
          )}
        </div>
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />

      <span className="text-xs text-muted-foreground italic hidden sm:inline">
        viewed record of
      </span>

      {/* Patient */}
      <div className="flex items-center gap-2.5 min-w-0">
        <DoctorAvatar
          name={entry.patient?.name}
          size="sm"
          tone="sage"
          showRing={false}
        />
        <p className="text-sm font-medium truncate">
          {entry.patient?.name || '—'}
        </p>
      </div>

      {/* Time */}
      <div className="ml-auto text-right">
        <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
          {format(new Date(entry.viewedAt), 'h:mm:ss a')}
        </p>
      </div>

      <StatusBadge tone="primary">Logged</StatusBadge>
    </div>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────

const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/95">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

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

const Loading = () => (
  <div className="p-6 space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = ({ hasQuery }) => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <ScrollText className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      {hasQuery ? 'No matching events' : 'No record views yet'}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
      {hasQuery
        ? 'Try a different name or specialty.'
        : "Entries appear here when doctors open patient records on a call."}
    </p>
  </div>
)

export default AuditLogPage
