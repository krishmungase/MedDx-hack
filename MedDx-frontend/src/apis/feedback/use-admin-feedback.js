import { useQuery } from '@tanstack/react-query'

import apis from './apis'

/** Admin: all feedback across the platform (optionally filtered by doctor). */
const useAdminFeedback = ({ page = 1, limit = 20, doctorId = null } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['feedback', 'admin', page, limit, doctorId || 'all'],
    queryFn: async () => {
      const res = await apis.all({
        page,
        limit,
        ...(doctorId ? { doctorId } : {}),
      })
      return res?.data?.data || null
    },
    retry: false,
    staleTime: 30_000,
  })

  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || limit,
    isLoading,
    isFetching,
    refetch,
  }
}

export default useAdminFeedback
