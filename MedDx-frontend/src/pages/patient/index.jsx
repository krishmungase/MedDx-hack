import RoleShell from '@/components/shared/role-shell'

import PatientSidebar from './components/patient-sidebar'

// Section labels are i18n keys — RoleShell calls t() on them so the
// breadcrumb tracks the language toggle.
const SECTIONS = {
  '/patient': 'nav.appointments',
  '/patient/triage': 'nav.triage',
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
