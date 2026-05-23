import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  registerDoctor: '/admin/register-doctor',
  doctors: '/admin/doctors',
  doctor: (id) => `/admin/doctors/${id}`,
  stats: '/admin/stats',
  registerAsha: '/admin/register-asha',
  ashas: '/admin/ashas',
  asha: (id) => `/admin/ashas/${id}`,
}

const apis = {
  registerDoctor: ({ data }) =>
    apiRequest({
      data,
      url: urls.registerDoctor,
      method: REQUEST_METHOD.POST,
    }),
  listDoctors: () =>
    apiRequest({ url: urls.doctors, method: REQUEST_METHOD.GET }),
  getStats: () =>
    apiRequest({ url: urls.stats, method: REQUEST_METHOD.GET }),
  updateDoctorStatus: ({ id, accountStatus }) =>
    apiRequest({
      url: urls.doctor(id),
      method: REQUEST_METHOD.PATCH,
      data: { accountStatus },
    }),
  removeDoctor: ({ id }) =>
    apiRequest({ url: urls.doctor(id), method: REQUEST_METHOD.DELETE }),
  registerAsha: ({ data }) =>
    apiRequest({
      data,
      url: urls.registerAsha,
      method: REQUEST_METHOD.POST,
    }),
  listAshas: () =>
    apiRequest({ url: urls.ashas, method: REQUEST_METHOD.GET }),
  updateAshaStatus: ({ id, accountStatus }) =>
    apiRequest({
      url: urls.asha(id),
      method: REQUEST_METHOD.PATCH,
      data: { accountStatus },
    }),
  removeAsha: ({ id }) =>
    apiRequest({ url: urls.asha(id), method: REQUEST_METHOD.DELETE }),
}

export default apis
