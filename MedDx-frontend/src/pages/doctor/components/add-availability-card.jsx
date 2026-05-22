import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { format, isSameDay } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Spinner } from '@/components/ui/spinner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import TimePicker from '@/components/shared/time-picker'

import { errorToast } from '@/lib'
import { useGenerateSlots } from '@/apis'

const SLOT_MINUTES = 30
const MAX_MINS = 24 * 60 - 1 // 23:59 — latest end-of-day we let doctors pick

const hhmmToMins = (s) => {
  const [h, m] = (s || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const pad = (n) => String(n).padStart(2, '0')

// Combine a date + "HH:mm" into a local Date.
const combine = (date, hhmm) => {
  const mins = hhmmToMins(hhmm)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return new Date(d.getTime() + mins * 60 * 1000)
}

const AddAvailabilityCard = () => {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])
  const tomorrow = useMemo(
    () => new Date(today.getTime() + 86_400_000),
    [today]
  )

  const [date, setDate] = useState(tomorrow)
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('12:00')
  const [open, setOpen] = useState(false)

  const { isLoading, generateSlots } = useGenerateSlots()

  // Earliest valid Start on the selected date. For "today" we clamp to a few
  // minutes from now so doctors can't open slots that are already happening
  // (backend enforces this independently too).
  const isTodaySelected = date ? isSameDay(date, new Date()) : false
  const minStartMins = useMemo(() => {
    if (!isTodaySelected) return 0
    const now = new Date()
    return Math.min(MAX_MINS, now.getHours() * 60 + now.getMinutes() + 5)
  }, [isTodaySelected, date])

  // End must be strictly after Start, and the range must fit at least one
  // 30-min slot.
  const startMins = hhmmToMins(start)
  const minEndMins = Math.min(MAX_MINS, startMins + SLOT_MINUTES)

  // Snap Start forward when the selected date pushes minStartMins past it.
  useEffect(() => {
    if (startMins < minStartMins) {
      const newStartMins = Math.min(MAX_MINS - SLOT_MINUTES, minStartMins)
      setStart(`${pad(Math.floor(newStartMins / 60))}:${pad(newStartMins % 60)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minStartMins])

  // Bump End forward when Start moves past it.
  useEffect(() => {
    const endMins = hhmmToMins(end)
    if (endMins < minEndMins) {
      const newEndMins = Math.min(MAX_MINS, startMins + 2 * 60)
      setEnd(`${pad(Math.floor(newEndMins / 60))}:${pad(newEndMins % 60)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start])

  // Preview count of 30-min slots — partial trailing time is dropped.
  const endMins = hhmmToMins(end)
  const rangeMins = endMins - startMins
  const preview = rangeMins >= SLOT_MINUTES ? Math.floor(rangeMins / SLOT_MINUTES) : 0
  const trailingMins = rangeMins > 0 ? rangeMins - preview * SLOT_MINUTES : 0

  const noTimeLeftToday = isTodaySelected && minStartMins >= MAX_MINS - SLOT_MINUTES

  const onSubmit = (e) => {
    e.preventDefault()
    if (!date) return errorToast({ message: 'Pick a date.' })
    if (rangeMins < SLOT_MINUTES) {
      return errorToast({ message: 'Window must be at least 30 minutes.' })
    }
    const s = combine(date, start)
    const en = combine(date, end)
    if (s.getTime() < Date.now()) {
      return errorToast({ message: 'Start time must be in the future.' })
    }
    generateSlots({
      data: {
        startDateTime: s.toISOString(),
        endDateTime: en.toISOString(),
      },
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/70 bg-card p-6 md:p-7"
    >
      <div className="flex items-center gap-2 text-clinic">
        <CalendarDays className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.16em] font-semibold">
          Add availability
        </span>
      </div>
      <h2 className="mt-3 font-display text-2xl tracking-tight">
        Open a window for patients to book.
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pick a date and a time range with minute precision — we'll split it
        into 30-minute slots starting from your chosen time.
      </p>

      <div className="mt-6 grid sm:grid-cols-[1.2fr_1fr_1fr] gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            Date
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full justify-start rounded-xl bg-card font-normal"
              >
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {date ? format(date, 'EEE, MMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (!d) return
                  setDate(d)
                  setOpen(false)
                }}
                disabled={(d) => d < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            Start
          </label>
          <TimePicker
            ariaLabel="Start time"
            value={start}
            onChange={setStart}
            minMins={minStartMins}
            maxMins={MAX_MINS - SLOT_MINUTES}
            disabled={noTimeLeftToday}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            End
          </label>
          <TimePicker
            ariaLabel="End time"
            value={end}
            onChange={setEnd}
            minMins={minEndMins}
            maxMins={MAX_MINS}
            disabled={noTimeLeftToday}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {noTimeLeftToday ? (
            <>No time left today — pick a future date.</>
          ) : preview > 0 ? (
            <>
              This will create{' '}
              <span className="font-semibold text-foreground">{preview}</span>{' '}
              slot{preview === 1 ? '' : 's'} of 30 minutes each
              {trailingMins > 0 ? (
                <>
                  {' '}
                  <span className="text-muted-foreground">
                    (last {trailingMins} min not used)
                  </span>
                </>
              ) : null}
              .
            </>
          ) : (
            <>Pick a valid range to preview slots.</>
          )}
        </p>
        <Button
          type="submit"
          disabled={isLoading || preview === 0 || noTimeLeftToday}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6"
        >
          {isLoading ? <Spinner /> : <Plus className="h-4 w-4" />}
          Add slots
        </Button>
      </div>
    </form>
  )
}

export default AddAvailabilityCard
