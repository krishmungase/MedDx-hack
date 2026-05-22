import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useRemoveDoctor = () => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id }) => apis.removeDoctor({ id }),
    onSuccess: () => {
      successToast({ message: 'Doctor removed.' })
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    retry: false,
  })

  return { isLoading: isPending, removeDoctor: mutate }
}

export default useRemoveDoctor
