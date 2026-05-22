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
}
