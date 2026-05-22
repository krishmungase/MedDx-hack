import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useSubmitConsultation = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }) => apis.submitConsultation({ id, data }),
    onSuccess: ({ data: response }, variables) => {
      const payload = response?.data || {}
      successToast({ message: 'Consultation saved.' })
      qc.invalidateQueries({ queryKey: ['appointments', 'queue'] })
      qc.invalidateQueries({
        queryKey: ['appointments', 'detail', variables?.id],
      })
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  return { isLoading: isPending, submitConsultation: mutate }
}

export default useSubmitConsultation
