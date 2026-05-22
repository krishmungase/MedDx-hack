import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import DoctorsTable from '../components/doctors-table'
import RegisterDoctorDialog from '../components/register-doctor-dialog'

const DoctorsPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            Doctors.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Public registration is patient-only — every doctor on MedDx is
            verified and onboarded by you.
          </p>
        </div>
        <RegisterDoctorDialog />
      </div>

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
