import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  base: '/feedback',
  byAppointment: (id) => `/feedback/appointment/${id}`,
  doctorMe: '/feedback/doctor/me',
  all: '/feedback/all',
  leaderboard: '/feedback/leaderboard',
}

const apis = {
  submit: ({ data }) =>
    apiRequest({ url: urls.base, method: REQUEST_METHOD.POST, data }),
  getByAppointment: (id) =>
    apiRequest({ url: urls.byAppointment(id), method: REQUEST_METHOD.GET }),
  doctorMe: (params) =>
    apiRequest({ url: urls.doctorMe, method: REQUEST_METHOD.GET, params }),
  all: (params) =>
    apiRequest({ url: urls.all, method: REQUEST_METHOD.GET, params }),
  leaderboard: (params) =>
    apiRequest({ url: urls.leaderboard, method: REQUEST_METHOD.GET, params }),
}

export default apis
