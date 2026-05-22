import useLogin from './auth/use-login'
import useRegister from './auth/use-register'
import useSetPassword from './auth/use-set-password'
import useVerifySetupToken from './auth/use-verify-setup-token'

import useStats from './admin/use-stats'
import useDoctors from './admin/use-doctors'
import useRegisterDoctor from './admin/use-register-doctor'
import useRemoveDoctor from './admin/use-remove-doctor'
import useUpdateDoctorStatus from './admin/use-update-doctor-status'

import useMySlots from './slots/use-my-slots'
import useGenerateSlots from './slots/use-generate-slots'
import useDeleteSlot from './slots/use-delete-slot'
import useDoctorSlots from './slots/use-doctor-slots'

import useActiveDoctors from './doctors/use-active-doctors'
import useDoctorById from './doctors/use-doctor-by-id'

import useBookAppointment from './appointments/use-book-appointment'
import useMyAppointments from './appointments/use-my-appointments'
import useDoctorQueue from './appointments/use-doctor-queue'
import useAppointment from './appointments/use-appointment'
import useSubmitConsultation from './appointments/use-submit-consultation'
import useVideoSession from './appointments/use-video-session'

import usePatientMedicalRecord from './medical-records/use-patient-medical-record'

export {
  useLogin,
  useRegister,
  useSetPassword,
  useVerifySetupToken,
  useStats,
  useDoctors,
  useRegisterDoctor,
  useRemoveDoctor,
  useUpdateDoctorStatus,
  useMySlots,
  useGenerateSlots,
  useDeleteSlot,
  useDoctorSlots,
  useActiveDoctors,
  useDoctorById,
  useBookAppointment,
  useMyAppointments,
  useDoctorQueue,
  useAppointment,
  useSubmitConsultation,
  useVideoSession,
  usePatientMedicalRecord,
}
