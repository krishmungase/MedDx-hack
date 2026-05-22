import { useMutation, useQueryClient } from '@tanstack/react-query'

import apis from './apis'

/**
 * Book endpoint can either:
 *   - confirm immediately (free or emergency) → payload.appointment
 *   - require payment → payload.paymentRequired + Razorpay order
 *
 * The dialog passes a single `onSuccess` callback that gets the raw payload
 * so it can branch into the Razorpay checkout flow itself.
 */
const useBookAppointment = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: ({ data }) => apis.book({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      if (!payload.paymentRequired) {
        qc.invalidateQueries({ queryKey: ['appointments', 'mine'] })
        qc.invalidateQueries({ queryKey: ['slots', 'by-doctor'] })
      }
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  return {
    isLoading: isPending,
    bookAppointment: mutate,
    bookAppointmentAsync: mutateAsync,
  }
}

export default useBookAppointment
