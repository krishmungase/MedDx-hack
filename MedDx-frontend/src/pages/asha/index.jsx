import { useLocation } from 'react-router'

import RoleShell from '@/components/shared/role-shell'

import AshaSidebar from './components/asha-sidebar'

// Static section labels (i18n keys; RoleShell calls t() on them).
const SECTIONS = {
  '/asha': 'asha.nav.dashboard',
  '/asha/patients': 'asha.nav.patients',
  '/asha/profile': 'nav.profile',
  '/asha/consult/start': 'asha.nav.patients',
  '/asha/consult/start/chat': 'asha.nav.patients',
  '/asha/consult/start/form': 'asha.nav.patients',
  '/asha/consult/doctor': 'asha.nav.patients',
}

// Dynamic sections (e.g. /asha/patients/:id) get resolved here.
const dynamicSection = (pathname) => {
  if (/^\/asha\/patients\/[^/]+$/.test(pathname)) return 'asha.nav.patients'
  return null
}

const AshaLayout = () => {
  const { pathname } = useLocation()
  const sections = { ...SECTIONS }
  const dyn = dynamicSection(pathname)
  if (dyn && !sections[pathname]) sections[pathname] = dyn

  return (
    <RoleShell
      eyebrow="asha.eyebrow"
      sections={sections}
      sidebar={<AshaSidebar />}
    />
  )
}

export default AshaLayout
