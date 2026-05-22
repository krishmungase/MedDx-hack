import { useMemo, useState } from 'react'
import {
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  Stethoscope,
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
import { DataPagination, DoctorAvatar, StatusBadge } from '@/components'

import {
  useDoctors,
  useRemoveDoctor,
  useUpdateDoctorStatus,
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

const DoctorsTable = () => {
  const { doctors, isLoading, isFetching, refetch } = useDoctors()
  const { updateDoctorStatus } = useUpdateDoctorStatus()
  const { removeDoctor } = useRemoveDoctor()

  const [confirmRemove, setConfirmRemove] = useState(null)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q),
    )
  }, [doctors, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight leading-none">
              Specialists on MedDx
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'doctor' : 'doctors'}
              {query && (
                <>
                  {' '}
                  matching <span className="text-primary">"{query}"</span>
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
              placeholder="Search name, email, specialty…"
              aria-label="Search doctors"
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
      ) : doctors.length === 0 ? (
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
                    Doctor
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Specialty
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    License
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
                {pageItems.map((d) => (
                  <TableRow
                    key={d._id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <DoctorAvatar name={d.name} size="sm" showRing={false} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            Dr {d.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {d.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.specialty || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {d.licenseNumber || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={STATUS_TONE[d.accountStatus] || 'muted'}
                      >
                        {STATUS_LABEL[d.accountStatus] || d.accountStatus}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(d.createdAt)}
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
                          {d.accountStatus === 'suspended' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                updateDoctorStatus({
                                  id: d._id,
                                  accountStatus: 'active',
                                })
                              }
                            >
                              <Play className="h-3.5 w-3.5" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              disabled={d.accountStatus === 'pending_setup'}
                              onClick={() =>
                                updateDoctorStatus({
                                  id: d._id,
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
                            onClick={() => setConfirmRemove(d)}
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
              This permanently deletes the doctor account and frees any of
              their slots. Past appointments are kept. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                removeDoctor({ id: confirmRemove._id })
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
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Stethoscope className="h-7 w-7" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No doctors yet
    </h3>
    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
      Register your first specialist to get patients seen. They'll receive a
      24-hour link to set their password and join the platform.
    </p>
  </div>
)

const NoMatch = () => (
  <div className="px-6 py-12 text-center">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Search className="h-5 w-5" />
    </span>
    <p className="mt-3 text-sm text-muted-foreground">
      No doctors match this search.
    </p>
  </div>
)

export default DoctorsTable
