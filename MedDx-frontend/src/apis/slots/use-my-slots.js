import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useMySlots = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['slots', 'mine'],
    queryFn: async () => {
      const res = await apis.listMine()
      return res?.data?.data?.slots || []
    },
    retry: false,
    staleTime: 10_000,
  })

  return { slots: data || [], isLoading, isFetching, error, refetch }
}

export default useMySlots
