import { useTranslation } from 'react-i18next'
import { CheckCircle2, Gift, HeartPulse } from 'lucide-react'

import { useMyAppointments, useMyProfile } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

const PatientProfilePage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { t } = useTranslation()

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
  const { appointments } = useMyAppointments()

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('profile.patient_eyebrow')}
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
        roleAccent={{ eyebrow: t('profile.patient_eyebrow') }}
        extraSection={
          profile ? (
            <PatientHighlights
              profile={profile}
              appointmentCount={appointments?.length || 0}
              t={t}
            />
          ) : null
        }
      />
    </div>
  )
}

const PatientHighlights = ({ profile, appointmentCount, t }) => (
  <section className="fade-up fade-up-delay-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
    <HighlightCard
      icon={Gift}
      label={t('appointments.expect_free_first')}
      value={
        profile.freeConsultationUsed
          ? t('common.used', { defaultValue: 'Used' })
          : t('common.available', { defaultValue: 'Available' })
      }
      tone={profile.freeConsultationUsed ? 'muted' : 'sage'}
      hint={
        profile.freeConsultationUsed
          ? t('book_dialog.paid_note')
          : t('appointments.no_upcoming_body')
      }
    />
    <HighlightCard
      icon={HeartPulse}
      label={t('appointments.card_title')}
      value={appointmentCount}
      tone="primary"
    />
    <HighlightCard
      icon={CheckCircle2}
      label={t('profile.account_status')}
      value={t('account_status.active')}
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
        <p className="mt-0.5 font-display text-2xl tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  </article>
)

export default PatientProfilePage
