import { useQuery } from '@tanstack/react-query'

import apis from './apis'

// Public — returns a doctor's future + available slots, used by patients in the booking flow.
const useDoctorSlots = ({ doctorId, enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['slots', 'by-doctor', doctorId],
    queryFn: async () => {
      const res = await apis.listAvailableByDoctor({ doctorId })
      return res?.data?.data?.slots || []
    },
    retry: false,
    enabled: !!doctorId && enabled,
    staleTime: 10_000,
  })

  return { slots: data || [], isLoading, isFetching, error, refetch }
}

export default useDoctorSlots
