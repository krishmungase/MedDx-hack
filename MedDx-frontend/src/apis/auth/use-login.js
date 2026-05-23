import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'

import { successToast } from '@/lib'
import { setAuth } from '@/store'

import apis from './apis'

const useLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.login({ data }),
    onSuccess: ({ data: response }) => {
      const payload = response?.data || {}
      console.log('Login Response:', response)
      console.log('Login Payload:', payload)
      
      successToast({ message: 'Logged in successfully' })
      dispatch(
        setAuth({
          user: payload.user,
          token: payload.token,
        })
      )
      
      console.log('Redux updated. Navigating to:', `/${payload.role}`)
      setTimeout(() => {
        if (payload.role) navigate(`/${payload.role}`, { replace: true })
      }, 50)
    },
    retry: false,
  })

  return { isLoading: isPending, login: mutate }
}

export default useLogin
