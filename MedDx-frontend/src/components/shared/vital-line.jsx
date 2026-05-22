import { cn } from '@/lib/utils'

/**
 * Animated ECG/heartbeat line — pure SVG, no deps. Travels with a clip-path so
 * it feels alive, fits any width. Used as decorative motif on healthcare
 * surfaces. Respects prefers-reduced-motion via the index.css guard.
 */
const VitalLine = ({ className, color = 'currentColor' }) => {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 80"
      preserveAspectRatio="none"
      className={cn('w-full h-full', className)}
    >
      <defs>
        <linearGradient id="vital-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="0.4" />
          <stop offset="80%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 L80 40 L100 40 L110 20 L120 60 L135 12 L150 68 L165 40 L240 40 L260 40 L270 28 L285 52 L300 40 L380 40 L400 40 L410 22 L425 58 L440 40 L520 40 L540 40 L550 30 L565 50 L580 40 L600 40"
        fill="none"
        stroke="url(#vital-fade)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle r="3" fill={color}>
        <animateMotion
          dur="6s"
          repeatCount="indefinite"
          path="M0 40 L80 40 L100 40 L110 20 L120 60 L135 12 L150 68 L165 40 L240 40 L260 40 L270 28 L285 52 L300 40 L380 40 L400 40 L410 22 L425 58 L440 40 L520 40 L540 40 L550 30 L565 50 L580 40 L600 40"
        />
      </circle>
    </svg>
  )
}

export default VitalLine
