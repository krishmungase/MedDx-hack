import { useQuery } from '@tanstack/react-query'

import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const useAuditLog = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'audit-log'],
    queryFn: async () => {
      const res = await apiRequest({
        url: '/admin/audit-log',
        method: REQUEST_METHOD.GET,
      })
      return res?.data?.data?.entries || []
    },
    retry: false,
    staleTime: 10_000,
  })

  return { entries: data || [], isLoading, isFetching, error, refetch }
}

export default useAuditLog
