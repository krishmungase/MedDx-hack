import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useUpdateAshaStatus = () => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, accountStatus }) =>
      apis.updateAshaStatus({ id, accountStatus }),
    onSuccess: (_res, vars) => {
      successToast({
        message:
          vars.accountStatus === 'suspended'
            ? 'ASHA suspended.'
            : 'ASHA reactivated.',
      })
      qc.invalidateQueries({ queryKey: ['admin', 'ashas'] })
    },
    retry: false,
  })

  return { isLoading: isPending, updateAshaStatus: mutate }
}

export default useUpdateAshaStatus
