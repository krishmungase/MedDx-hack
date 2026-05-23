import { useQuery } from '@tanstack/react-query'

import apis from './apis'

/** Doctor's own anonymized feedback list + stats (avg, total, histogram). */
const useDoctorFeedback = ({ page = 1, limit = 20 } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['feedback', 'doctor', 'me', page, limit],
    queryFn: async () => {
      const res = await apis.doctorMe({ page, limit })
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
    stats: data?.stats || {
      total: 0,
      avg: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    isLoading,
    isFetching,
    refetch,
  }
}

export default useDoctorFeedback
