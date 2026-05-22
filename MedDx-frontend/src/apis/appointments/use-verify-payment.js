import { useMutation, useQueryClient } from '@tanstack/react-query'

import apis from './apis'

// Same shape as useBookAppointment — return the unwrapped backend payload
// from mutateAsync so callers don't have to dig through axios envelopes.
const useVerifyPayment = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await apis.verifyPayment({ data })
      return res?.data?.data || {}
    },
    onSuccess: (payload) => {
      qc.invalidateQueries({ queryKey: ['appointments', 'mine'] })
      qc.invalidateQueries({ queryKey: ['slots', 'by-doctor'] })
      qc.invalidateQueries({ queryKey: ['doctors', 'me', 'earnings'] })
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  return {
    isLoading: isPending,
    verifyPayment: mutate,
    verifyPaymentAsync: mutateAsync,
  }
}

export default useVerifyPayment
