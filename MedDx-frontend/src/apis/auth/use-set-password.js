import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'

import { setAuth } from '@/store'
import { successToast } from '@/lib'

import apis from './apis'

const useSetPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.setPassword({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      successToast({
        message: 'Password set. Welcome aboard.',
      })
      dispatch(setAuth({ user: payload.user, token: payload.token }))
      if (payload.role) navigate(`/${payload.role}`, { replace: true })
    },
    retry: false,
  })

  return { isLoading: isPending, setPassword: mutate }
}

export default useSetPassword
