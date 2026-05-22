import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useDeleteSlot = () => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id }) => apis.deleteSlot({ id }),
    onSuccess: () => {
      successToast({ message: 'Slot deleted.' })
      qc.invalidateQueries({ queryKey: ['slots', 'mine'] })
    },
    retry: false,
  })

  return { isLoading: isPending, deleteSlot: mutate }
}

export default useDeleteSlot
