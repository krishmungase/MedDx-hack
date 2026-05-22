import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useStats = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apis.getStats()
      return res?.data?.data || { patients: 0, doctors: 0, appointments: 0 }
    },
    retry: false,
    staleTime: 30_000,
  })

  return { stats: data, isLoading, isFetching, error, refetch }
}

export default useStats
