import {
  CalendarCheck,
  HeartHandshake,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  Stethoscope,
  UserRound,
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
    id: 'ashas',
    label: 'ASHA workers',
    icon: HeartHandshake,
    to: '/admin/ashas',
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
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    to: '/admin/feedback',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserRound,
    to: '/admin/profile',
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
