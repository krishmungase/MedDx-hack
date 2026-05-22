import { useMemo, useState } from 'react'
import { format, isSameMonth } from 'date-fns'
import {
  ArrowDownRight,
  Banknote,
  Coins,
  IndianRupee,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { useMyEarnings } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import {
  DataPagination,
  DoctorAvatar,
  StatusBadge,
  VitalLine,
} from '@/components'

const formatRupees = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format((paise || 0) / 100)

const formatCompactRupees = (paise) => {
  const r = (paise || 0) / 100
  if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`
  if (r >= 1000) return `₹${(r / 1000).toFixed(1)}k`
  return `₹${r.toFixed(0)}`
}

const PAGE_SIZE = 10

const EarningsPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { balancePaise, transactions, isLoading, isFetching, refetch } =
    useMyEarnings()
  const [page, setPage] = useState(1)

  const { thisMonthPaise, lastConsult, totalEarnings, last7DaysPath } = useMemo(() => {
    const now = new Date()
    const thisMonth = transactions
      .filter((t) => isSameMonth(new Date(t.createdAt), now))
      .reduce((sum, t) => sum + (t.doctorEarning || 0), 0)
    const last = transactions[0]
      ? format(new Date(transactions[0].createdAt), 'MMM d, yyyy')
      : 'No paid consults yet'
    const total = transactions.reduce(
      (sum, t) => sum + (t.doctorEarning || 0),
      0,
    )

    // Build a tiny sparkline from the last 7 days' daily totals
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    const buckets = days.map((dayStart) => {
      const next = dayStart + 86_400_000
      return transactions
        .filter((t) => {
          const ts = new Date(t.createdAt).getTime()
          return ts >= dayStart && ts < next
        })
        .reduce((s, t) => s + (t.doctorEarning || 0), 0)
    })
    const max = Math.max(1, ...buckets)
    const stepX = 120 / 6
    const path = buckets
      .map(
        (v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)} ${(32 - (v / max) * 28).toFixed(1)}`,
      )
      .join(' ')
    return {
      thisMonthPaise: thisMonth,
      lastConsult: last,
      totalEarnings: total,
      last7DaysPath: path,
    }
  }, [transactions])

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const pageItems = transactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  return (
    <div className="space-y-8">
      {/* Greeting strip */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Doctor · Earnings
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Your earnings.
        </h1>
      </div>

      {/* Big wallet hero */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          {/* Wallet display */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <Wallet className="h-3 w-3" />
              Wallet balance
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              <p className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight tabular-nums leading-none">
                {isLoading ? '—' : formatRupees(balancePaise)}
              </p>
              <p className="text-sm text-white/70 pb-2">Available to withdraw</p>
            </div>

            <p className="text-white/80 max-w-md leading-relaxed">
              You keep 80% of every paid consult — MedDx keeps 20% for platform
              costs. Free first visits and emergency triage don't create a
              transaction.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={() => refetch?.()}
                disabled={isFetching}
                size="lg"
                className="rounded-full h-11 px-6 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/10"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full h-11 px-6 text-white hover:bg-white/10"
                disabled
                title="Coming soon"
              >
                <Banknote className="h-4 w-4" />
                Withdraw (soon)
              </Button>
            </div>
          </div>

          {/* Last 7 days sparkline panel */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                Last 7 days
              </p>
            </div>
            <p className="font-display text-3xl tabular-nums tracking-tight">
              {formatCompactRupees(thisMonthPaise)}
            </p>
            <p className="text-xs text-white/60 mt-0.5">earned this month</p>

            <svg viewBox="0 0 120 36" className="mt-4 h-12 w-full" aria-hidden>
              <defs>
                <linearGradient id="earn-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.18 165)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="oklch(0.85 0.18 165)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${last7DaysPath} L120 36 L0 36 Z`}
                fill="url(#earn-fill)"
              />
              <path
                d={last7DaysPath}
                fill="none"
                stroke="oklch(0.95 0.05 165)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </aside>
        </div>
      </section>

      {/* Stat grid */}
      <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={Coins}
          label="Wallet"
          value={isLoading ? '—' : formatCompactRupees(balancePaise)}
          tone="primary"
        />
        <BigStat
          icon={TrendingUp}
          label="This month"
          value={isLoading ? '—' : formatCompactRupees(thisMonthPaise)}
          tone="sage"
        />
        <BigStat
          icon={IndianRupee}
          label="Total earned"
          value={isLoading ? '—' : formatCompactRupees(totalEarnings)}
          tone="amber"
        />
        <BigStat
          icon={ArrowDownRight}
          label="Consults"
          value={isLoading ? '—' : String(transactions.length)}
          hint={transactions.length ? `Last ${lastConsult}` : 'No paid yet'}
          tone="muted"
        />
      </section>

      {/* Transactions card */}
      <section className="fade-up fade-up-delay-3 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight leading-none">
                Transactions
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.length} entr
                {transactions.length === 1 ? 'y' : 'ies'}
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <TableLoading />
        ) : transactions.length === 0 ? (
          <TableEmpty />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {pageItems.map((t) => (
                <TxnRow key={t._id} t={t} />
              ))}
            </ul>

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

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}

const BigStat = ({ icon: Icon, label, value, hint, tone = 'primary' }) => (
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
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────

const TxnRow = ({ t }) => (
  <li className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30">
    <DoctorAvatar name={t.patient?.name} size="sm" tone="sage" showRing={false} />

    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">
        {t.patient?.name || 'Patient'}
      </p>
      <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
        {format(new Date(t.createdAt), "MMM d, yyyy · h:mm a")}
        {t.appointment?.datetime && (
          <span className="ml-2 opacity-60">
            consult: {format(new Date(t.appointment.datetime), 'MMM d, h:mm a')}
          </span>
        )}
      </p>
    </div>

    <StatusBadge tone="sage">{t.type}</StatusBadge>

    <div className="text-right">
      <p className="font-display text-base font-semibold font-mono tabular-nums text-sage-foreground">
        +{formatRupees(t.doctorEarning)}
      </p>
      <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
        of {formatRupees(t.amount)} · −{formatRupees(t.platformFee)} platform
      </p>
    </div>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────

const TableLoading = () => (
  <div className="px-6 py-6 space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const TableEmpty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Coins className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No earnings yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
      Paid consults will appear here as they happen. Free / emergency
      bookings don't generate a transaction.
    </p>
  </div>
)

export default EarningsPage
