import { useAuth, usePageTitle } from '@/hooks'
import { useStats } from '@/apis'
import { pageTitle } from '@/constants'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import AdminSidebar from './components/admin-sidebar'
import StatsRow from './components/stats-row'
import DoctorsTable from './components/doctors-table'
import RegisterDoctorDialog from './components/register-doctor-dialog'

const AdminHomePage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'admin'

  const { stats, isLoading } = useStats()

  return (
    <SidebarProvider
      defaultOpen
      style={{ '--sidebar-width': '17rem', '--sidebar-width-icon': '3.25rem' }}
    >
      <AdminSidebar />

      <SidebarInset className="bg-grain">
        {/* Inset top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger className="h-8 w-8 rounded-full" />
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold">
              Admin · Console
            </span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Overview</span>
          </div>
          <div className="ml-auto">
            <RegisterDoctorDialog />
          </div>
        </header>

        {/* Page content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="fade-up">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
              {first}, the platform's in your hands.
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
              Register specialists, manage their accounts, and watch the health
              of the platform. Public registration is patient-only — every
              doctor on MedDx is verified by you.
            </p>
          </div>

          <section id="stats" className="fade-up fade-up-delay-1 scroll-mt-24">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Overview
            </p>
            <StatsRow stats={stats} isLoading={isLoading} />
          </section>

          <section
            id="doctors"
            className="fade-up fade-up-delay-2 scroll-mt-24"
          >
            <DoctorsTable />
          </section>

          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
            Suspended doctors can't log in. Re-activating restores access
            without re-issuing a setup link. Removing is permanent.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminHomePage
