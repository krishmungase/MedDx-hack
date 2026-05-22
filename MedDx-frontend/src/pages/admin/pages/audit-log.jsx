import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Eye, RefreshCw, ScrollText, ShieldCheck } from 'lucide-react'

import { useAuditLog } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import { DataPagination, PageHeader, StatusBadge } from '@/components'

const PAGE_SIZE = 15

const AuditLogPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { entries, isLoading, isFetching, refetch } = useAuditLog()
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const pageItems = useMemo(
    () => entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [entries, page],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin · Audit log"
        title="Audit log."
        description="Every time a doctor opens a patient's medical record on a video call we record it here. Patients view their own records freely — those don't generate audit entries."
        actions={
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
        }
      />

      <div className="fade-up fade-up-delay-1 rounded-xl border border-sage/30 bg-sage/10 p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed">
          Audit logging runs on every doctor record view automatically. There's
          nothing to enable — it's just here so you can review who accessed
          what and when.
        </p>
      </div>

      <section className="fade-up fade-up-delay-2 rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <Loading />
        ) : entries.length === 0 ? (
          <Empty />
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {pageItems.map((e, i) => (
                <li
                  key={`${e.viewedAt}-${i}`}
                  className="flex flex-wrap items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        Dr {e.viewer?.name || '—'}
                      </span>{' '}
                      <span className="text-muted-foreground">viewed</span>{' '}
                      <span className="font-medium">
                        {e.patient?.name || '—'}
                      </span>
                      <span className="text-muted-foreground">'s record</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                      {format(new Date(e.viewedAt), "EEE, MMM d, yyyy · h:mm:ss a")}
                    </p>
                  </div>
                  {e.viewer?.specialty && (
                    <StatusBadge tone="outline">{e.viewer.specialty}</StatusBadge>
                  )}
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
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <ScrollText className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No record views yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Entries appear here when doctors open patient records on a call.
    </p>
  </div>
)

export default AuditLogPage
