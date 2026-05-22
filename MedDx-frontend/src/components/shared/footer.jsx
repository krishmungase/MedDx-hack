import { HeartPulse, Stethoscope } from 'lucide-react'

import { Mark } from '@/components/shared/logo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/60 bg-card/40 backdrop-blur-sm">
      {/* Decorative pulse line across the top */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px overflow-hidden">
        <div className="h-full w-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mark className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-tight">
                MedDx<span className="text-primary">.</span>
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                © {currentYear} · Specialist care, anywhere
              </span>
            </div>
          </div>

          {/* Tagline + heartbeat */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            Made for rural India · with care
          </div>

          {/* Mini links */}
          <nav className="flex items-center gap-1 text-xs">
            <FooterLink href="/">Home</FooterLink>
            <Sep />
            <FooterLink href="#trust">Privacy</FooterLink>
            <Sep />
            <FooterLink href="#trust">Terms</FooterLink>
            <Sep />
            <FooterLink href="mailto:care@meddx.in" icon={Stethoscope}>
              Care team
            </FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  )
}

const FooterLink = ({ href, children, icon: Icon }) => (
  <a
    href={href}
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
      text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    {Icon && <Icon className="h-3 w-3" />}
    {children}
  </a>
)

const Sep = () => (
  <span className="text-muted-foreground/40 select-none" aria-hidden>
    ·
  </span>
)

export default Footer
