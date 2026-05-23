import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  AlertOctagon,
  CalendarClock,
  ChevronRight,
  HeartHandshake,
  Stethoscope,
  Users,
} from 'lucide-react'

import { useAshaDashboard } from '@/apis'
import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import AddVillagerDialog from '../components/add-villager-dialog'

const TONE_BG = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  destructive: 'bg-destructive/15 text-destructive',
}

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const AshaDashboardPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stats, isLoading } = useAshaDashboard()

  const first = user?.name?.split(' ')[0] || ''

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
            {t('asha.eyebrow', { defaultValue: 'ASHA Worker' })}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
            {t('asha.dashboard.greeting', { name: first })}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {t('asha.dashboard.subtitle')}
          </p>
        </div>
        <AddVillagerDialog defaultVillage={user?.village} />
      </div>

      <section className="fade-up fade-up-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigStat
          icon={Users}
          label={t('asha.stats.managed')}
          value={isLoading ? '—' : stats?.managedPatients ?? 0}
          tone="primary"
        />
        <BigStat
          icon={CalendarClock}
          label={t('asha.stats.this_week')}
          value={isLoading ? '—' : stats?.weekConsults ?? 0}
          tone="sage"
        />
        <BigStat
          icon={AlertOctagon}
          label={t('asha.stats.urgent')}
          value={isLoading ? '—' : stats?.urgentPending ?? 0}
          tone="destructive"
        />
        <BigStat
          icon={Stethoscope}
          label={t('asha.stats.pending')}
          value={isLoading ? '—' : stats?.pending ?? 0}
          tone="amber"
        />
      </section>

      <section className="fade-up fade-up-delay-2 rounded-3xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg tracking-tight">
              {t('asha.dashboard.recent_title')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('asha.dashboard.recent_hint')}
            </p>
          </div>
        </header>
        {(!stats?.recentAppointments || stats.recentAppointments.length === 0) ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {t('asha.dashboard.recent_empty')}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {stats.recentAppointments.map((a) => (
              <li
                key={a._id}
                className="flex flex-wrap items-center gap-3 px-6 py-3"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage/15 text-sage-foreground shrink-0 text-[11px] font-semibold">
                  {(a.villagePatientId?.name || 'V').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {a.villagePatientId?.name || 'Villager'}
                    <span className="text-muted-foreground font-normal ml-1.5">
                      → Dr {a.doctorId?.name || '—'}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {format(new Date(a.datetime), "EEE, MMM d · h:mm a")}
                  </p>
                </div>
                {a.triageUrgency && (
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${URGENCY_TONE[a.triageUrgency] || ''}`}
                  >
                    {a.triageUrgency}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] uppercase tracking-[0.12em] bg-muted text-muted-foreground"
                >
                  {a.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    navigate(`/asha/patients/${a.villagePatientId?._id}`)
                  }
                  disabled={!a.villagePatientId?._id}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

const BigStat = ({ icon: Icon, label, value, tone = 'primary' }) => (
  <article className="rounded-2xl border border-border/70 bg-card p-4">
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
        <p className="mt-0.5 font-display text-2xl tabular-nums tracking-tight">
          {value}
        </p>
      </div>
    </div>
  </article>
)

export default AshaDashboardPage
