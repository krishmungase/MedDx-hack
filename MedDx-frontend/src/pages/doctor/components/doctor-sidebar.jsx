import {
  CalendarRange,
  ClipboardList,
  Coins,
  Notebook,
  Settings,
  Users,
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
    id: 'earnings',
    label: 'Earnings',
    icon: Coins,
    to: '/doctor/earnings',
  },
]

const futureItems = [
  { id: 'history', label: 'Patient history', icon: Users, soon: 'In-call' },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: Notebook,
    soon: 'Phase 7',
  },
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
