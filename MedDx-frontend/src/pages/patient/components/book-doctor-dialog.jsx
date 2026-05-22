import { useMemo, useState } from 'react'
import { format, isSameDay, isToday, isTomorrow } from 'date-fns'
import { CalendarX, Clock, Stethoscope } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useBookAppointment, useDoctorSlots } from '@/apis'

const dayHeading = (date) => {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE, MMM d')
}

const BookDoctorDialog = ({ doctor, open, onOpenChange, onBooked }) => {
  const [selected, setSelected] = useState(null)
  const { slots, isLoading } = useDoctorSlots({
    doctorId: doctor?._id,
    enabled: !!doctor && open,
  })

  const { isLoading: isBooking, bookAppointment } = useBookAppointment({
    onSuccess: (payload) => {
      onBooked?.(payload.appointment)
      onOpenChange(false)
      setSelected(null)
    },
  })

  // Group future + available slots by day.
  const groups = useMemo(() => {
    const now = Date.now()
    const future = (slots || [])
      .filter((s) => new Date(s.datetime).getTime() > now)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    const acc = []
    future.forEach((s) => {
      const d = new Date(s.datetime)
      const last = acc[acc.length - 1]
      if (last && isSameDay(new Date(last.date), d)) last.slots.push(s)
      else acc.push({ date: d, slots: [s] })
    })
    return acc
  }, [slots])

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!isBooking) onOpenChange(o)
        if (!o) setSelected(null)
      }}
    >
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-display text-xl tracking-tight">
                Book {doctor?.name}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                {doctor?.specialty} · pick an open slot below
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-4 border-t border-border/60">
          {isLoading ? (
            <Loading />
          ) : groups.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <div key={g.date.toISOString()}>
                  <div className="flex items-baseline gap-3 mb-2.5">
                    <p className="font-display text-base tracking-tight">
                      {dayHeading(g.date)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {format(g.date, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {g.slots.map((s) => {
                      const time = format(new Date(s.datetime), 'h:mm a')
                      const isSel = selected?._id === s._id
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => setSelected(s)}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-mono tabular-nums transition-colors ${
                            isSel
                              ? 'border-clinic bg-clinic/10 text-clinic font-semibold'
                              : 'border-border bg-card hover:border-clinic/40 hover:bg-clinic/5'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 opacity-70" />
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-card/50">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {selected
                ? `Selected: ${format(new Date(selected.datetime), "EEE, MMM d 'at' h:mm a")}`
                : 'Tap a time to choose.'}
            </p>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={isBooking}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5"
                disabled={!selected || isBooking}
                onClick={() =>
                  bookAppointment({ data: { slotId: selected._id } })
                }
              >
                {isBooking ? <Spinner /> : null}
                Confirm booking
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Loading = () => (
  <div className="space-y-4">
    {[0, 1].map((i) => (
      <div key={i}>
        <div className="h-4 w-32 rounded bg-muted/70 animate-pulse mb-2" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <div
              key={j}
              className="h-10 rounded-xl bg-muted/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const Empty = () => (
  <div className="py-10 text-center">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <CalendarX className="h-5 w-5" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No open slots yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      This doctor hasn't published availability — try another specialist or
      check back soon.
    </p>
  </div>
)

export default BookDoctorDialog
