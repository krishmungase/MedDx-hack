import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const EMPTY = {
  totalConsults: 0,
  uniquePatients: 0,
  thisMonth: { consults: 0, earningsPaise: 0 },
  monthlyTrend: [],
  last7Days: [],
  recent: [],
}

const useMyStats = ({ enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['doctors', 'me', 'stats'],
    queryFn: async () => {
      const res = await apiRequest({
        url: '/doctors/me/stats',
        method: REQUEST_METHOD.GET,
      })
      return res?.data?.data || EMPTY
    },
    retry: false,
    enabled,
    staleTime: 30_000,
  })

  return {
    stats: data || EMPTY,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

export default useMyStats
