import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Plus } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Spinner } from '@/components/ui/spinner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { errorToast } from '@/lib'
import { useGenerateSlots } from '@/apis'

// Build a Date in the user's local timezone from a YYYY-MM-DD date and HH:mm.
const combine = (date, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

// Generate 30-min increments across the full day, formatted for display.
const buildTimeOptions = () => {
  const opts = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const label = `${h12}:${String(m).padStart(2, '0')} ${period}`
      opts.push({ value, label })
    }
  }
  return opts
}

const TimeSelect = ({ value, onChange, ariaLabel }) => {
  const options = useMemo(buildTimeOptions, [])
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl bg-card border-border data-[size=default]:h-11 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
      >
        <SelectValue>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="tabular-nums">
            {options.find((o) => o.value === value)?.label || 'Pick a time'}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="tabular-nums">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const AddAvailabilityCard = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86_400_000)

  const [date, setDate] = useState(tomorrow)
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('12:00')
  const [open, setOpen] = useState(false)

  const { isLoading, generateSlots } = useGenerateSlots()

  // Preview count (does NOT include conflict check)
  const preview = (() => {
    if (!date || !start || !end) return null
    const s = combine(date, start)
    const e = combine(date, end)
    if (!(e > s)) return null
    return Math.floor((e - s) / (30 * 60 * 1000))
  })()

  const onSubmit = (e) => {
    e.preventDefault()
    if (!date) return errorToast({ message: 'Pick a date.' })
    const s = combine(date, start)
    const en = combine(date, end)
    if (!(en > s)) return errorToast({ message: 'End must be after start.' })
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
        Pick a date and a time range — we'll split it into clean 30-minute
        slots.
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
          <TimeSelect
            ariaLabel="Start time"
            value={start}
            onChange={setStart}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            End
          </label>
          <TimeSelect ariaLabel="End time" value={end} onChange={setEnd} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {preview != null && preview > 0 ? (
            <>
              This will create{' '}
              <span className="font-semibold text-foreground">{preview}</span>{' '}
              slot{preview === 1 ? '' : 's'} of 30 minutes each.
            </>
          ) : (
            <>Pick a valid range to preview slots.</>
          )}
        </p>
        <Button
          type="submit"
          disabled={isLoading || !preview}
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
