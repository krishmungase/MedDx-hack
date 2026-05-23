import { useMemo } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  Clock4,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { useMySlots } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { VitalLine } from '@/components'

import AddAvailabilityCard from '../components/add-availability-card'
import SlotsList from '../components/slots-list'

const AvailabilityPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })

  const { slots } = useMySlots()

  const { total, booked, available, utilization, nextLabel } = useMemo(() => {
    const now = Date.now()
    const future = (slots || []).filter(
      (s) => new Date(s.datetime).getTime() >= now - 30 * 60 * 1000,
    )
    const total = future.length
    const booked = future.filter((s) => s.status === 'booked').length
    const available = total - booked
    const utilization = total === 0 ? 0 : Math.round((booked / total) * 100)

    const upcomingSorted = future
      .slice()
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    const nextSlot = upcomingSorted[0]
    const nextLabel = nextSlot
      ? new Date(nextSlot.datetime).toLocaleString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '—'

    return { total, booked, available, utilization, nextLabel }
  }, [slots])

  return (
    <div className="space-y-8">
      {/* Greeting strip */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Doctor · Availability
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Your availability.
        </h1>
      </div>

      {/* Utilization hero */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          {/* Left — utilization */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Taking bookings
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {utilization}%{' '}
              <span className="text-white/85 font-normal italic">utilization</span>
            </h2>
            <p className="text-white/80 max-w-md leading-relaxed">
              {available} open · {booked} booked across the next few days. Open
              a fresh window below to take more.
            </p>

            {/* Visual utilization bar */}
            <div className="space-y-1.5 max-w-md">
              <div className="h-2.5 rounded-full bg-white/15 overflow-hidden ring-1 ring-white/10">
                <div
                  className="h-full bg-linear-to-r from-emerald-300 via-sky-300 to-white rounded-full transition-all"
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-white/65 tabular-nums font-medium">
                <span>{booked} booked</span>
                <span>{total} total</span>
              </div>
            </div>
          </div>

          {/* Right — at-a-glance */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                At a glance
              </p>
            </div>
            <GlanceRow icon={Clock4} label="Open slots" value={available} />
            <GlanceRow icon={CheckCircle2} label="Booked" value={booked} />
            <GlanceRow icon={CalendarClock} label="Next" value={nextLabel} compact />
            <p className="text-[10px] text-white/55 italic pt-2 border-t border-white/10">
              30-minute slots, no overlaps
            </p>
          </aside>
        </div>
      </section>

      {/* Add availability — the form */}
      <div className="fade-up fade-up-delay-2">
        <AddAvailabilityCard />
      </div>

      {/* Slots list */}
      <div className="fade-up fade-up-delay-3">
        <SlotsList />
      </div>
    </div>
  )
}

const GlanceRow = ({ icon: Icon, label, value, compact = false }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 shrink-0">
      <Icon className="h-3.5 w-3.5 text-white" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-white/70">{label}</p>
    </div>
    <p
      className={`font-display tracking-tight tabular-nums ${compact ? 'text-sm' : 'text-xl'}`}
    >
      {value}
    </p>
  </div>
)

export default AvailabilityPage
