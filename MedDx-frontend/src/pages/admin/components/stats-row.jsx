import {
  CalendarCheck,
  Stethoscope,
  Users,
} from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

const StatCard = ({ icon, label, value, accent, isLoading }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6">
    <div className="flex items-center justify-between">
      <span
        className="rounded-full bg-clinic/10 p-2 text-clinic"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {accent}
      </span>
    </div>
    <div className="mt-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-2 h-9 w-24" />
      ) : (
        <p className="mt-2 font-display text-4xl tracking-tight">
          {Number.isFinite(value) ? value.toLocaleString() : '—'}
        </p>
      )}
    </div>
  </div>
)

const StatsRow = ({ stats, isLoading }) => {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard
        icon={<Users className="h-4 w-4" />}
        label="Patients"
        value={stats?.patients}
        accent="Total"
        isLoading={isLoading}
      />
      <StatCard
        icon={<Stethoscope className="h-4 w-4" />}
        label="Doctors"
        value={stats?.doctors}
        accent="On platform"
        isLoading={isLoading}
      />
      <StatCard
        icon={<CalendarCheck className="h-4 w-4" />}
        label="Appointments"
        value={stats?.appointments}
        accent="All-time"
        isLoading={isLoading}
      />
    </div>
  )
}

export default StatsRow
