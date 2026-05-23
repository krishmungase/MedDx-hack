import { useMutation, useQueryClient } from '@tanstack/react-query'

import apis from './apis'

const useSubmitFeedback = ({ onSuccess: onSuccessCb } = {}) => {
  const queryClient = useQueryClient()
  const { mutate, mutateAsync, isPending, error, reset } = useMutation({
    mutationFn: ({ data }) => apis.submit({ data }),
    onSuccess: (res, vars) => {
      // Invalidate any feedback-check queries for this appointment so the
      // "Rate consultation" CTA flips to "Rated".
      queryClient.invalidateQueries({
        queryKey: ['feedback', 'appointment', vars?.data?.appointmentId],
      })
      onSuccessCb?.(res?.data?.data)
    },
    retry: false,
  })

  return {
    submit: mutate,
    submitAsync: mutateAsync,
    isLoading: isPending,
    error,
    reset,
  }
}

export default useSubmitFeedback
