import { useMemo, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import {
  DataPagination,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@/components'

const formatRupees = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format((paise || 0) / 100)

const PAGE_SIZE = 10

const EarningsPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { balancePaise, transactions, isLoading, isFetching, refetch } =
    useMyEarnings()
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const pageItems = useMemo(
    () => transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [transactions, page],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor · Earnings"
        title="Your earnings."
        description="Patients are charged ₹199 per consult. You keep 80%, MedDx keeps 20% for platform costs. Free first consults and emergency triage don't create a transaction."
      />

      <div className="fade-up fade-up-delay-1 grid sm:grid-cols-2 gap-4">
        <StatCard
          icon={Coins}
          tone="primary"
          label="Wallet balance"
          value={isLoading ? '—' : formatRupees(balancePaise)}
          hint="Available to withdraw"
        />
        <StatCard
          icon={ArrowDownRight}
          tone="sage"
          label="Paid consultations"
          value={isLoading ? '—' : String(transactions.length)}
          hint={
            transactions.length
              ? `Last on ${format(new Date(transactions[0].createdAt), 'MMM d, yyyy')}`
              : 'No paid consults yet'
          }
        />
      </div>

      <section className="fade-up fade-up-delay-2 rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <h2 className="font-display text-xl tracking-tight">
              Transactions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {transactions.length} entr{transactions.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          <Button
            variant="outline"
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
          <>
            <ul className="divide-y divide-border/60">
              {pageItems.map((t) => (
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
                  <StatusBadge tone="sage">{t.type}</StatusBadge>
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
