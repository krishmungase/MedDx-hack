import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useVideoSession = ({ id, enabled = true } = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', 'video-session', id],
    queryFn: async () => {
      const res = await apis.getVideoSession({ id })
      return res?.data?.data || null
    },
    retry: false,
    enabled: !!id && enabled,
    // Tokens are short-lived; don't keep them around past one hour.
    staleTime: 30 * 60 * 1000,
  })

  return { session: data, isLoading, error, refetch }
}

export default useVideoSession
