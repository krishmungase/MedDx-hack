import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useAppointment = ({ id, enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['appointments', 'detail', id],
    queryFn: async () => {
      const res = await apis.getById({ id })
      return res?.data?.data?.appointment || null
    },
    retry: false,
    enabled: !!id && enabled,
    staleTime: 5_000,
  })

  return { appointment: data, isLoading, isFetching, error, refetch }
}

export default useAppointment
