import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useDoctorById = ({ id, enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['doctors', 'detail', id],
    queryFn: async () => {
      const res = await apis.getById({ id })
      return res?.data?.data?.doctor || null
    },
    retry: false,
    enabled: !!id && enabled,
    staleTime: 30_000,
  })

  return { doctor: data, isLoading, isFetching, error, refetch }
}

export default useDoctorById
