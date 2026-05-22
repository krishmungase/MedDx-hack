import { cn } from '@/lib/utils'

const SIZE = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl',
}

const RING = {
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-[3px]',
  xl: 'ring-4',
}

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'DR'

/**
 * Doctor / patient avatar — gradient initials medallion with optional online dot
 * and specialty stripe. Healthcare-first treatment, not a generic avatar.
 *
 * Props:
 *   name        — to derive initials
 *   size        — sm | md | lg | xl
 *   online      — show a pulsing online indicator
 *   tone        — primary (blue) | sage (green)
 *   showRing    — outer ring (true by default at md+)
 */
const DoctorAvatar = ({
  name,
  size = 'md',
  online = false,
  tone = 'primary',
  showRing = true,
  className,
}) => {
  const initials = initialsOf(name)
  const gradient =
    tone === 'sage'
      ? 'from-sage/40 via-sage/20 to-primary/15'
      : 'from-primary/30 via-primary/15 to-sage/15'
  const textColor = tone === 'sage' ? 'text-sage-foreground' : 'text-primary'
  const ringColor = tone === 'sage' ? 'ring-sage/20' : 'ring-primary/15'

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold tracking-tight',
          'bg-linear-to-br',
          gradient,
          textColor,
          SIZE[size],
          showRing && cn(RING[size], ringColor, 'ring-offset-2 ring-offset-card'),
        )}
        aria-hidden
      >
        {initials}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 inline-flex h-3 w-3 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </span>
      )}
    </span>
  )
}

export default DoctorAvatar
