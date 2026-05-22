import { cn } from '@/lib/utils'

const TONE_STYLES = {
  primary: {
    iconWrap: 'bg-primary/10 text-primary',
    accent: 'text-primary',
  },
  sage: {
    iconWrap: 'bg-sage/15 text-sage-foreground',
    accent: 'text-sage-foreground',
  },
  amber: {
    iconWrap: 'bg-amber-warm/15 text-amber-warm',
    accent: 'text-amber-warm',
  },
  destructive: {
    iconWrap: 'bg-destructive/10 text-destructive',
    accent: 'text-destructive',
  },
  muted: {
    iconWrap: 'bg-muted text-muted-foreground',
    accent: 'text-foreground',
  },
}

/**
 * Calm, modern dashboard stat card with an icon, label, value, and optional delta.
 *
 * Props:
 *   icon     — lucide icon component
 *   label    — small caption above the value
 *   value    — primary metric (string or node)
 *   hint     — secondary descriptor under the value (optional)
 *   tone     — primary | sage | amber | destructive | muted (default primary)
 *   trend    — optional { value, direction: 'up'|'down'|'flat', label } meta
 *   className
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  trend,
  className,
}) => {
  const t = TONE_STYLES[tone] || TONE_STYLES.primary

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5',
        'transition-colors hover:border-primary/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl md:text-3xl tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              t.iconWrap,
            )}
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {trend && (
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            trend.direction === 'down'
              ? 'text-destructive'
              : trend.direction === 'flat'
                ? 'text-muted-foreground'
                : t.accent,
          )}
        >
          <span aria-hidden>
            {trend.direction === 'down'
              ? '↓'
              : trend.direction === 'flat'
                ? '→'
                : '↑'}
          </span>
          {trend.value}
          {trend.label && (
            <span className="ml-1 font-normal text-muted-foreground">
              {trend.label}
            </span>
          )}
        </p>
      )}
    </div>
  )
}

export default StatCard
