import { Link } from 'react-router'

const Mark = ({ className = 'h-8 w-8' }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <rect width="64" height="64" rx="14" fill="var(--clinic)" />
    <path
      d="M12 36 L20 36 L24 24 L30 44 L36 30 L40 38 L52 38"
      stroke="var(--sage)"
      strokeWidth="3.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="52" cy="38" r="2.5" fill="var(--amber-warm)" />
  </svg>
)

const Logo = ({ withText = true, size = 'md', linkTo = '/' }) => {
  const dims =
    size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl'

  const content = (
    <div className="flex items-center gap-2.5">
      <Mark className={dims} />
      {withText && (
        <span
          className={`font-display font-semibold tracking-tight leading-none ${textSize} text-foreground`}
        >
          MedDx<span className="text-clinic">.</span>
        </span>
      )}
    </div>
  )

  if (!linkTo) return content
  return (
    <Link to={linkTo} className="inline-flex items-center">
      {content}
    </Link>
  )
}

export { Mark }
export default Logo
