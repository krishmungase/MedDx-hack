import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  UserCog,
  UserPlus,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { DashboardShell } from '@/components'
import { Button } from '@/components/ui/button'

const AdminHomePage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'admin'

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Console"
      title={`${first}, the platform's in your hands.`}
      italic=""
      intro="Register specialists, manage their accounts, and watch the health of the platform. Public registration is off for everyone except patients — every doctor on MedDx is verified by you."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <Card
          phase="Phase 2"
          className="lg:col-span-2 relative overflow-hidden bg-clinic-mesh text-clinic-foreground"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-sage">
              <UserPlus className="h-3 w-3" />
              Onboard a specialist
            </div>
            <h2 className="mt-4 font-display text-3xl tracking-tight">
              Register a doctor in under a minute.
            </h2>
            <p className="mt-2 max-w-md text-clinic-foreground/80 text-sm leading-relaxed">
              Name, email, specialty, license number — we email a one-time
              password-setup link (valid 24h). If Gmail isn't configured we
              surface the link right here for you to share.
            </p>
            <Button
              size="lg"
              className="mt-6 rounded-full bg-card text-foreground hover:bg-card/90 h-11 px-6"
              disabled
            >
              Coming in Phase 2
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="pointer-events-none absolute -right-12 -top-12 opacity-15">
            <ShieldCheck className="h-72 w-72" strokeWidth={1} />
          </div>
        </Card>

        <Card phase="Phase 2">
          <div className="flex items-center gap-2 text-clinic">
            <UserCog className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Doctors
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Verified, pending, suspended.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            One table for every doctor on the platform. Suspend or remove with a
            single action — patients are notified, slots release automatically.
          </p>
        </Card>

        <Card phase="Phase 2">
          <div className="flex items-center gap-2 text-clinic">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Platform stats
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Patients · Doctors · Visits.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Headline counts at a glance. Phase 6 adds revenue split, Phase 5
            adds urgency-by-specialty breakdowns.
          </p>
        </Card>

        <Card phase="Always-on">
          <div className="flex items-center gap-2 text-clinic">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Safety rails
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Patients only on public sign-up.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The backend already refuses any registration request with
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[11px]">
              role: doctor
            </code>
            or
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[11px]">
              admin
            </code>
            . Onboarding is your job, only.
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

export default AdminHomePage
