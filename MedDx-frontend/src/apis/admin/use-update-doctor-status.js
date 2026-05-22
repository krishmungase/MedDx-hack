import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useUpdateDoctorStatus = () => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, accountStatus }) =>
      apis.updateDoctorStatus({ id, accountStatus }),
    onSuccess: ({ data: response }, vars) => {
      successToast({
        message:
          vars.accountStatus === 'suspended'
            ? 'Doctor suspended.'
            : 'Doctor reactivated.',
      })
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] })
    },
    retry: false,
  })

  return { isLoading: isPending, updateDoctorStatus: mutate }
}

export default useUpdateDoctorStatus
