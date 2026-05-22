import {
  CalendarRange,
  ClipboardList,
  Coins,
  Notebook,
  Settings,
  UserRound,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const consoleItems = [
  {
    id: 'queue',
    label: "Today's queue",
    icon: ClipboardList,
    to: '/doctor',
    end: true,
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: CalendarRange,
    to: '/doctor/availability',
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: Notebook,
    to: '/doctor/prescriptions',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: Coins,
    to: '/doctor/earnings',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserRound,
    to: '/doctor/profile',
  },
]

const futureItems = [
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const DoctorSidebar = () => (
  <RoleSidebar
    eyebrow="Doctor Workspace"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default DoctorSidebar
