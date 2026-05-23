import { BrowserRouter, Routes, Route } from 'react-router'

import { ProtectedRoute } from './components/auth'
import {
  AdminAppointmentsPage,
  AdminAshasPage,
  AdminAuditLogPage,
  AdminDoctorsPage,
  AdminLayout,
  AdminOverviewPage,
  AdminProfilePage,
  AppLayout,
  AshaConsultDoctorPage,
  AshaConsultStartPage,
  AshaDashboardPage,
  AshaLayout,
  AshaPatientDetailPage,
  AshaPatientsPage,
  AshaProfilePage,
  AuthLayout,
  DoctorAvailabilityPage,
  DoctorEarningsPage,
  DoctorLayout,
  DoctorPrescriptionsPage,
  DoctorProfilePage,
  DoctorQueuePage,
  HomePage,
  NotFoundPage,
  PatientAppointmentsPage,
  PatientDoctorsPage,
  PatientLayout,
  PatientProfilePage,
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

          {/* Public: doctor + ASHA onboarding via emailed setup link */}
          <Route path="set-password" element={<SetPasswordPage />} />

          <Route element={<ProtectedRoute role="patient" />}>
            <Route path="patient" element={<PatientLayout />}>
              <Route index element={<PatientAppointmentsPage />} />
              <Route path="triage" element={<PatientTriagePage />} />
              <Route path="doctors" element={<PatientDoctorsPage />} />
              <Route path="records" element={<PatientRecordsPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="doctor" />}>
            <Route path="doctor" element={<DoctorLayout />}>
              <Route index element={<DoctorQueuePage />} />
              <Route path="availability" element={<DoctorAvailabilityPage />} />
              <Route
                path="prescriptions"
                element={<DoctorPrescriptionsPage />}
              />
              <Route path="earnings" element={<DoctorEarningsPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
              <Route path="ashas" element={<AdminAshasPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="audit-log" element={<AdminAuditLogPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="asha" />}>
            <Route path="asha" element={<AshaLayout />}>
              <Route index element={<AshaDashboardPage />} />
              <Route path="patients" element={<AshaPatientsPage />} />
              <Route path="patients/:id" element={<AshaPatientDetailPage />} />
              <Route path="consult/start" element={<AshaConsultStartPage />} />
              <Route
                path="consult/doctor"
                element={<AshaConsultDoctorPage />}
              />
              <Route path="profile" element={<AshaProfilePage />} />
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
