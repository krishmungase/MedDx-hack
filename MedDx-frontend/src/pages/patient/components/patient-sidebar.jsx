import {
  CalendarClock,
  FileText,
  Languages,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Sparkles,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const consoleItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, active: true },
]

const futureItems = [
  { id: 'triage', label: 'Symptom check', icon: Sparkles, soon: 'Phase 5' },
  { id: 'book', label: 'Book a doctor', icon: CalendarClock, soon: 'Phase 4' },
  { id: 'records', label: 'My records', icon: FileText, soon: 'Phase 4' },
  { id: 'messages', label: 'Consult notes', icon: MessageSquareText, soon: 'Phase 4' },
  { id: 'language', label: 'Language', icon: Languages, soon: 'Phase 8' },
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const PatientSidebar = () => (
  <RoleSidebar
    eyebrow="Patient"
    versionLabel="v0.1 · Phase 3"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default PatientSidebar
