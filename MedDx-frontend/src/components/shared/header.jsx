import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'
import { LayoutDashboard, LogOut, Stethoscope } from 'lucide-react'

import { useAuth } from '@/hooks'
import { logout } from '@/store'
import { ThemeToggle } from '@/components'
import { Mark } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#specialists', label: 'Specialists' },
  { href: '#trust', label: 'Why MedDx' },
]

const Header = () => {
  const { isAuth, user } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const onAuth = location.pathname.startsWith('/auth')
  const onDashboard =
    isAuth && user?.role && location.pathname.startsWith(`/${user.role}`)

  // Role dashboards own the whole viewport.
  const onRoleDashboard =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/doctor') ||
    location.pathname.startsWith('/patient') ||
    location.pathname.startsWith('/video')
  if (onRoleDashboard) return null

  const onLogout = () => {
    dispatch(logout())
    navigate('/auth/sign-in', { replace: true })
  }

  const isHomePage = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/75 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
            <Mark className="h-5 w-5" />
            {/* tiny online dot */}
            <span
              className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background"
              aria-hidden
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              MedDx<span className="text-primary">.</span>
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Specialist care, anywhere
            </span>
          </span>
        </Link>

        {/* Center nav — only on the landing page */}
        {isHomePage && !onAuth && !onDashboard && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-muted-foreground font-medium
                  transition-colors hover:text-foreground hover:bg-muted/60
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                  focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {isAuth ? (
            <>
              {!onDashboard && user?.role && (
                <Button
                  size="sm"
                  className="rounded-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                  onClick={() => navigate(`/${user.role}`)}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onLogout}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            !onAuth && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-9 hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/auth/sign-in">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                  asChild
                >
                  <Link to="/auth/sign-up">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Get started
                  </Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
