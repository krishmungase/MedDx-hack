import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useAshaDashboard = ({ enabled = true } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['asha', 'dashboard'],
    queryFn: async () => {
      const res = await apis.dashboard()
      return res?.data?.data || null
    },
    retry: false,
    enabled,
    staleTime: 30_000,
  })

  return {
    stats: data,
    isLoading,
    isFetching,
    refetch,
  }
}

export default useAshaDashboard
