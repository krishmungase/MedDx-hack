import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * Star rating. Renders 1..max stars; supports two modes:
 *   - interactive (`onChange` provided): click + hover preview, returns 1..max
 *   - read-only (no `onChange`): just renders `value` filled stars
 */
const StarRating = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const [hover, setHover] = useState(0)
  const interactive = Boolean(onChange)
  const display = interactive && hover ? hover : value

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10 sm:h-12 sm:w-12',
  }[size] || 'h-6 w-6'

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={interactive ? () => setHover(0) : undefined}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1
        const filled = n <= display
        const StarBtn = interactive ? 'button' : 'span'
        return (
          <StarBtn
            key={n}
            {...(interactive
              ? {
                  type: 'button',
                  onClick: () => onChange(n),
                  onMouseEnter: () => setHover(n),
                  'aria-label': `${n} star${n === 1 ? '' : 's'}`,
                  className:
                    'transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md',
                }
              : { className: 'inline-flex' })}
          >
            <Star
              className={`${sizeClasses} transition-colors ${
                filled
                  ? 'fill-amber-warm text-amber-warm'
                  : 'fill-transparent text-muted-foreground/40'
              }`}
              strokeWidth={1.5}
            />
          </StarBtn>
        )
      })}
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-medium text-muted-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarRating
