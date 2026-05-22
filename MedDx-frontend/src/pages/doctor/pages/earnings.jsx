import { format } from 'date-fns'
import {
  ArrowDownRight,
  Coins,
  IndianRupee,
  RefreshCw,
} from 'lucide-react'

import { useMyEarnings } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const formatRupees = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format((paise || 0) / 100)

const EarningsPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { balancePaise, transactions, isLoading, isFetching, refetch } =
    useMyEarnings()

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          Your earnings.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Patients are charged ₹199 per consult. You keep 80%, MedDx keeps 20%
          for platform costs. Free first consults and emergency triage don't
          create a transaction.
        </p>
      </div>

      <div className="fade-up fade-up-delay-1 grid sm:grid-cols-2 gap-4">
        <StatCard
          icon={Coins}
          label="Wallet balance"
          value={isLoading ? '—' : formatRupees(balancePaise)}
          hint="Available to withdraw"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Paid consultations"
          value={isLoading ? '—' : String(transactions.length)}
          hint={
            transactions.length
              ? `Last on ${format(new Date(transactions[0].createdAt), 'MMM d, yyyy')}`
              : 'No paid consults yet'
          }
        />
      </div>

      <section className="fade-up fade-up-delay-2 rounded-2xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/70">
          <div>
            <h2 className="font-display text-xl tracking-tight">
              Transactions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {transactions.length} entr{transactions.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </header>

        {isLoading ? (
          <Loading />
        ) : transactions.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border/60">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="flex flex-wrap items-center gap-4 px-6 py-4"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage/15 text-sage-foreground shrink-0">
                  <IndianRupee className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {t.patient?.name || 'Patient'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {format(new Date(t.createdAt), "MMM d, yyyy · h:mm a")}
                    {t.appointment?.datetime && (
                      <span className="ml-2 opacity-60">
                        consult:{' '}
                        {format(
                          new Date(t.appointment.datetime),
                          'MMM d, h:mm a'
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] uppercase tracking-[0.12em] bg-sage/15 text-sage-foreground border-sage/30"
                >
                  {t.type}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-semibold font-mono tabular-nums">
                    + {formatRupees(t.doctorEarning)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {formatRupees(t.amount)} · platform {formatRupees(t.platformFee)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-2xl border border-border/70 bg-card p-5">
    <div className="flex items-center gap-2 text-clinic">
      <Icon className="h-4 w-4" />
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold">
        {label}
      </p>
    </div>
    <p className="mt-3 font-display text-3xl tabular-nums tracking-tight">
      {value}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
  </div>
)

const Loading = () => (
  <div className="px-6 py-6 space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Coins className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No earnings yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Paid consults will appear here as they happen. Free / emergency
      bookings don't generate a transaction.
    </p>
  </div>
)

export default EarningsPage
