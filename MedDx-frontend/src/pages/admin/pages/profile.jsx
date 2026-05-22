import { CalendarCheck, ScrollText, ShieldCheck, Users } from 'lucide-react'

import { useAuditLog, useMyProfile, useStats } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

const AdminProfilePage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
  const { stats } = useStats()
  const { entries } = useAuditLog()

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Admin · Profile
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
        roleAccent={{ eyebrow: 'Admin · Profile' }}
        extraSection={
          profile ? (
            <AdminHighlights
              stats={stats || {}}
              auditCount={entries?.length || 0}
            />
          ) : null
        }
      />
    </div>
  )
}

const AdminHighlights = ({ stats, auditCount }) => (
  <section className="fade-up fade-up-delay-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
    <HighlightCard
      icon={Users}
      label="Patients"
      value={(stats.patients || 0).toLocaleString()}
      tone="primary"
      hint="Total registered"
    />
    <HighlightCard
      icon={ShieldCheck}
      label="Doctors"
      value={(stats.doctors || 0).toLocaleString()}
      tone="sage"
      hint="On platform"
    />
    <HighlightCard
      icon={CalendarCheck}
      label="Consultations"
      value={(stats.appointments || 0).toLocaleString()}
      tone="amber"
      hint="All-time"
    />
    <HighlightCard
      icon={ScrollText}
      label="Audit log"
      value={auditCount.toLocaleString()}
      tone="muted"
      hint="Record views"
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

export default AdminProfilePage
