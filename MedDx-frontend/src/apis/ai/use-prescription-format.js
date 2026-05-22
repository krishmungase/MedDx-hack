import { useMutation } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const usePrescriptionFormat = ({ onSuccess: onSuccessCb } = {}) => {
  const { mutate, mutateAsync, isPending, data, reset, error } = useMutation({
    mutationFn: ({ data }) =>
      apiRequest({
        url: '/ai/prescription/format',
        method: REQUEST_METHOD.POST,
        data,
      }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  const prescription = data?.data?.data?.prescription || null
  const disclaimer = data?.data?.data?.disclaimer || null

  return {
    formatPrescription: mutate,
    formatPrescriptionAsync: mutateAsync,
    isLoading: isPending,
    prescription,
    disclaimer,
    reset,
    error,
  }
}

export default usePrescriptionFormat
