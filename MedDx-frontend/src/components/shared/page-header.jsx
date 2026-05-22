import { cn } from '@/lib/utils'

/**
 * Consistent page header across role dashboards.
 *
 * Props:
 *   eyebrow     — small uppercase label above the title (optional)
 *   title       — main heading (string or node)
 *   description — supporting text under the title (optional)
 *   actions     — node rendered on the right (buttons, toggles, etc.)
 *   className   — wrapper class
 */
const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        'pb-6 border-b border-border/60',
        className,
      )}
    >
      <div className="min-w-0 space-y-2 fade-up">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 fade-up fade-up-delay-1">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
