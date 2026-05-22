import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const usePlatformAppointments = ({ status } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'appointments', status || 'all'],
    queryFn: async () => {
      const res = await apiRequest({
        url: '/admin/appointments',
        method: REQUEST_METHOD.GET,
        params: status ? { status } : undefined,
      })
      return res?.data?.data?.appointments || []
    },
    retry: false,
    staleTime: 10_000,
  })

  return {
    appointments: data || [],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

export default usePlatformAppointments
