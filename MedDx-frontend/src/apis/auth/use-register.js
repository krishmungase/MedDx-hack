import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'

import { setAuth } from '@/store'
import { successToast } from '@/lib'

import apis from './apis'

const useRegister = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.register({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      successToast({ message: 'Account created successfully' })
      dispatch(
        setAuth({
          user: payload.user,
          token: payload.token,
        })
      )
      if (payload.role) navigate(`/${payload.role}`, { replace: true })
    },
    retry: false,
  })

  return { isLoading: isPending, register: mutate }
}

export default useRegister
