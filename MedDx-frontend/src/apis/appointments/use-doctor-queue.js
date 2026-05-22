import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useDoctorQueue = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['appointments', 'queue'],
    queryFn: async () => {
      const res = await apis.getQueue()
      return res?.data?.data?.appointments || []
    },
    retry: false,
    staleTime: 10_000,
  })

  return { appointments: data || [], isLoading, isFetching, error, refetch }
}

export default useDoctorQueue
