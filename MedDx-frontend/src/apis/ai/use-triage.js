import { useMutation } from '@tanstack/react-query'

import apis from './apis'

const useTriage = ({ onSuccess: onSuccessCb } = {}) => {
  const { mutate, isPending, data, reset, error } = useMutation({
    mutationFn: ({ data }) => apis.triage({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  const triage = data?.data?.data?.triage || null
  const disclaimer = data?.data?.data?.disclaimer || null

  return {
    assess: mutate,
    isLoading: isPending,
    triage,
    disclaimer,
    error,
    reset,
  }
}

export default useTriage
