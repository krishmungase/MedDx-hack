import {
  CalendarClock,
  FileText,
  Languages,
  Settings,
  Sparkles,
  Stethoscope,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const consoleItems = [
  {
    id: 'appointments',
    label: 'My appointments',
    icon: CalendarClock,
    to: '/patient',
    end: true,
  },
  {
    id: 'doctors',
    label: 'Find a doctor',
    icon: Stethoscope,
    to: '/patient/doctors',
  },
]

const futureItems = [
  { id: 'triage', label: 'Symptom check', icon: Sparkles, soon: 'Phase 5' },
  { id: 'records', label: 'My records', icon: FileText, soon: 'Phase 7' },
  { id: 'language', label: 'Language', icon: Languages, soon: 'Phase 8' },
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const PatientSidebar = () => (
  <RoleSidebar
    eyebrow="Patient"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default PatientSidebar
