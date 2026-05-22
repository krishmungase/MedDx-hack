import { useQuery } from '@tanstack/react-query'

import apis from './apis'

const useVerifySetupToken = ({ token }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'verify-setup-token', token],
    queryFn: async () => {
      const res = await apis.verifySetupToken({ token })
      return res?.data?.data || null
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 60_000,
  })

  return { invitee: data, isLoading, error }
}

export default useVerifySetupToken
