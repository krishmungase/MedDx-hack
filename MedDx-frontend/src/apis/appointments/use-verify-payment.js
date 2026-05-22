import { useMutation, useQueryClient } from '@tanstack/react-query'

import apis from './apis'

const useVerifyPayment = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: ({ data }) => apis.verifyPayment({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      qc.invalidateQueries({ queryKey: ['appointments', 'mine'] })
      qc.invalidateQueries({ queryKey: ['slots', 'by-doctor'] })
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
