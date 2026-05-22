import {
  ArrowUpRight,
  CalendarCheck,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router'

import { useAuth, usePageTitle } from '@/hooks'
import { useStats } from '@/apis'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import { VitalLine } from '@/components'

const OverviewPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'admin'

  const { stats, isLoading } = useStats()

  return (
    <div className="space-y-8">
      {/* ── Greeting strip ─────────────────────────────────────────────────── */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Admin · Overview
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Good to see you, {first}.
        </h1>
      </div>

      {/* ── Hero: platform health ──────────────────────────────────────────── */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Platform healthy
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              The platform's{' '}
              <span className="text-white/85 font-normal italic">in good hands.</span>
            </h2>
            <p className="text-white/80 max-w-xl leading-relaxed">
              {isLoading
                ? 'Loading the latest numbers…'
                : `${(stats?.patients || 0).toLocaleString()} patients can reach ${(stats?.doctors || 0).toLocaleString()} verified specialists. Keep growing the bench.`}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="rounded-full h-11 px-6 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/10"
              >
                <Link to="/admin/doctors">
                  <Stethoscope className="h-4 w-4" />
                  Manage doctors
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full h-11 px-6 text-white hover:bg-white/10"
              >
                <Link to="/admin/audit-log">
                  <ShieldCheck className="h-4 w-4" />
                  View audit log
                </Link>
              </Button>
            </div>
          </div>

          {/* Right panel — quick at-a-glance counter */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-4 hidden lg:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                At a glance
              </p>
            </div>
            <div className="space-y-3">
              <GlanceRow
                icon={Users}
                label="Patients"
                value={isLoading ? '—' : (stats?.patients || 0).toLocaleString()}
              />
              <GlanceRow
                icon={Stethoscope}
                label="Specialists"
                value={isLoading ? '—' : (stats?.doctors || 0).toLocaleString()}
              />
              <GlanceRow
                icon={CalendarCheck}
                label="Consultations"
                value={isLoading ? '—' : (stats?.appointments || 0).toLocaleString()}
              />
            </div>
            <p className="text-[10px] text-white/55 italic pt-2 border-t border-white/10">
              Updated just now
            </p>
          </aside>
        </div>
      </section>

      {/* ── Big stat grid ──────────────────────────────────────────────────── */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlatformStat
          icon={Users}
          label="Patients on MedDx"
          value={stats?.patients}
          accent="Total registered"
          tone="primary"
          isLoading={isLoading}
          sparkPath="M0 30 L20 25 L40 20 L60 22 L80 15 L100 12 L120 8"
        />
        <PlatformStat
          icon={Stethoscope}
          label="Verified specialists"
          value={stats?.doctors}
          accent="Active accounts"
          tone="sage"
          isLoading={isLoading}
          sparkPath="M0 28 L20 22 L40 18 L60 16 L80 14 L100 12 L120 10"
        />
        <PlatformStat
          icon={CalendarCheck}
          label="Consultations"
          value={stats?.appointments}
          accent="All-time"
          tone="amber"
          isLoading={isLoading}
          sparkPath="M0 25 L20 28 L40 18 L60 22 L80 12 L100 14 L120 6"
        />
      </section>

      {/* ── Quick actions strip ────────────────────────────────────────────── */}
      <section className="fade-up fade-up-delay-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          icon={Stethoscope}
          title="Register a doctor"
          body="Send a 24-hour setup link to onboard a new specialist."
          cta="Go to doctors"
          to="/admin/doctors"
        />
        <QuickAction
          icon={CalendarCheck}
          title="Audit bookings"
          body="Spot stuck calls, urgency clusters, or busy doctors."
          cta="Open appointments"
          to="/admin/appointments"
        />
        <QuickAction
          icon={ScrollText}
          title="Privacy audit"
          body="Every record access is logged. Review who saw what."
          cta="View audit log"
          to="/admin/audit-log"
        />
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

// ─────────────────────────────────────────────────────────────────────────

const PLATFORM_TONE = {
  primary: {
    chip: 'bg-primary/10 text-primary',
    bar: 'bg-linear-to-r from-primary to-primary/40',
    spark: 'stroke-primary',
  },
  sage: {
    chip: 'bg-sage/15 text-sage-foreground',
    bar: 'bg-linear-to-r from-sage to-sage/40',
    spark: 'stroke-sage',
  },
  amber: {
    chip: 'bg-amber-warm/15 text-amber-warm',
    bar: 'bg-linear-to-r from-amber-warm to-amber-warm/40',
    spark: 'stroke-amber-warm',
  },
}

const PlatformStat = ({
  icon: Icon,
  label,
  value,
  accent,
  tone,
  isLoading,
  sparkPath,
}) => {
  const T = PLATFORM_TONE[tone] || PLATFORM_TONE.primary
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
      <span className={`absolute left-0 top-0 right-0 h-1 ${T.bar}`} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${T.chip}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {accent}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="font-display text-4xl tracking-tight tabular-nums leading-none">
            {isLoading ? (
              <span className="inline-block h-8 w-20 rounded bg-muted/60 animate-pulse" />
            ) : Number.isFinite(value) ? (
              value.toLocaleString()
            ) : (
              '—'
            )}
          </p>
          <svg
            viewBox="0 0 120 36"
            className="h-9 w-24 shrink-0"
            aria-hidden
          >
            <path
              d={sparkPath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={T.spark}
            />
          </svg>
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-sage-foreground/80 font-medium">
          <TrendingUp className="h-3 w-3" />
          Trending up
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const QuickAction = ({ icon: Icon, title, body, cta, to }) => (
  <Link
    to={to}
    className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
  >
    <span
      className="absolute inset-0 bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-hidden
    />
    <div className="relative flex items-start gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base tracking-tight leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {body}
        </p>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          {cta}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </div>
    </div>
  </Link>
)

export default OverviewPage
