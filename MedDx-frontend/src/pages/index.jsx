import HomePage from './home'

import SignInPage from './auth/sign-in'
import SignUpPage from './auth/sign-up'

import PatientLayout from './patient'
import PatientAppointmentsPage from './patient/pages/appointments'
import PatientDoctorsPage from './patient/pages/doctors'
import PatientTriagePage from './patient/pages/triage'
import PatientRecordsPage from './patient/pages/records'

import DoctorLayout from './doctor'
import DoctorQueuePage from './doctor/pages/queue'
import DoctorAvailabilityPage from './doctor/pages/availability'
import DoctorEarningsPage from './doctor/pages/earnings'
import DoctorPrescriptionsPage from './doctor/pages/prescriptions'

import AdminLayout from './admin'
import AdminOverviewPage from './admin/pages/overview'
import AdminDoctorsPage from './admin/pages/doctors'
import AdminAppointmentsPage from './admin/pages/appointments'
import AdminAuditLogPage from './admin/pages/audit-log'

import VideoConsultPage from './video'

import SetPasswordPage from './set-password'

import NotFoundPage from './not-found'

import AppLayout from './layout'
import AuthLayout from './auth/layout'

export { HomePage }

export { SignInPage, SignUpPage }

export {
  PatientLayout,
  PatientAppointmentsPage,
  PatientDoctorsPage,
  PatientTriagePage,
  PatientRecordsPage,
  DoctorLayout,
  DoctorQueuePage,
  DoctorAvailabilityPage,
  DoctorEarningsPage,
  DoctorPrescriptionsPage,
  AdminLayout,
  AdminOverviewPage,
  AdminDoctorsPage,
  AdminAppointmentsPage,
  AdminAuditLogPage,
}

export { VideoConsultPage }

export { SetPasswordPage }

export { NotFoundPage }

export { AppLayout, AuthLayout }
