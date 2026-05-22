import { useAuth, usePageTitle } from '@/hooks'
import { useStats } from '@/apis'
import { pageTitle } from '@/constants'

import StatsRow from '../components/stats-row'

const OverviewPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'admin'

  const { stats, isLoading } = useStats()

  return (
    <div className="space-y-10">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          {first}, the platform's in your hands.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          Watch the health of MedDx at a glance — register and manage
          specialists from the Doctors page.
        </p>
      </div>

      <section className="fade-up fade-up-delay-1">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          Overview
        </p>
        <StatsRow stats={stats} isLoading={isLoading} />
      </section>
    </div>
  )
}

export default OverviewPage
