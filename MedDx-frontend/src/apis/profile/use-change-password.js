import { useMutation } from '@tanstack/react-query'

import { errorToast, successToast } from '@/lib'

import apis from './apis'

const useChangePassword = ({ onSuccess } = {}) => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.changePassword({ data }),
    onSuccess: () => {
      successToast({ message: 'Password changed successfully.' })
      onSuccess?.()
    },
    onError: (err) => {
      errorToast({
        message:
          err?.response?.data?.message || "Couldn't change your password.",
      })
    },
    retry: false,
  })

  return { isLoading: isPending, changePassword: mutate }
}

export default useChangePassword
