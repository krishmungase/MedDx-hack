import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useRemoveAsha = () => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id }) => apis.removeAsha({ id }),
    onSuccess: () => {
      successToast({ message: 'ASHA removed.' })
      qc.invalidateQueries({ queryKey: ['admin', 'ashas'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    retry: false,
  })

  return { isLoading: isPending, removeAsha: mutate }
}

export default useRemoveAsha
