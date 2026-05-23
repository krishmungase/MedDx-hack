import { useQuery } from '@tanstack/react-query'

import apis from './apis'

/**
 * Checks whether the current patient has already left feedback for an
 * appointment. Returns the saved feedback document (or null).
 */
const useAppointmentFeedback = (appointmentId, { enabled = true } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['feedback', 'appointment', appointmentId],
    queryFn: async () => {
      const res = await apis.getByAppointment(appointmentId)
      return res?.data?.data?.feedback || null
    },
    retry: false,
    enabled: Boolean(appointmentId) && enabled,
    staleTime: 30_000,
  })
  return { feedback: data, isLoading, isFetching, refetch }
}

export default useAppointmentFeedback
