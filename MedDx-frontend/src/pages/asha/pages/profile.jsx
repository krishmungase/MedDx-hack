import { useTranslation } from 'react-i18next'
import { CheckCircle2, HeartHandshake, MapPin, Users } from 'lucide-react'

import { useAshaDashboard, useMyProfile } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

const AshaProfilePage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t } = useTranslation()

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
  const { stats } = useAshaDashboard()

  const eyebrow = t('role.asha', { defaultValue: 'ASHA worker' }) + ' · ' +
    t('nav.profile', { defaultValue: 'Profile' })

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('profile.page_title')}
        </h1>
      </div>

      <ProfileView
        profile={profile}
        isLoading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        roleAccent={{ eyebrow }}
        extraSection={
          profile ? (
            <AshaHighlights profile={profile} stats={stats} t={t} />
          ) : null
        }
      />
    </div>
  )
}

const AshaHighlights = ({ profile, stats, t }) => (
  <section className="fade-up fade-up-delay-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <HighlightCard
      icon={Users}
      label={t('asha.stats.managed', { defaultValue: 'Villagers in care' })}
      value={stats?.managedPatients ?? 0}
      tone="primary"
    />
    <HighlightCard
      icon={HeartHandshake}
      label={t('asha.stats.pending', { defaultValue: 'Scheduled' })}
      value={stats?.pending ?? 0}
      tone="sage"
    />
    <HighlightCard
      icon={MapPin}
      label="Village"
      value={profile.village || '—'}
      hint={profile.ashaIdNumber ? `ID ${profile.ashaIdNumber}` : ''}
      tone="amber"
    />
    <HighlightCard
      icon={CheckCircle2}
      label={t('profile.account_status', { defaultValue: 'Account status' })}
      value={t('account_status.active', { defaultValue: 'Active' })}
      tone="sage"
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
        <p className="mt-0.5 font-display text-2xl tracking-tight tabular-nums truncate">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </article>
)

export default AshaProfilePage
