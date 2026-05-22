import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useDoctors = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'doctors'],
    queryFn: async () => {
      const res = await apis.listDoctors()
      return res?.data?.data?.doctors || []
    },
    retry: false,
    staleTime: 15_000,
  })

  return { doctors: data || [], isLoading, isFetching, error, refetch }
}

export default useDoctors
