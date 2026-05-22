import { cn } from '@/lib/utils'

const TONES = {
  primary:
    'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
  sage:
    'bg-sage/15 text-sage-foreground ring-1 ring-inset ring-sage/30',
  amber:
    'bg-amber-warm/15 text-amber-warm ring-1 ring-inset ring-amber-warm/30',
  destructive:
    'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25',
  muted:
    'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
  outline:
    'bg-transparent text-foreground ring-1 ring-inset ring-border',
}

/**
 * Compact pill for status/role/category labels. Calm by default, with semantic
 * tone variants that share a consistent ring + text-tone language so the eye
 * can scan a list quickly.
 */
const StatusBadge = ({
  tone = 'muted',
  icon: Icon,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium',
        TONES[tone] || TONES.muted,
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </span>
  )
}

export default StatusBadge
