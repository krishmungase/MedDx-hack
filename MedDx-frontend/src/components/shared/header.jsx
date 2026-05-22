import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router'

import { useAuth } from '@/hooks'
import { logout } from '@/store'
import { Logo, ThemeToggle } from '@/components'
import { Button } from '@/components/ui/button'

const Header = () => {
  const { isAuth, user } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const onAuth = location.pathname.startsWith('/auth')
  const onDashboard =
    isAuth && user?.role && location.pathname.startsWith(`/${user.role}`)

  // Role dashboards have their own sidebar shells that brand themselves
  // and provide sign-out. Skip the global header on those routes so the
  // sidebar can own the full viewport.
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        {!onAuth && !onDashboard && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { href: '#how-it-works', label: 'How it works' },
              { href: '#specialists', label: 'Specialists' },
              { href: '#trust', label: 'Why MedDx' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-muted-foreground
                  transition-colors hover:text-foreground hover:bg-accent/60
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuth ? (
            <>
              {!onDashboard && user?.role && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate(`/${user.role}`)}
                >
                  Dashboard
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={onLogout}
              >
                Sign out
              </Button>
            </>
          ) : (
            !onAuth && (
              <>
                <Button size="sm" variant="ghost" className="rounded-full" asChild>
                  <Link to="/auth/sign-in">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  asChild
                >
                  <Link to="/auth/sign-up">Get started</Link>
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
