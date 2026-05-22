import RoleShell from '@/components/shared/role-shell'

import PatientSidebar from './components/patient-sidebar'

const SECTIONS = {
  '/patient': 'My appointments',
  '/patient/triage': 'Symptom check',
  '/patient/doctors': 'Find a doctor',
}

const PatientLayout = () => (
  <RoleShell
    eyebrow="Patient"
    sections={SECTIONS}
    sidebar={<PatientSidebar />}
  />
)

export default PatientLayout
