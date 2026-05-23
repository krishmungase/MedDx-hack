import { useTranslation } from 'react-i18next'
import { HeartHandshake, LayoutDashboard, Settings, Users } from 'lucide-react'

import RoleSidebar from '@/components/shared/role-sidebar'

const AshaSidebar = () => {
  const { t } = useTranslation()

  const consoleItems = [
    {
      id: 'dashboard',
      label: t('asha.nav.dashboard', { defaultValue: 'Dashboard' }),
      icon: LayoutDashboard,
      to: '/asha',
      end: true,
    },
    {
      id: 'patients',
      label: t('asha.nav.patients', { defaultValue: 'My villagers' }),
      icon: Users,
      to: '/asha/patients',
    },
    {
      id: 'profile',
      label: t('nav.profile', { defaultValue: 'Profile' }),
      icon: HeartHandshake,
      to: '/asha/profile',
    },
  ]

  const futureItems = [
    {
      id: 'settings',
      label: t('nav.settings', { defaultValue: 'Settings' }),
      icon: Settings,
      soon: '—',
    },
  ]

  return (
    <RoleSidebar
      eyebrow={t('asha.eyebrow', { defaultValue: 'ASHA Worker' })}
      consoleItems={consoleItems}
      futureItems={futureItems}
      showLanguage
    />
  )
}

export default AshaSidebar
