import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  me: '/users/me',
  changePassword: '/users/change-password',
}

const apis = {
  getMe: () =>
    apiRequest({
      url: urls.me,
      method: REQUEST_METHOD.GET,
    }),
  updateMe: ({ data }) =>
    apiRequest({
      url: urls.me,
      method: REQUEST_METHOD.PATCH,
      data,
    }),
  changePassword: ({ data }) =>
    apiRequest({
      url: urls.changePassword,
      method: REQUEST_METHOD.POST,
      data,
    }),
}

export default apis
