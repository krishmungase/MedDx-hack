import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useAshaPatient = ({ id, enabled = true } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['asha', 'patient', id],
    queryFn: async () => {
      const res = await apis.getPatient({ id })
      return res?.data?.data || null
    },
    retry: false,
    enabled: !!id && enabled,
    staleTime: 15_000,
  })

  return {
    villager: data?.villager || null,
    record: data?.record || null,
    appointments: data?.appointments || [],
    isLoading,
    isFetching,
    refetch,
  }
}

export default useAshaPatient
