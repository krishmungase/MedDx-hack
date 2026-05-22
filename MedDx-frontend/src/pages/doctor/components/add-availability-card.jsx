import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock4, Plus, Sparkles, Zap } from 'lucide-react'
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
const MAX_MINS = 24 * 60 - 1

const hhmmToMins = (s) => {
  const [h, m] = (s || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const pad = (n) => String(n).padStart(2, '0')

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
    [today],
  )

  const [date, setDate] = useState(tomorrow)
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('12:00')
  const [open, setOpen] = useState(false)

  const { isLoading, generateSlots } = useGenerateSlots()

  const isTodaySelected = date ? isSameDay(date, new Date()) : false
  const minStartMins = useMemo(() => {
    if (!isTodaySelected) return 0
    const now = new Date()
    return Math.min(MAX_MINS, now.getHours() * 60 + now.getMinutes() + 5)
  }, [isTodaySelected, date])

  const startMins = hhmmToMins(start)
  const minEndMins = Math.min(MAX_MINS, startMins + SLOT_MINUTES)

  useEffect(() => {
    if (startMins < minStartMins) {
      const newStartMins = Math.min(MAX_MINS - SLOT_MINUTES, minStartMins)
      setStart(
        `${pad(Math.floor(newStartMins / 60))}:${pad(newStartMins % 60)}`,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minStartMins])

  useEffect(() => {
    const endMins = hhmmToMins(end)
    if (endMins < minEndMins) {
      const newEndMins = Math.min(MAX_MINS, startMins + 2 * 60)
      setEnd(`${pad(Math.floor(newEndMins / 60))}:${pad(newEndMins % 60)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start])

  const endMins = hhmmToMins(end)
  const rangeMins = endMins - startMins
  const preview =
    rangeMins >= SLOT_MINUTES ? Math.floor(rangeMins / SLOT_MINUTES) : 0
  const trailingMins = rangeMins > 0 ? rangeMins - preview * SLOT_MINUTES : 0

  const noTimeLeftToday =
    isTodaySelected && minStartMins >= MAX_MINS - SLOT_MINUTES

  // Preset shortcuts — quick chips for common windows
  const presets = [
    { label: 'Morning', start: '09:00', end: '12:00' },
    { label: 'Afternoon', start: '14:00', end: '17:00' },
    { label: 'Evening', start: '17:00', end: '20:00' },
  ]
  const applyPreset = (p) => {
    setStart(p.start)
    setEnd(p.end)
  }

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
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
    >
      {/* Top accent strip */}
      <span
        className="absolute left-0 top-0 right-0 h-1 bg-linear-to-r from-primary via-sage to-primary/40"
        aria-hidden
      />

      <div className="p-6 sm:p-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left — form */}
        <div className="space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <CalendarDays className="h-3 w-3" />
              Add availability
            </span>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl tracking-tight">
              Open a window for{' '}
              <span className="italic text-primary">patients to book.</span>
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-lg">
              Pick a date and a time range with minute precision — we'll split
              it into 30-minute slots starting from your chosen time.
            </p>
          </div>

          {/* Preset chips */}
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Quick presets
            </p>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Zap className="h-3 w-3" />
                {p.label}
                <span className="text-muted-foreground tabular-nums">
                  {p.start}–{p.end}
                </span>
              </button>
            ))}
          </div>

          {/* Date + time fields */}
          <div className="grid sm:grid-cols-[1.2fr_1fr_1fr] gap-3">
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

          {/* Footer note + submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              {noTimeLeftToday ? (
                <>No time left today — pick a future date.</>
              ) : preview > 0 ? (
                <>
                  This will create{' '}
                  <span className="font-semibold text-foreground">
                    {preview}
                  </span>{' '}
                  slot{preview === 1 ? '' : 's'} of 30 minutes each
                  {trailingMins > 0 && (
                    <>
                      {' '}
                      <span className="text-muted-foreground/70">
                        (last {trailingMins} min not used)
                      </span>
                    </>
                  )}
                  .
                </>
              ) : (
                <>Pick a valid range to preview slots.</>
              )}
            </p>
            <Button
              type="submit"
              disabled={isLoading || preview === 0 || noTimeLeftToday}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 shadow-md shadow-primary/20"
            >
              {isLoading ? <Spinner /> : <Plus className="h-4 w-4" />}
              Add {preview > 0 ? `${preview} ` : ''}slot{preview === 1 ? '' : 's'}
            </Button>
          </div>
        </div>

        {/* Right — preview card */}
        <aside className="rounded-2xl border border-border/60 bg-soft-mesh p-5 space-y-3 hidden lg:block">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold">
              Preview
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Date
            </p>
            <p className="font-display text-lg tracking-tight mt-0.5">
              {date ? format(date, 'EEE, MMM d') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Window
            </p>
            <p className="font-mono text-base tabular-nums tracking-tight mt-0.5">
              {start} → {end}
            </p>
          </div>
          <div className="rounded-xl bg-primary/8 border border-primary/15 p-3 flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <Clock4 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl tracking-tight tabular-nums leading-none">
                {preview}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                slot{preview === 1 ? '' : 's'} of 30 min
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

export default AddAvailabilityCard
