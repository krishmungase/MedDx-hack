import {
  CalendarCheck,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const consoleItems = [
  { id: 'doctors', label: 'Doctors', icon: Stethoscope, active: true },
]

const futureItems = [
  {
    id: 'appointments',
    label: 'Appointments',
    icon: CalendarCheck,
    soon: 'Phase 4',
  },
  { id: 'audit', label: 'Audit log', icon: ScrollText, soon: 'Always-on' },
  {
    id: 'compliance',
    label: 'Safety rails',
    icon: ShieldCheck,
    soon: 'Always-on',
  },
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const AdminSidebar = () => (
  <RoleSidebar
    eyebrow="Admin Console"
    versionLabel="v0.1 · Phase 2"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default AdminSidebar
