import { useLocation, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

/**
 * Standard chrome for a role dashboard: sidebar + sticky inset header + outlet.
 *
 * Props:
 *   sidebar       — the sidebar element to render (PatientSidebar/DoctorSidebar/etc.)
 *   eyebrow       — small label in the header breadcrumb (e.g. "Doctor · Workspace")
 *   sections      — map of pathname → display label, used to render the right side
 *                   of the breadcrumb based on the current URL.
 *   headerExtra   — optional node rendered on the right side of the header
 *                   (e.g. admin's "Register doctor" action).
 */
const RoleShell = ({ sidebar, eyebrow, sections = {}, headerExtra = null }) => {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const rawSection = sections[pathname] || ''
  const section = rawSection
    ? t(rawSection, { defaultValue: rawSection })
    : ''
  const eyebrowText = eyebrow ? t(eyebrow, { defaultValue: eyebrow }) : ''

  return (
    <SidebarProvider
      defaultOpen
      style={{ '--sidebar-width': '17rem', '--sidebar-width-icon': '3.25rem' }}
    >
      {sidebar}

      <SidebarInset className="bg-grain">
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-3
            border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6"
        >
          <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-accent" />
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            {eyebrowText && (
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                {eyebrowText}
              </span>
            )}
            {section && (
              <>
                <ChevronRight
                  className="h-3.5 w-3.5 text-muted-foreground/60"
                  aria-hidden
                />
                <span className="font-medium text-foreground">{section}</span>
              </>
            )}
          </div>
          {headerExtra && <div className="ml-auto">{headerExtra}</div>}
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default RoleShell
