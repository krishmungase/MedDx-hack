import { BrowserRouter, Routes, Route } from 'react-router'

import { ProtectedRoute } from './components/auth'
import {
  AdminDoctorsPage,
  AdminLayout,
  AdminOverviewPage,
  AppLayout,
  AuthLayout,
  DoctorAvailabilityPage,
  DoctorEarningsPage,
  DoctorLayout,
  DoctorQueuePage,
  HomePage,
  NotFoundPage,
  PatientAppointmentsPage,
  PatientDoctorsPage,
  PatientLayout,
  PatientRecordsPage,
  PatientTriagePage,
  SetPasswordPage,
  SignInPage,
  SignUpPage,
  VideoConsultPage,
} from './pages'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>

          {/* Public: doctor onboarding via emailed setup link */}
          <Route path="set-password" element={<SetPasswordPage />} />

          <Route element={<ProtectedRoute role="patient" />}>
            <Route path="patient" element={<PatientLayout />}>
              <Route index element={<PatientAppointmentsPage />} />
              <Route path="triage" element={<PatientTriagePage />} />
              <Route path="doctors" element={<PatientDoctorsPage />} />
              <Route path="records" element={<PatientRecordsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="doctor" />}>
            <Route path="doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorQueuePage />} />
              <Route path="availability" element={<DoctorAvailabilityPage />} />
              <Route path="earnings" element={<DoctorEarningsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
            </Route>
          </Route>

          {/* Authed (any role) — server checks ownership */}
          <Route element={<ProtectedRoute />}>
            <Route path="video/:id" element={<VideoConsultPage />} />
          </Route>

          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
