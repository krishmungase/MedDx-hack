import RoleShell from '@/components/shared/role-shell'

import PatientSidebar from './components/patient-sidebar'

const SECTIONS = {
  '/patient': 'nav.appointments',
  '/patient/triage': 'nav.triage',
  '/patient/triage/chat': 'nav.triage',
  '/patient/triage/form': 'nav.triage',
  '/patient/doctors': 'nav.doctors',
  '/patient/records': 'nav.records',
  '/patient/profile': 'nav.profile',
}

const PatientLayout = () => (
  <RoleShell
    eyebrow="role.patient"
    sections={SECTIONS}
    sidebar={<PatientSidebar />}
  />
)

export default PatientLayout
