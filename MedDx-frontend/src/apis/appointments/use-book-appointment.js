import { useMutation, useQueryClient } from '@tanstack/react-query'

import apis from './apis'

/**
 * Book endpoint can either:
 *   - confirm immediately (free or emergency) → payload.appointment
 *   - require payment → payload.paymentRequired + Razorpay order
 *
 * The dialog passes a single `onSuccess` callback that gets the raw payload
 * so it can branch into the Razorpay checkout flow itself.
 *
 * Both `bookAppointment` (sync) and `bookAppointmentAsync` (awaitable) hand
 * the consumer the already-unwrapped backend payload — not the axios response
 * envelope — so the dialog can read `paymentRequired`, `appointment`, etc.
 * directly without poking through `data.data`.
 */
const useBookAppointment = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await apis.book({ data })
      return res?.data?.data || {}
    },
    onSuccess: (payload) => {
      // Free, emergency, and demo-bypass flows all land with an appointment
      // attached and no further payment step. Invalidate caches in all three.
      if (!payload.paymentRequired) {
        qc.invalidateQueries({ queryKey: ['appointments', 'mine'] })
        qc.invalidateQueries({ queryKey: ['slots', 'by-doctor'] })
        qc.invalidateQueries({ queryKey: ['doctors', 'me', 'earnings'] })
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
