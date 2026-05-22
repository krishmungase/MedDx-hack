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
    id: 'availability',
    label: 'Availability',
    icon: CalendarRange,
    anchor: '#availability',
    active: true,
  },
  {
    id: 'queue',
    label: 'Patient queue',
    icon: ClipboardList,
    anchor: '#queue',
  },
]

const futureItems = [
  { id: 'history', label: 'Patient history', icon: Users, soon: 'In-call' },
  { id: 'prescriptions', label: 'Prescriptions', icon: Notebook, soon: 'Phase 7' },
  { id: 'earnings', label: 'Earnings', icon: Coins, soon: 'Phase 6' },
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const DoctorSidebar = () => (
  <RoleSidebar
    eyebrow="Doctor Workspace"
    versionLabel="v0.1 · Phase 4"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default DoctorSidebar
