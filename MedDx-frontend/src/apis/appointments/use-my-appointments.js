import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useMyAppointments = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['appointments', 'mine'],
    queryFn: async () => {
      const res = await apis.listMine()
      return res?.data?.data?.appointments || []
    },
    retry: false,
    staleTime: 5_000,
    refetchOnMount: 'always',
  })

  return { appointments: data || [], isLoading, isFetching, error, refetch }
}

export default useMyAppointments
