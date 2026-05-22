import { Link } from 'react-router'
import {
  ArrowRight,
  CalendarClock,
  HeartPulse,
  MessageSquareText,
  Sparkles,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { DashboardShell } from '@/components'
import { Button } from '@/components/ui/button'

const PatientHomePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'there'

  return (
    <DashboardShell
      role="patient"
      eyebrow="Patient · Dashboard"
      title={`Hello, ${first}.`}
      italic="How are you feeling today?"
      intro="Start with a symptom check — our AI will suggest the right specialty and urgency, then route you to an available doctor. A real doctor approves every prescription."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Primary action: symptom checker */}
        <Card
          className="lg:col-span-2 relative overflow-hidden bg-clinic-mesh text-clinic-foreground"
          phase="Phase 5"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-sage">
              <Sparkles className="h-3 w-3" />
              AI symptom check
            </div>
            <h2 className="mt-4 font-display text-3xl tracking-tight">
              Describe how you feel.
            </h2>
            <p className="mt-2 max-w-md text-clinic-foreground/80 text-sm leading-relaxed">
              Type or speak your symptoms in Hindi, Marathi, or English. We never
              diagnose — we just help find the right specialist faster.
            </p>
            <Button
              size="lg"
              className="mt-6 rounded-full bg-card text-foreground hover:bg-card/90 h-11 px-6"
              disabled
            >
              Coming in Phase 5
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="pointer-events-none absolute -right-12 -top-12 opacity-15">
            <HeartPulse className="h-72 w-72" strokeWidth={1} />
          </div>
        </Card>

        <Card phase="Phase 4">
          <div className="flex items-center gap-2 text-clinic">
            <CalendarClock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Book a doctor
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Pick a slot that fits your day.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Browse admin-verified specialists, see real availability, and confirm
            instantly. First visit is free.
          </p>
        </Card>

        <Card phase="Phase 4">
          <div className="flex items-center gap-2 text-clinic">
            <MessageSquareText className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Your records
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            One calm timeline of every visit.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Notes, prescriptions, and triage summaries — all in one place, shared
            only with your treating doctor and logged for transparency.
          </p>
        </Card>

        <Card phase="Phase 4 · Video">
          <div className="flex items-center gap-2 text-clinic">
            <HeartPulse className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.16em] font-semibold">
              Secure consultation
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">
            Meet your doctor over video.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Private rooms, no app install. Your doctor reviews history while you
            talk and writes notes you'll see right after.
          </p>
        </Card>
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          ← Back to home
        </Link>
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

export default PatientHomePage
