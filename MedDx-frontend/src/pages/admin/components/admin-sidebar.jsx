import {
  CalendarCheck,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const consoleItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    to: '/admin',
    end: true,
  },
  {
    id: 'doctors',
    label: 'Doctors',
    icon: Stethoscope,
    to: '/admin/doctors',
  },
]

const futureItems = [
  {
    id: 'appointments',
    label: 'Appointments',
    icon: CalendarCheck,
    soon: 'Phase 5',
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
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default AdminSidebar
