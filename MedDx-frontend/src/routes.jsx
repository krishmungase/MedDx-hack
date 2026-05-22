import { BrowserRouter, Routes, Route } from 'react-router'

import { ProtectedRoute } from './components/auth'
import {
  AdminHomePage,
  AppLayout,
  AuthLayout,
  DoctorHomePage,
  HomePage,
  NotFoundPage,
  PatientHomePage,
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
            <Route path="patient" element={<PatientHomePage />} />
          </Route>

          <Route element={<ProtectedRoute role="doctor" />}>
            <Route path="doctor" element={<DoctorHomePage />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminHomePage />} />
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
