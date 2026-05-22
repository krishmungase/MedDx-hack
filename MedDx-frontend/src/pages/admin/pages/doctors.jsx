import { useMemo } from 'react'
import {
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Stethoscope,
  UserPlus2,
} from 'lucide-react'

import { useDoctors } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { VitalLine } from '@/components'

import DoctorsTable from '../components/doctors-table'
import RegisterDoctorDialog from '../components/register-doctor-dialog'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { doctors } = useDoctors()

  const stats = useMemo(() => {
    const total = doctors.length
    const active = doctors.filter((d) => d.accountStatus === 'active').length
    const pending = doctors.filter((d) => d.accountStatus === 'pending_setup').length
    const suspended = doctors.filter(
      (d) => d.accountStatus === 'suspended',
    ).length
    return { total, active, pending, suspended }
  }, [doctors])

  const pctActive = stats.total ? Math.round((stats.active / stats.total) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Admin · Doctors
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Doctors.
        </h1>
      </div>

      {/* Hero */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <Stethoscope className="h-3 w-3" />
              {stats.total} verified specialists on MedDx
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {pctActive}%{' '}
              <span className="text-white/85 font-normal italic">active</span>
            </h2>
            <p className="text-white/80 max-w-md leading-relaxed">
              Public registration is patient-only — every doctor on MedDx is
              verified and onboarded by you.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <RegisterDoctorDialog />
            </div>
          </div>

          {/* Donut + breakdown */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 hidden lg:flex items-center gap-5">
            <Donut
              total={stats.total}
              active={stats.active}
              pending={stats.pending}
              suspended={stats.suspended}
            />
            <div className="space-y-3 flex-1">
              <DonutLegend
                color="bg-emerald-300"
                label="Active"
                value={stats.active}
              />
              <DonutLegend
                color="bg-amber-300"
                label="Pending setup"
                value={stats.pending}
              />
              <DonutLegend
                color="bg-rose-300"
                label="Suspended"
                value={stats.suspended}
              />
            </div>
          </aside>
        </div>
      </section>

      {/* Quick stats */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={Stethoscope}
          label="Total"
          value={stats.total}
          tone="primary"
        />
        <BigStat
          icon={CheckCircle2}
          label="Active"
          value={stats.active}
          tone="sage"
        />
        <BigStat
          icon={Sparkles}
          label="Pending"
          value={stats.pending}
          tone="amber"
        />
        <BigStat
          icon={PauseCircle}
          label="Suspended"
          value={stats.suspended}
          tone="muted"
        />
      </section>

      {/* Table */}
      <div className="fade-up fade-up-delay-3">
        <DoctorsTable />
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl flex items-start gap-2 px-1">
        <UserPlus2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        Suspended doctors can't log in. Re-activating restores access without
        re-issuing a setup link. Removing is permanent.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

/** Inline donut chart in pure SVG — used in the hero aside */
const Donut = ({ total, active, pending, suspended }) => {
  const r = 36
  const c = 2 * Math.PI * r
  const safe = total || 1
  const aLen = (active / safe) * c
  const pLen = (pending / safe) * c
  const sLen = (suspended / safe) * c

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.15)"
          strokeWidth="10"
        />
        {/* Active arc */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(0.85 0.18 165)"
          strokeWidth="10"
          strokeDasharray={`${aLen} ${c - aLen}`}
          strokeLinecap="round"
        />
        {/* Pending arc */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(0.85 0.16 75)"
          strokeWidth="10"
          strokeDasharray={`${pLen} ${c - pLen}`}
          strokeDashoffset={-aLen}
          strokeLinecap="round"
        />
        {/* Suspended arc */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(0.75 0.2 22)"
          strokeWidth="10"
          strokeDasharray={`${sLen} ${c - sLen}`}
          strokeDashoffset={-(aLen + pLen)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <p className="font-display text-2xl font-bold tabular-nums leading-none">
          {total}
        </p>
        <p className="text-[9px] uppercase tracking-[0.14em] text-white/70 font-semibold mt-0.5">
          Doctors
        </p>
      </div>
    </div>
  )
}

const DonutLegend = ({ color, label, value }) => (
  <div className="flex items-center gap-2.5">
    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    <p className="text-xs text-white/85 flex-1">{label}</p>
    <p className="font-display text-sm font-semibold tabular-nums">{value}</p>
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

export default DoctorsPage
