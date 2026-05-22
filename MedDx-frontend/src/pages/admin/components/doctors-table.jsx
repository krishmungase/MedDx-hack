import { useMemo, useState } from 'react'
import {
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Stethoscope,
  Trash2,
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

const PAGE_SIZE = 10

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

  const totalPages = Math.max(1, Math.ceil(doctors.length / PAGE_SIZE))
  const pageItems = useMemo(
    () => doctors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [doctors, page],
  )

  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Specialists on MedDx
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'}
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
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : doctors.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Doctor
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Specialty
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    License
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Joined
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((d) => (
                  <TableRow key={d._id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.specialty || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {d.licenseNumber || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={STATUS_TONE[d.accountStatus] || 'muted'}>
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
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Stethoscope className="h-6 w-6" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No doctors yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Register your first specialist to get patients seen. They'll receive a
      24-hour link to set their password and join the platform.
    </p>
  </div>
)

export default DoctorsTable
