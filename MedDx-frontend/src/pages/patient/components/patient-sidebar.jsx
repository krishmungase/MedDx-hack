import { useTranslation } from 'react-i18next'
import {
  CalendarClock,
  FileText,
  Settings,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const PatientSidebar = () => {
  const { t } = useTranslation()

  const consoleItems = [
    {
      id: 'appointments',
      label: t('nav.appointments'),
      icon: CalendarClock,
      to: '/patient',
      end: true,
    },
    {
      id: 'triage',
      label: t('nav.triage'),
      icon: Sparkles,
      to: '/patient/triage',
    },
    {
      id: 'doctors',
      label: t('nav.doctors'),
      icon: Stethoscope,
      to: '/patient/doctors',
    },
    {
      id: 'records',
      label: t('nav.records'),
      icon: FileText,
      to: '/patient/records',
    },
    {
      id: 'profile',
      label: t('nav.profile', { defaultValue: 'Profile' }),
      icon: UserRound,
      to: '/patient/profile',
    },
  ]

  const futureItems = [
    { id: 'settings', label: t('nav.settings'), icon: Settings, soon: '—' },
  ]

  return (
    <RoleSidebar
      eyebrow="Patient"
      consoleItems={consoleItems}
      futureItems={futureItems}
      showLanguage
    />
  )
}

export default PatientSidebar
