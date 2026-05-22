import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const usePatientMedicalRecord = ({ patientId, enabled = true } = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: async () => {
      const res = await apis.getByPatient({ patientId })
      return res?.data?.data?.record || null
    },
    retry: false,
    enabled: !!patientId && enabled,
    staleTime: 15_000,
  })

  return { record: data, isLoading, isFetching, error, refetch }
}

export default usePatientMedicalRecord
