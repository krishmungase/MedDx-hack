import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'

import { setUser } from '@/store'

import apis from './apis'

const useMyProfile = ({ enabled = true } = {}) => {
  const dispatch = useDispatch()

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const res = await apis.getMe()
      const profile = res?.data?.data || null
      // Keep Redux auth.user in sync with the fresh server copy so any
      // sidebar/header avatar instantly reflects edits made elsewhere.
      if (profile) dispatch(setUser(profile))
      return profile
    },
    retry: false,
    enabled,
    staleTime: 30_000,
  })

  return {
    profile: data || null,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

export default useMyProfile
