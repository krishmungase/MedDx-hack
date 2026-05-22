import { useMutation, useQueryClient } from '@tanstack/react-query'

import { successToast } from '@/lib'

import apis from './apis'

const useBookAppointment = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.book({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      successToast({ message: 'Appointment confirmed.' })
      qc.invalidateQueries({ queryKey: ['appointments', 'mine'] })
      qc.invalidateQueries({ queryKey: ['slots', 'by-doctor'] })
      onSuccessCb?.(payload)
    },
    retry: false,
  })

  return { isLoading: isPending, bookAppointment: mutate }
}

export default useBookAppointment
