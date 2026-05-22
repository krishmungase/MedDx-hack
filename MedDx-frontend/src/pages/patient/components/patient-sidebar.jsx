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
    id: 'triage',
    label: 'Symptom check',
    icon: Sparkles,
    to: '/patient/triage',
  },
  {
    id: 'doctors',
    label: 'Find a doctor',
    icon: Stethoscope,
    to: '/patient/doctors',
  },
  {
    id: 'records',
    label: 'My records',
    icon: FileText,
    to: '/patient/records',
  },
]

const futureItems = [
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
