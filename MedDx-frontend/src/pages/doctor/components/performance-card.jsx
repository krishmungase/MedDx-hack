import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  Activity,
  CalendarRange,
  IndianRupee,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

const formatRupees = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const monthLabel = (key) => {
  // "2026-05" → "May"
  if (!key) return ''
  const [y, m] = key.split('-').map(Number)
  return format(new Date(y, (m || 1) - 1, 1), 'MMM')
}

/**
 * Performance section for the doctor profile.
 *
 * Pulls everything from /doctors/me/stats — no schema change, no extra wiring
 * required. Useful even on a 1-consult dev DB because the spark/series are
 * forced-continuous on the backend.
 */
const PerformanceCard = ({ stats }) => {
  const monthly = stats?.monthlyTrend || []
  const last7 = stats?.last7Days || []
  const recent = stats?.recent || []

  const monthlyMax = useMemo(
    () => Math.max(1, ...monthly.map((m) => m.count)),
    [monthly]
  )
  const last7Max = useMemo(
    () => Math.max(1, ...last7.map((d) => d.count)),
    [last7]
  )

  const last7Total = last7.reduce((acc, d) => acc + d.count, 0)
  const avgPerDay = last7.length ? last7Total / last7.length : 0

  return (
    <div className="fade-up fade-up-delay-2 space-y-4">
      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Stethoscope}
          label="Lifetime consults"
          value={stats?.totalConsults ?? 0}
          tone="primary"
        />
        <StatTile
          icon={Users}
          label="Unique patients"
          value={stats?.uniquePatients ?? 0}
          tone="sage"
        />
        <StatTile
          icon={CalendarRange}
          label="This month"
          value={stats?.thisMonth?.consults ?? 0}
          hint="completed consults"
          tone="amber"
        />
        <StatTile
          icon={IndianRupee}
          label="Earnings · MTD"
          value={formatRupees(stats?.thisMonth?.earningsPaise)}
          isText
          tone="muted"
        />
      </div>

      {/* Monthly trend bars */}
      <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                Last 6 months
              </p>
              <p className="text-sm font-display tracking-tight">
                Completed consults trend
              </p>
            </div>
          </div>
        </header>
        <div className="p-5">
          {monthly.every((m) => m.count === 0) ? (
            <EmptyTrend />
          ) : (
            <div className="flex items-end justify-between gap-2 h-32">
              {monthly.map((m) => {
                const pct = Math.max(4, (m.count / monthlyMax) * 100)
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                      {m.count}
                    </span>
                    <span
                      className="w-full rounded-md bg-linear-to-t from-primary/20 to-primary/70"
                      style={{ height: `${pct}%` }}
                      title={`${m.month} · ${m.count} consult${m.count === 1 ? '' : 's'}`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {monthLabel(m.month)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Last 7 days sparkline */}
      <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sage/15 text-sage-foreground">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                Last 7 days
              </p>
              <p className="text-sm font-display tracking-tight">
                {last7Total} consult{last7Total === 1 ? '' : 's'} ·{' '}
                <span className="text-muted-foreground font-normal">
                  avg {avgPerDay.toFixed(1)}/day
                </span>
              </p>
            </div>
          </div>
        </header>
        <div className="px-5 py-4">
          <Sparkline points={last7} max={last7Max} />
        </div>
      </section>

      {/* Recent consults */}
      <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                Recent consults
              </p>
              <p className="text-sm font-display tracking-tight">
                Last {recent.length} completed
              </p>
            </div>
          </div>
        </header>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No completed consultations yet.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((r) => (
              <li key={r._id} className="px-5 py-3 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sage/15 text-sage-foreground shrink-0 text-[11px] font-semibold">
                    {(r.patient?.name || 'P').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {r.patient?.name || 'Patient'}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                      {format(new Date(r.datetime), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  {r.triageUrgency && (
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[9px] uppercase tracking-[0.12em] ${URGENCY_TONE[r.triageUrgency] || ''}`}
                    >
                      {r.triageUrgency}
                    </Badge>
                  )}
                </div>
                {r.notesPreview && (
                  <p className="ml-11 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {r.notesPreview}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}

const StatTile = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  isText = false,
}) => (
  <article className="rounded-2xl border border-border/70 bg-card p-4">
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${TONE_BG[tone]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
          {label}
        </p>
        <p
          className={`mt-0.5 font-display tracking-tight ${
            isText ? 'text-lg font-medium' : 'text-2xl tabular-nums'
          }`}
          title={isText ? value : undefined}
        >
          {value}
        </p>
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  </article>
)

// Tiny inline SVG sparkline — no chart lib needed.
const Sparkline = ({ points, max }) => {
  if (!points?.length) return null
  const W = 600
  const H = 60
  const stepX = W / Math.max(1, points.length - 1)
  const xy = points.map((p, i) => {
    const x = i * stepX
    const y = H - (p.count / max) * (H - 8) - 4
    return [x, y]
  })
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  const dArea = `${d} L${W},${H} L0,${H} Z`

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-16"
        aria-hidden
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={dArea} fill="url(#sparkFill)" className="text-primary" />
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {xy.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={points[i].count > 0 ? 3 : 1.5}
            className="text-primary"
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
        {points.map((p) => (
          <span key={p.date} className="tabular-nums">
            {format(new Date(p.date), 'EEE')}
          </span>
        ))}
      </div>
    </div>
  )
}

const EmptyTrend = () => (
  <div className="h-32 flex flex-col items-center justify-center text-xs text-muted-foreground">
    <Sparkles className="h-4 w-4 mb-1 opacity-50" />
    No completed consultations in the last 6 months yet.
  </div>
)

export default PerformanceCard
