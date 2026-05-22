import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useRegisterDoctor = ({ onResult } = {}) => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.registerDoctor({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      successToast({
        message: payload.emailed
          ? 'Doctor invited — set-password link emailed.'
          : 'Doctor invited — share the link below.',
      })
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      onResult?.(payload)
    },
    retry: false,
  })

  return { isLoading: isPending, registerDoctor: mutate }
}

export default useRegisterDoctor
