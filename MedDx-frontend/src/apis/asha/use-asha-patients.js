import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useAshaPatients = ({ search, enabled = true } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['asha', 'patients', search || ''],
    queryFn: async () => {
      const res = await apis.listPatients({ search })
      return res?.data?.data?.villagers || []
    },
    retry: false,
    enabled,
    staleTime: 15_000,
  })

  return {
    villagers: data || [],
    isLoading,
    isFetching,
    refetch,
  }
}

export default useAshaPatients
