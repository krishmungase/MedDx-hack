import { CheckCircle2, Gift, HeartPulse } from 'lucide-react'

import { useMyAppointments, useMyProfile } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

const PatientProfilePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
  const { appointments } = useMyAppointments()

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Patient · Profile
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          Your account.
        </h1>
      </div>

      <ProfileView
        profile={profile}
        isLoading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        roleAccent={{ eyebrow: 'Patient · Profile' }}
        extraSection={
          profile ? (
            <PatientHighlights
              profile={profile}
              appointmentCount={appointments?.length || 0}
            />
          ) : null
        }
      />
    </div>
  )
}

const PatientHighlights = ({ profile, appointmentCount }) => (
  <section className="fade-up fade-up-delay-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <HighlightCard
      icon={Gift}
      label="Free first visit"
      value={profile.freeConsultationUsed ? 'Used' : 'Available'}
      tone={profile.freeConsultationUsed ? 'muted' : 'sage'}
      hint={
        profile.freeConsultationUsed
          ? 'Routine consults are ₹199 each'
          : 'Your next visit is on us'
      }
    />
    <HighlightCard
      icon={HeartPulse}
      label="Consultations"
      value={appointmentCount}
      tone="primary"
      hint="Bookings on file"
    />
    <HighlightCard
      icon={CheckCircle2}
      label="Account"
      value="Active"
      tone="sage"
      hint="Sign in any time"
    />
  </section>
)

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}

const HighlightCard = ({ icon: Icon, label, value, hint, tone = 'primary' }) => (
  <article className="rounded-2xl border border-border/70 bg-card p-5">
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${TONE_BG[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
          {label}
        </p>
        <p className="mt-0.5 font-display text-2xl tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </article>
)

export default PatientProfilePage
