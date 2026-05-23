import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useFeedbackLeaderboard = ({ limit = 20 } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['feedback', 'leaderboard', limit],
    queryFn: async () => {
      const res = await apis.leaderboard({ limit })
      return res?.data?.data?.items || []
    },
    retry: false,
    staleTime: 60_000,
  })

  return {
    items: data || [],
    isLoading,
    isFetching,
    refetch,
  }
}

export default useFeedbackLeaderboard
