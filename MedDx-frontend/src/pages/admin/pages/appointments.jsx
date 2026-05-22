import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarCheck, RefreshCw } from 'lucide-react'

import { usePlatformAppointments } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataPagination, PageHeader, StatusBadge } from '@/components'

const STATUS_TONE = {
  scheduled: 'primary',
  completed: 'sage',
  cancelled: 'destructive',
}

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 12

const AppointmentsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const { appointments, isLoading, isFetching, refetch } =
    usePlatformAppointments({
      status: status === 'all' ? undefined : status,
    })

  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE))

  // Snap back to page 1 if the result set shrinks below the current page.
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const pageItems = useMemo(
    () => appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [appointments, page],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin · Appointments"
        title="Appointments."
        description="Everything booked across MedDx. Use this view to spot stuck calls, unusual urgency clusters, or busy doctors."
        actions={
          <>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 w-40 rounded-full bg-card border-border data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => refetch?.()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </>
        }
      />

      <section className="fade-up fade-up-delay-1 rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <Loading />
        ) : appointments.length === 0 ? (
          <Empty />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {pageItems.map((a) => (
                <li
                  key={a._id}
                  className="flex flex-wrap items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <CalendarCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {a.patientId?.name || 'Patient'}{' '}
                      <span className="text-muted-foreground font-normal">
                        → Dr {a.doctorId?.name || '—'}
                        {a.doctorId?.specialty
                          ? ` · ${a.doctorId.specialty}`
                          : ''}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                      {format(new Date(a.datetime), "EEE, MMM d · h:mm a")}
                    </p>
                  </div>
                  {a.triageUrgency && (
                    <StatusBadge tone={URGENCY_TONE[a.triageUrgency] || 'muted'}>
                      {a.triageUrgency}
                    </StatusBadge>
                  )}
                  <StatusBadge tone="muted">{a.paymentStatus}</StatusBadge>
                  <StatusBadge tone={STATUS_TONE[a.status] || 'muted'}>
                    {a.status}
                  </StatusBadge>
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
  <div className="p-6 space-y-3">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <CalendarCheck className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      Nothing booked yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      As patients book consultations, they'll appear here.
    </p>
  </div>
)

export default AppointmentsPage
