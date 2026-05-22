import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useActiveDoctors = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['doctors', 'active'],
    queryFn: async () => {
      const res = await apis.listActive()
      return res?.data?.data?.doctors || []
    },
    retry: false,
    staleTime: 30_000,
  })

  return { doctors: data || [], isLoading, isFetching, error, refetch }
}

export default useActiveDoctors
