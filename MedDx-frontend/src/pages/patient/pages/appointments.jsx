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
    <div className="space-y-6">
      {/* Compact greeting strip — the hero in MyAppointments carries the visual weight */}
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('nav.appointments', { defaultValue: 'Appointments' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('appointments.greeting', { name: first })}
        </h1>
      </div>

      <MyAppointments />
    </div>
  )
}

export default AppointmentsPage
