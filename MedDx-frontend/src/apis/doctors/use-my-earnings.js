import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const fetchEarnings = () =>
  apiRequest({ url: '/doctors/me/earnings', method: REQUEST_METHOD.GET })

const useMyEarnings = ({ enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['doctors', 'me', 'earnings'],
    queryFn: async () => {
      const res = await fetchEarnings()
      return res?.data?.data || { balancePaise: 0, transactions: [] }
    },
    retry: false,
    enabled,
    staleTime: 15_000,
  })

  return {
    balancePaise: data?.balancePaise || 0,
    transactions: data?.transactions || [],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

export default useMyEarnings
