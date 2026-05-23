import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useRegisterAsha = ({ onResult } = {}) => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.registerAsha({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      successToast({
        message: payload.emailed
          ? 'ASHA invited — set-password link emailed.'
          : 'ASHA invited — share the link below.',
      })
      qc.invalidateQueries({ queryKey: ['admin', 'ashas'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      onResult?.(payload)
    },
    retry: false,
  })

  return { isLoading: isPending, registerAsha: mutate }
}

export default useRegisterAsha
