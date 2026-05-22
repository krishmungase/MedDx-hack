import { useDispatch } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'

import { useAuth } from '@/hooks'
import { logout } from '@/store'
import { Mark } from '@/components/shared/logo'
import LanguageSwitcher from '@/components/shared/language-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

/**
 * Generic role-aware dashboard sidebar shell.
 *
 * consoleItems / futureItems entries:
 *   { id, label, icon, to?, end?, soon? }
 *
 *   - `to`     navigates via NavLink and auto-sets isActive (preferred)
 *   - `end`    pass true on the index/home item so it doesn't stay "active"
 *              for every nested route
 *   - `soon`   marks the item as disabled (renders the phase chip on the right)
 */
const RoleSidebar = ({
  eyebrow,
  consoleLabel = 'Console',
  consoleItems = [],
  futureLabel = 'Coming up',
  futureItems = [],
  showLanguage = false,
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const onLogout = () => {
    dispatch(logout())
    navigate('/auth/sign-in', { replace: true })
  }

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r border-border/60"
    >
      <SidebarHeader className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-2.5 px-1">
          <Mark className="h-8 w-8 shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-display text-base leading-none tracking-tight">
              MedDx<span className="text-primary">.</span>
            </p>
            {eyebrow && (
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-3">
        {consoleItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
              {consoleLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {consoleItems.map((item) => {
                  const Icon = item.icon

                  // NavLink path — preferred
                  if (item.to) {
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            item.end
                              ? location.pathname === item.to
                              : location.pathname === item.to ||
                                location.pathname.startsWith(item.to + '/')
                          }
                          className="h-9 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                        >
                          <NavLink to={item.to} end={item.end}>
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  // Static (non-nav) — kept for forwards compat
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={Boolean(item.active)}
                        className="h-9 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {futureItems.length > 0 && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
              {futureLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {futureItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        disabled
                        className="h-9 rounded-lg opacity-60 cursor-not-allowed"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="flex-1">{item.label}</span>
                        <span className="ml-auto text-[9px] uppercase tracking-[0.14em] text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
                          {item.soon}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3 space-y-2">
        {showLanguage && <LanguageSwitcher />}
        <div className="flex items-center gap-2.5 rounded-lg bg-card/60 p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
            {initials}
          </span>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default RoleSidebar
