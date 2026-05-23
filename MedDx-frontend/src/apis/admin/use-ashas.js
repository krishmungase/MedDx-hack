import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useAshas = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'ashas'],
    queryFn: async () => {
      const res = await apis.listAshas()
      return res?.data?.data?.ashas || []
    },
    retry: false,
    staleTime: 15_000,
  })

  return { ashas: data || [], isLoading, isFetching, error, refetch }
}

export default useAshas
