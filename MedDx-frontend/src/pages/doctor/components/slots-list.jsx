import { useMemo, useState } from 'react'
import { format, isSameDay, isToday, isTomorrow } from 'date-fns'
import { CalendarX, Clock4, RefreshCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

import { useDeleteSlot, useMySlots } from '@/apis'

const dayHeading = (date) => {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE, MMM d')
}

const SlotsList = () => {
  const { slots, isLoading, isFetching, refetch } = useMySlots()
  const { deleteSlot } = useDeleteSlot()
  const [confirm, setConfirm] = useState(null)

  const now = Date.now()
  const visible = useMemo(
    () =>
      slots
        .filter((s) => new Date(s.datetime).getTime() >= now - 30 * 60 * 1000)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [slots, now],
  )

  const groups = useMemo(() => {
    const acc = []
    visible.forEach((s) => {
      const d = new Date(s.datetime)
      const last = acc[acc.length - 1]
      if (last && isSameDay(new Date(last.date), d)) {
        last.slots.push(s)
      } else {
        acc.push({ date: d, slots: [s] })
      }
    })
    return acc
  }, [visible])

  return (
    <section className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock4 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight leading-none">
              Upcoming availability
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {visible.length} upcoming slot{visible.length === 1 ? '' : 's'}{' '}
              across {groups.length} day{groups.length === 1 ? '' : 's'}
            </p>
          </div>
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
      ) : visible.length === 0 ? (
        <Empty />
      ) : (
        <div className="divide-y divide-border/60">
          {groups.map((g) => (
            <DayGroup
              key={g.date.toISOString()}
              date={g.date}
              slots={g.slots}
              onAskDelete={setConfirm}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(confirm)}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this slot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm && (
                <>
                  {format(new Date(confirm.datetime), "EEE, MMM d 'at' h:mm a")}{' '}
                  will be removed from your availability. Patients won't be
                  able to book it.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                deleteSlot({ id: confirm._id })
                setConfirm(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

const DayGroup = ({ date, slots, onAskDelete }) => {
  const total = slots.length
  const booked = slots.filter((s) => s.status === 'booked').length
  const utilization = total ? Math.round((booked / total) * 100) : 0
  const heading = dayHeading(date)

  return (
    <div className="px-6 py-5">
      {/* Day header with mini utilization meter */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-xl tracking-tight">{heading}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Utilization
            </p>
            <p className="font-display text-sm font-semibold tabular-nums">
              {booked}/{total} · {utilization}%
            </p>
          </div>
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-primary/40 rounded-full transition-all"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slot tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {slots.map((s) => (
          <SlotTile key={s._id} slot={s} onAskDelete={onAskDelete} />
        ))}
      </div>
    </div>
  )
}

const SlotTile = ({ slot, onAskDelete }) => {
  const time = format(new Date(slot.datetime), 'h:mm a')
  const isBooked = slot.status === 'booked'
  return (
    <div
      className={`group relative rounded-xl border px-3 py-3 transition-all overflow-hidden ${
        isBooked
          ? 'border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 text-primary'
          : 'border-sage/30 bg-linear-to-br from-sage/10 to-transparent hover:from-sage/15 hover:to-sage/5'
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.18em] font-semibold opacity-70">
          {isBooked ? 'Booked' : 'Open'}
        </span>
        <span className="font-display text-base font-semibold tabular-nums leading-none">
          {time}
        </span>
      </div>
      {/* Decorative dot pattern for booked tiles */}
      {isBooked && (
        <span
          className="absolute -right-3 -bottom-3 inline-flex h-12 w-12 rounded-full bg-primary/20 blur-xl"
          aria-hidden
        />
      )}
      {!isBooked && (
        <button
          type="button"
          onClick={() => onAskDelete(slot)}
          aria-label="Delete slot"
          className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:border-destructive/40 shadow-sm"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

const Loading = () => (
  <div className="px-6 py-10 space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-9 rounded-xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="px-6 py-16 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <CalendarX className="h-6 w-6" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No upcoming slots
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
      Open a window above to start taking bookings. We'll split your range
      into clean 30-minute appointments.
    </p>
  </div>
)

export default SlotsList
