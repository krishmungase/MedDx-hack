import { CalendarCheck, Stethoscope, Users } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components'

const renderValue = (v, isLoading) => {
  if (isLoading) return <Skeleton className="h-9 w-24" />
  return Number.isFinite(v) ? v.toLocaleString() : '—'
}

const StatsRow = ({ stats, isLoading }) => {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard
        icon={Users}
        tone="primary"
        label="Patients"
        value={renderValue(stats?.patients, isLoading)}
        hint="Total registered"
      />
      <StatCard
        icon={Stethoscope}
        tone="sage"
        label="Doctors"
        value={renderValue(stats?.doctors, isLoading)}
        hint="On platform"
      />
      <StatCard
        icon={CalendarCheck}
        tone="amber"
        label="Appointments"
        value={renderValue(stats?.appointments, isLoading)}
        hint="All-time bookings"
      />
    </div>
  )
}

export default StatsRow
