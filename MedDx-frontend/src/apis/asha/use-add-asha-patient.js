import { useMutation, useQueryClient } from '@tanstack/react-query'

import { errorToast, successToast } from '@/lib'

import apis from './apis'

const useAddAshaPatient = ({ onSuccess: onSuccessCb } = {}) => {
  const qc = useQueryClient()
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await apis.addPatient({ data })
      return res?.data?.data?.villager
    },
    onSuccess: (villager) => {
      qc.invalidateQueries({ queryKey: ['asha', 'patients'] })
      qc.invalidateQueries({ queryKey: ['asha', 'dashboard'] })
      successToast({ message: 'Villager added to your roster.' })
      onSuccessCb?.(villager)
    },
    onError: (err) => {
      errorToast({
        message:
          err?.response?.data?.message || 'Could not add the villager.',
      })
    },
    retry: false,
  })

  return {
    addPatient: mutate,
    addPatientAsync: mutateAsync,
    isLoading: isPending,
  }
}

export default useAddAshaPatient
