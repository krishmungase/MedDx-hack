import HomePage from './home'

import SignInPage from './auth/sign-in'
import SignUpPage from './auth/sign-up'

import PatientLayout from './patient'
import PatientAppointmentsPage from './patient/pages/appointments'
import PatientDoctorsPage from './patient/pages/doctors'

import DoctorLayout from './doctor'
import DoctorQueuePage from './doctor/pages/queue'
import DoctorAvailabilityPage from './doctor/pages/availability'

import AdminLayout from './admin'
import AdminOverviewPage from './admin/pages/overview'
import AdminDoctorsPage from './admin/pages/doctors'

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
  DoctorLayout,
  DoctorQueuePage,
  DoctorAvailabilityPage,
  AdminLayout,
  AdminOverviewPage,
  AdminDoctorsPage,
}

export { VideoConsultPage }

export { SetPasswordPage }

export { NotFoundPage }

export { AppLayout, AuthLayout }
