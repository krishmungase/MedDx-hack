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
    active: true,
  },
]

const futureItems = [
  { id: 'queue', label: 'Patient queue', icon: ClipboardList, soon: 'Phase 4' },
  { id: 'history', label: 'Patient history', icon: Users, soon: 'Phase 4' },
  { id: 'prescriptions', label: 'Prescriptions', icon: Notebook, soon: 'Phase 7' },
  { id: 'earnings', label: 'Earnings', icon: Coins, soon: 'Phase 6' },
  { id: 'settings', label: 'Settings', icon: Settings, soon: '—' },
]

const DoctorSidebar = () => (
  <RoleSidebar
    eyebrow="Doctor Workspace"
    versionLabel="v0.1 · Phase 3"
    consoleItems={consoleItems}
    futureItems={futureItems}
  />
)

export default DoctorSidebar
