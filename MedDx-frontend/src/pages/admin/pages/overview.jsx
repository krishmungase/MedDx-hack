import { useAuth, usePageTitle } from '@/hooks'
import { useStats } from '@/apis'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

import StatsRow from '../components/stats-row'

const OverviewPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'admin'

  const { stats, isLoading } = useStats()

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Admin · Overview"
        title={`${first}, the platform's in your hands.`}
        description="Watch the health of MedDx at a glance — register and manage specialists from the Doctors page."
      />

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
