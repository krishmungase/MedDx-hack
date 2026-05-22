import { useMutation } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

/**
 * `formatPrescriptionAsync` resolves with the already-unwrapped backend
 * payload — `{ prescription, disclaimer }` — so callers don't have to drill
 * through axios + ApiResponse envelopes.
 */
const usePrescriptionFormat = ({ onSuccess: onSuccessCb } = {}) => {
  const { mutate, mutateAsync, isPending, data, reset, error } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await apiRequest({
        url: '/ai/prescription/format',
        method: REQUEST_METHOD.POST,
        data,
      })
      return res?.data?.data || {}
    },
    onSuccess: (payload) => {
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  // `data` here is now the already-unwrapped payload from mutationFn.
  const prescription = data?.prescription || null
  const disclaimer = data?.disclaimer || null

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
