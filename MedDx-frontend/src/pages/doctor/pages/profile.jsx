import { useMyProfile, useMyStats } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { ProfileView } from '@/components'

import PerformanceCard from '../components/performance-card'

const DoctorProfilePage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })

  const { profile, isLoading, isFetching, refetch } = useMyProfile()
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
        extraSection={profile ? <PerformanceCard stats={stats} /> : null}
      />
    </div>
  )
}

export default DoctorProfilePage
