import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const useMyPrescriptions = ({ enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['doctors', 'me', 'prescriptions'],
    queryFn: async () => {
      const res = await apiRequest({
        url: '/doctors/me/prescriptions',
        method: REQUEST_METHOD.GET,
      })
      return res?.data?.data?.items || []
    },
    retry: false,
    enabled,
    staleTime: 15_000,
  })

  return { items: data || [], isLoading, isFetching, error, refetch }
}

export default useMyPrescriptions
