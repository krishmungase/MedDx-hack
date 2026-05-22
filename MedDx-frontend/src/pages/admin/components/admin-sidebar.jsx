import {
  CalendarCheck,
  LayoutDashboard,
  ScrollText,
  Settings,
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
  {
    id: 'appointments',
    label: 'Appointments',
    icon: CalendarCheck,
    to: '/admin/appointments',
  },
  {
    id: 'audit',
    label: 'Audit log',
    icon: ScrollText,
    to: '/admin/audit-log',
  },
]

const futureItems = [
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
