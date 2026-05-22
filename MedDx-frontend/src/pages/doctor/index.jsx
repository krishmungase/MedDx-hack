import {
  ArrowRight,
  CalendarRange,
  ClipboardList,
  Coins,
  Stethoscope,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { DashboardShell } from '@/components'
import { Button } from '@/components/ui/button'

const DoctorHomePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'doctor'

  return (
    <DashboardShell
      role="doctor"
      eyebrow="Doctor · Workspace"
      title={`Welcome back, Dr. ${first}.`}
      italic="Your patients are waiting."
      intro="Set your availability, review your queue with urgent cases at the top, and approve every prescription after the AI assists with formatting."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <Card phase="Phase 3">
          <div className="flex items-center gap-2 text-clinic">
            <CalendarRange className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Availability
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Open 30-min slots across the week.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Pick a date and a time range — we'll generate clean half-hour slots
            and keep them in sync with your bookings.
          </p>
        </Card>

        <Card
          phase="Phase 4 · Triage in Phase 5"
          className="lg:col-span-2 relative overflow-hidden bg-clinic-mesh text-clinic-foreground"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-sage">
              <ClipboardList className="h-3 w-3" />
              Today's queue
            </div>
            <h2 className="mt-4 font-display text-3xl tracking-tight">
              Urgent first. Always.
            </h2>
            <p className="mt-2 max-w-md text-clinic-foreground/80 text-sm leading-relaxed">
              Emergencies and high-urgency cases sort to the top automatically.
              You'll see the AI summary in English alongside the patient's video.
            </p>
            <Button
              size="lg"
              className="mt-6 rounded-full bg-card text-foreground hover:bg-card/90 h-11 px-6"
              disabled
            >
              Coming in Phase 4
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="pointer-events-none absolute -right-12 -top-12 opacity-15">
            <Stethoscope className="h-72 w-72" strokeWidth={1} />
          </div>
        </Card>

        <Card phase="Phase 7">
          <div className="flex items-center gap-2 text-clinic">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              AI-formatted prescriptions
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            You edit. You approve. You sign.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Quick notes become a clean structured prescription with a plain-
            language summary in the patient's language. The AI assists — you're
            always the author of record.
          </p>
        </Card>

        <Card phase="Phase 6">
          <div className="flex items-center gap-2 text-clinic">
            <Coins className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Earnings
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            80% to you. Transparent.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every paid consultation drops 80% into your wallet immediately, with
            simulated payouts processed in 3 business days.
          </p>
        </Card>

        <Card phase="Phase 4">
          <div className="flex items-center gap-2 text-clinic">
            <Stethoscope className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Patient history
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Context, beside the camera.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Conditions, allergies, past consultations — visible during the call
            and logged in the patient's audit trail every time you open it.
          </p>
        </Card>
      </div>
    </DashboardShell>
  )
}

const Card = ({ children, className = '', phase }) => (
  <div
    className={`relative rounded-2xl border border-border/70 bg-card p-7 transition-shadow hover:shadow-[0_24px_60px_-30px_oklch(0.22_0.025_240/0.2)] ${className}`}
  >
    {phase && (
      <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {phase}
      </span>
    )}
    {children}
  </div>
)

export default DoctorHomePage
