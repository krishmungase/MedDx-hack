import { format } from 'date-fns'
import { Eye, RefreshCw, ScrollText, ShieldCheck } from 'lucide-react'

import { useAuditLog } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const AuditLogPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { entries, isLoading, isFetching, refetch } = useAuditLog()

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            Audit log.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Every time a doctor opens a patient's medical record on a video
            call we record it here. Patients view their own records freely —
            those don't generate audit entries.
          </p>
        </div>
        <Button
          variant="ghost"
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
      </div>

      <div className="fade-up fade-up-delay-1 rounded-xl border border-sage/30 bg-sage/10 p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-clinic mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed">
          Audit logging runs on every doctor record view automatically. There's
          nothing to enable — it's just here so you can review who accessed
          what and when.
        </p>
      </div>

      <section className="fade-up fade-up-delay-2 rounded-2xl border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : entries.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border/60">
            {entries.map((e, i) => (
              <li
                key={`${e.viewedAt}-${i}`}
                className="flex flex-wrap items-center gap-4 px-6 py-3"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
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
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] uppercase tracking-[0.12em]"
                  >
                    {e.viewer.specialty}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
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
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
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
