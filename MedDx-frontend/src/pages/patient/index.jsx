import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import PatientSidebar from './components/patient-sidebar'
import MyAppointments from './components/my-appointments'
import FindDoctor from './components/find-doctor'

const PatientHomePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'there'

  return (
    <SidebarProvider
      defaultOpen
      style={{ '--sidebar-width': '17rem', '--sidebar-width-icon': '3.25rem' }}
    >
      <PatientSidebar />

      <SidebarInset className="bg-grain">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger className="h-8 w-8 rounded-full" />
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold">
              Patient
            </span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Home</span>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="fade-up">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
              Hello, {first}.
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
              Pick a specialist, choose a time, and meet them on video — all
              free during the early access window.
            </p>
          </div>

          <div id="appointments" className="fade-up fade-up-delay-1">
            <MyAppointments />
          </div>

          <div id="doctors" className="fade-up fade-up-delay-2">
            <FindDoctor />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default PatientHomePage
