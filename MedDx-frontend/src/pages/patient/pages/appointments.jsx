import { useTranslation } from 'react-i18next'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'

import MyAppointments from '../components/my-appointments'

const AppointmentsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { t } = useTranslation()
  const { user } = useAuth()
  const first = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
          {t('appointments.greeting', { name: first })}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
          {t('appointments.subtitle')}
        </p>
      </div>

      <div className="fade-up fade-up-delay-1">
        <MyAppointments />
      </div>
    </div>
  )
}

export default AppointmentsPage
