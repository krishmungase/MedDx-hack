import RoleShell from '@/components/shared/role-shell'

import DoctorSidebar from './components/doctor-sidebar'

const SECTIONS = {
  '/doctor': "Today's queue",
  '/doctor/availability': 'Availability',
  '/doctor/earnings': 'Earnings',
}

const DoctorLayout = () => (
  <RoleShell
    eyebrow="Doctor · Workspace"
    sections={SECTIONS}
    sidebar={<DoctorSidebar />}
  />
)

export default DoctorLayout
