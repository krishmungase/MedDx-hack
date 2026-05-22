import { useMemo, useState } from 'react'
import { format, isSameMonth } from 'date-fns'
import {
  FilePenLine,
  Globe,
  Notebook,
  Pill,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'

import { useMyPrescriptions } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import PrescriptionCard from '@/components/shared/prescription-card'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const PAGE_SIZE = 4

const PrescriptionsPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { items, isLoading, isFetching, refetch } = useMyPrescriptions()
  const [page, setPage] = useState(1)

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = items.filter((it) =>
      isSameMonth(new Date(it.datetime), now),
    ).length
    const urgent = items.filter((it) =>
      ['high', 'emergency'].includes(it.triageUrgency),
    ).length
    const distinctPatients = new Set(items.map((it) => it.patient?._id)).size
    return { total: items.length, thisMonth, urgent, distinctPatients }
  }, [items])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-8">
      {/* Greeting strip */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Doctor · Prescriptions
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Prescriptions.
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
              <ShieldCheck className="h-3 w-3" />
              Doctor-approved
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {stats.total}{' '}
              <span className="text-white/85 font-normal italic">
                prescriptions written
              </span>
            </h2>
            <p className="text-white/80 max-w-md leading-relaxed">
              Every script you've approved and saved to a patient's record.
              Reopen one to review what you wrote.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => refetch?.()}
                disabled={isFetching}
                size="lg"
                className="rounded-full h-11 px-6 bg-white text-primary hover:bg-white/90 font-semibold"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-3 hidden lg:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                At a glance
              </p>
            </div>
            <GlanceRow icon={Pill} label="Total scripts" value={stats.total} />
            <GlanceRow
              icon={FilePenLine}
              label="This month"
              value={stats.thisMonth}
            />
            <GlanceRow
              icon={Stethoscope}
              label="Unique patients"
              value={stats.distinctPatients}
            />
          </aside>
        </div>
      </section>

      {/* Stat grid */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat icon={Pill} label="Total" value={stats.total} tone="primary" />
        <BigStat
          icon={FilePenLine}
          label="This month"
          value={stats.thisMonth}
          tone="sage"
        />
        <BigStat
          icon={Stethoscope}
          label="Patients"
          value={stats.distinctPatients}
          tone="amber"
        />
        <BigStat
          icon={ShieldCheck}
          label="Urgent"
          value={stats.urgent}
          tone="muted"
        />
      </section>

      {/* Prescription list */}
      {isLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div className="fade-up fade-up-delay-3 grid gap-4">
            {pageItems.map((it) => (
              <PrescriptionEntry key={it._id} item={it} />
            ))}
          </div>

          {totalPages > 1 && (
            <DataPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
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

const PrescriptionEntry = ({ item }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
    <span
      className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-sage"
      aria-hidden
    />

    {/* Header band */}
    <header className="flex flex-wrap items-center gap-3 px-5 pl-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
      <DoctorAvatar name={item.patient?.name} size="md" tone="sage" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-base tracking-tight truncate">
          {item.patient?.name || 'Patient'}
        </p>
        <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
          {format(new Date(item.datetime), "EEE, MMM d, yyyy · h:mm a")}
        </p>
      </div>
      {item.triageUrgency && (
        <StatusBadge tone={URGENCY_TONE[item.triageUrgency] || 'muted'}>
          {item.triageUrgency}
        </StatusBadge>
      )}
      {item.patient?.language && item.patient.language !== 'en' && (
        <StatusBadge tone="muted" icon={Globe}>
          {item.patient.language}
        </StatusBadge>
      )}
    </header>

    <div className="p-5 pl-6 space-y-3">
      {item.doctorNotes && (
        <div className="rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5">
            Doctor's notes
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {item.doctorNotes}
          </p>
        </div>
      )}
      <PrescriptionCard
        prescription={item.prescription}
        printContext={{
          doctorName: 'You',
          patientName: item.patient?.name,
          date: format(new Date(item.datetime), "EEE, MMM d, yyyy · h:mm a"),
          notes: item.doctorNotes,
        }}
      />
    </div>
  </article>
)

// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Notebook className="h-7 w-7" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No prescriptions yet
    </h3>
    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
      Prescriptions you save during a consult will show up here for your
      future reference.
    </p>
  </div>
)

export default PrescriptionsPage
