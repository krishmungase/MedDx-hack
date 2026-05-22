import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useGenerateSlots = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.generateSlots({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      const count = payload.slots?.length || 0
      successToast({
        message: `${count} slot${count === 1 ? '' : 's'} added.`,
      })
      qc.invalidateQueries({ queryKey: ['slots', 'mine'] })
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  return { isLoading: isPending, generateSlots: mutate }
}

export default useGenerateSlots
