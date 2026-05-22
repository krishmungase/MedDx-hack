import { useTranslation } from 'react-i18next'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { PageHeader } from '@/components'

import MyAppointments from '../components/my-appointments'

const AppointmentsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { t } = useTranslation()
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('nav.appointments', { defaultValue: 'Appointments' })}
        title={t('appointments.greeting', { name: first })}
        description={t('appointments.subtitle')}
      />

      <div className="fade-up fade-up-delay-1">
        <MyAppointments />
      </div>
    </div>
  )
}

export default AppointmentsPage
