import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  login: '/auth/login',
  register: '/auth/register',
  verifySetupToken: '/auth/verify-setup-token',
  setPassword: '/auth/set-password',
}

const apis = {
  login: ({ data }) =>
    apiRequest({
      data,
      url: urls.login,
      method: REQUEST_METHOD.POST,
    }),
  register: ({ data }) =>
    apiRequest({
      data,
      url: urls.register,
      method: REQUEST_METHOD.POST,
    }),
  verifySetupToken: ({ token }) =>
    apiRequest({
      url: urls.verifySetupToken,
      method: REQUEST_METHOD.GET,
      params: { token },
    }),
  setPassword: ({ data }) =>
    apiRequest({
      data,
      url: urls.setPassword,
      method: REQUEST_METHOD.POST,
    }),
}

export default apis
