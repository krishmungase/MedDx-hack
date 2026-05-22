import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

import DoctorsTable from '../components/doctors-table'
import RegisterDoctorDialog from '../components/register-doctor-dialog'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin · Doctors"
        title="Doctors."
        description="Public registration is patient-only — every doctor on MedDx is verified and onboarded by you."
        actions={<RegisterDoctorDialog />}
      />

      <div className="fade-up fade-up-delay-1">
        <DoctorsTable />
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
        Suspended doctors can't log in. Re-activating restores access without
        re-issuing a setup link. Removing is permanent.
      </p>
    </div>
  )
}

export default DoctorsPage
