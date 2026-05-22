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
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#specialists"
              className="hover:text-foreground transition-colors"
            >
              Specialists
            </a>
            <a href="#trust" className="hover:text-foreground transition-colors">
              Why MedDx
            </a>
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
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
