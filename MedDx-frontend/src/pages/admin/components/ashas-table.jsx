import { useMemo, useState } from 'react'
import {
  HeartHandshake,
  MapPin,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataPagination, StatusBadge } from '@/components'

import {
  useAshas,
  useRemoveAsha,
  useUpdateAshaStatus,
} from '@/apis'

const STATUS_TONE = {
  active: 'sage',
  pending_setup: 'amber',
  suspended: 'destructive',
}
const STATUS_LABEL = {
  active: 'Active',
  pending_setup: 'Pending setup',
  suspended: 'Suspended',
}

const PAGE_SIZE = 8

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'

const AshasTable = () => {
  const { ashas, isLoading, isFetching, refetch } = useAshas()
  const { updateAshaStatus } = useUpdateAshaStatus()
  const { removeAsha } = useRemoveAsha()

  const [confirmRemove, setConfirmRemove] = useState(null)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ashas
    return ashas.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.village?.toLowerCase().includes(q) ||
        a.ashaIdNumber?.toLowerCase().includes(q),
    )
  }, [ashas, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-clinic/5 to-transparent">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-clinic/10 text-clinic">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight leading-none">
              ASHA workers on MedDx
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'worker' : 'workers'}
              {query && (
                <>
                  {' '}
                  matching <span className="text-clinic">"{query}"</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, village, ID…"
              aria-label="Search ASHAs"
              className="h-9 pl-9 w-56 rounded-full bg-background"
            />
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
        </div>
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : ashas.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <NoMatch />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    ASHA worker
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Village
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    ASHA ID
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Language
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Joined
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((a) => (
                  <TableRow
                    key={a._id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clinic/15 text-clinic text-xs font-semibold shrink-0">
                          {initials(a.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {a.village || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {a.ashaIdNumber || '—'}
                    </TableCell>
                    <TableCell className="text-sm uppercase tracking-wide text-muted-foreground">
                      {a.language || 'hi'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={STATUS_TONE[a.accountStatus] || 'muted'}
                      >
                        {STATUS_LABEL[a.accountStatus] || a.accountStatus}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(a.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {a.accountStatus === 'suspended' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateAshaStatus({
                                  id: a._id,
                                  accountStatus: 'active',
                                })
                              }
                            >
                              <Play className="h-3.5 w-3.5" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              disabled={a.accountStatus === 'pending_setup'}
                              onClick={() =>
                                updateAshaStatus({
                                  id: a._id,
                                  accountStatus: 'suspended',
                                })
                              }
                            >
                              <Pause className="h-3.5 w-3.5" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirmRemove(a)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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

      <AlertDialog
        open={Boolean(confirmRemove)}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove {confirmRemove?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the ASHA account. Villager profiles and
              past appointments she booked are kept on file. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                removeAsha({ id: confirmRemove._id })
                setConfirmRemove(null)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const LoadingRows = () => (
  <div className="p-6 space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-1/4 rounded bg-muted/70 animate-pulse" />
        </div>
        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>
    ))}
  </div>
)

const EmptyState = () => (
  <div className="px-6 py-16 text-center">
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <Users className="h-7 w-7" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No ASHA workers yet
    </h3>
    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
      Register your first community health worker. They bring care to villagers
      who don't have smartphones.
    </p>
  </div>
)

const NoMatch = () => (
  <div className="px-6 py-12 text-center">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Search className="h-5 w-5" />
    </span>
    <p className="mt-3 text-sm text-muted-foreground">
      No ASHAs match this search.
    </p>
  </div>
)

export default AshasTable
