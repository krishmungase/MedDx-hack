import { useDispatch } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { errorToast, successToast } from '@/lib'
import { setUser } from '@/store'

import apis from './apis'

const useUpdateProfile = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.updateMe({ data }),
    onSuccess: ({ data: response }) => {
      const profile = response?.data || null
      if (profile) {
        // setUser destructures { user } from the payload.
        dispatch(setUser({ user: profile }))
        queryClient.setQueryData(['users', 'me'], profile)
      }
      successToast({ message: 'Profile updated.' })
    },
    onError: (err) => {
      errorToast({
        message:
          err?.response?.data?.message || "Couldn't update your profile.",
      })
    },
    retry: false,
  })

  return { isLoading: isPending, updateProfile: mutate }
}

export default useUpdateProfile
