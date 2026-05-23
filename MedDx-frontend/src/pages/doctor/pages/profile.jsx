import {
  BadgeCheck,
  IndianRupee,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'

import { useMyEarnings, useMyProfile, useMyStats } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

import PerformanceCard from '../components/performance-card'

const formatRupees = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)

const DoctorProfilePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
  const { balancePaise, transactions } = useMyEarnings()
  const { stats } = useMyStats()

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          Doctor · Profile
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
        roleAccent={{ eyebrow: 'Doctor · Profile' }}
        showSpecialty
        extraSection={
          profile ? (
            <>
              <DoctorHighlights
                profile={profile}
                walletPaise={balancePaise}
                consults={transactions?.length || 0}
              />
              <PerformanceCard stats={stats} />
            </>
          ) : null
        }
      />
    </div>
  )
}

const DoctorHighlights = ({ profile, walletPaise, consults }) => (
  <section className="fade-up fade-up-delay-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <HighlightCard
      icon={Stethoscope}
      label="Specialty"
      value={profile.specialty || '—'}
      tone="primary"
      hint="Visible to patients"
      isText
    />
    <HighlightCard
      icon={BadgeCheck}
      label="License"
      value={profile.licenseNumber || '—'}
      tone="sage"
      hint="Admin-verified"
      isText
    />
    <HighlightCard
      icon={IndianRupee}
      label="Wallet"
      value={formatRupees(walletPaise)}
      tone="amber"
      hint="Available to withdraw"
    />
    <HighlightCard
      icon={TrendingUp}
      label="Paid consults"
      value={consults}
      tone="muted"
      hint="Lifetime"
    />
  </section>
)

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}

const HighlightCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  isText = false,
}) => (
  <article className="rounded-2xl border border-border/70 bg-card p-5">
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${TONE_BG[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
          {label}
        </p>
        <p
          className={`mt-0.5 font-display tracking-tight ${
            isText
              ? 'text-base font-medium truncate'
              : 'text-2xl tabular-nums'
          }`}
          title={isText ? value : undefined}
        >
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </article>
)

export default DoctorProfilePage
