import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const pad = (n) => String(n).padStart(2, '0')

const hhmmToMins = (s) => {
  const [h, m] = (s || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
const minsToHHMM = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`

const formatLabel = (hhmm) => {
  const mins = hhmmToMins(hhmm)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${pad(m)} ${period}`
}

const clamp = (mins, min, max) => Math.max(min, Math.min(max, mins))

/**
 * Minute-precision time picker (e.g. 4:45 PM, 5:54 PM).
 *
 * Props:
 *   value           — "HH:mm" 24-hour string
 *   onChange(value) — fires with clamped "HH:mm"
 *   minMins         — earliest allowed time in minutes from midnight (default 0)
 *   maxMins         — latest allowed time in minutes from midnight (default 24*60-1)
 *   placeholder     — shown when value falls outside the allowed range
 */
const TimePicker = ({
  value,
  onChange,
  ariaLabel,
  minMins = 0,
  maxMins = 24 * 60 - 1,
  placeholder = 'Pick a time',
  disabled = false,
}) => {
  const totalMins = clamp(hhmmToMins(value), 0, 24 * 60 - 1)
  const inRange = totalMins >= minMins && totalMins <= maxMins
  const h24 = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24

  // Local string state for the inputs so the user can type partial values
  // (e.g. "4" before "45") without us instantly reformatting them.
  const [hourStr, setHourStr] = useState(String(h12))
  const [minStr, setMinStr] = useState(pad(m))

  useEffect(() => {
    setHourStr(String(h12))
    setMinStr(pad(m))
  }, [h12, m])

  const emit = (newH12, newM, newPeriod) => {
    let h24new = newH12 % 12
    if (newPeriod === 'PM') h24new += 12
    const mins = clamp(h24new * 60 + newM, minMins, maxMins)
    onChange(minsToHHMM(mins))
  }

  const commitHour = () => {
    let n = parseInt(hourStr, 10)
    if (Number.isNaN(n)) n = h12
    n = Math.min(12, Math.max(1, n))
    setHourStr(String(n))
    emit(n, m, period)
  }
  const commitMinute = () => {
    let n = parseInt(minStr, 10)
    if (Number.isNaN(n)) n = m
    n = Math.min(59, Math.max(0, n))
    setMinStr(pad(n))
    emit(h12, n, period)
  }

  const setPeriod = (p) => {
    emit(h12, m, p)
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className="h-11 w-full justify-start rounded-xl bg-card font-normal"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="tabular-nums">
            {inRange ? formatLabel(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Hour
            </label>
            <Input
              type="number"
              min={1}
              max={12}
              value={hourStr}
              onChange={(e) => setHourStr(e.target.value)}
              onBlur={commitHour}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitHour()
                }
              }}
              className="h-11 w-16 text-center text-base tabular-nums rounded-xl"
            />
          </div>

          <span className="pb-3 text-xl font-semibold text-muted-foreground">
            :
          </span>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Min
            </label>
            <Input
              type="number"
              min={0}
              max={59}
              value={minStr}
              onChange={(e) => setMinStr(e.target.value)}
              onBlur={commitMinute}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitMinute()
                }
              }}
              className="h-11 w-16 text-center text-base tabular-nums rounded-xl"
            />
          </div>

          <div className="ml-1 space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Period
            </label>
            <div className="flex flex-col gap-1">
              {['AM', 'PM'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'h-5 rounded-md px-2 text-[11px] font-semibold tracking-wide transition-colors border',
                    p === period
                      ? 'bg-clinic text-clinic-foreground border-clinic'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground">
          Tip: tap into the field and type any minute — e.g. 4:45 PM.
        </p>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker
