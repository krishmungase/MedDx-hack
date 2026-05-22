import { useMemo, useState } from 'react'
import { format, isSameDay, isToday, isTomorrow } from 'date-fns'
import { CalendarX, RefreshCw, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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

const STATUS_TONE = {
  available: 'bg-sage/15 text-sage-foreground border-sage/30',
  booked: 'bg-clinic/10 text-clinic border-clinic/25',
}
const STATUS_LABEL = {
  available: 'Available',
  booked: 'Booked',
}

const dayHeading = (date) => {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE, MMM d')
}

const SlotsList = () => {
  const { slots, isLoading, isFetching, refetch } = useMySlots()
  const { deleteSlot } = useDeleteSlot()
  const [confirm, setConfirm] = useState(null)

  // Hide past slots from the listing UI — they're noise after the day passes.
  const now = Date.now()
  const visible = useMemo(
    () =>
      slots
        .filter((s) => new Date(s.datetime).getTime() >= now - 30 * 60 * 1000)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [slots, now]
  )

  // Group by calendar day
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
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/70">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Upcoming availability
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {visible.length} upcoming slot{visible.length === 1 ? '' : 's'}
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
      ) : visible.length === 0 ? (
        <Empty />
      ) : (
        <div className="divide-y divide-border/70">
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

      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
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
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
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

const DayGroup = ({ date, slots, onAskDelete }) => (
  <div className="px-6 py-5">
    <div className="flex items-baseline gap-3 mb-4">
      <p className="font-display text-lg tracking-tight">{dayHeading(date)}</p>
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {format(date, 'MMMM d, yyyy')}
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
      {slots.map((s) => (
        <SlotTile key={s._id} slot={s} onAskDelete={onAskDelete} />
      ))}
    </div>
  </div>
)

const SlotTile = ({ slot, onAskDelete }) => {
  const time = format(new Date(slot.datetime), 'h:mm a')
  const isBooked = slot.status === 'booked'
  return (
    <div
      className={`group relative rounded-xl border px-3 py-2.5 transition-colors ${
        isBooked
          ? 'border-clinic/25 bg-clinic/5'
          : 'border-border bg-card hover:border-clinic/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm tabular-nums">{time}</span>
        <Badge
          variant="outline"
          className={`rounded-full border text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[slot.status] || ''}`}
        >
          {STATUS_LABEL[slot.status] || slot.status}
        </Badge>
      </div>
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
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <CalendarX className="h-6 w-6" />
    </span>
    <h3 className="mt-5 font-display text-xl tracking-tight">
      No upcoming slots
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Open a window above to start taking bookings. We'll split your range
      into clean 30-minute appointments.
    </p>
  </div>
)

export default SlotsList
