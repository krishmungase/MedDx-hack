import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  patients: '/asha/patients',
  patient: (id) => `/asha/patients/${id}`,
  dashboard: '/asha/dashboard',
}

const apis = {
  listPatients: ({ search } = {}) =>
    apiRequest({
      url: urls.patients,
      method: REQUEST_METHOD.GET,
      params: search ? { search } : undefined,
    }),
  addPatient: ({ data }) =>
    apiRequest({
      url: urls.patients,
      method: REQUEST_METHOD.POST,
      data,
    }),
  getPatient: ({ id }) =>
    apiRequest({ url: urls.patient(id), method: REQUEST_METHOD.GET }),
  dashboard: () =>
    apiRequest({ url: urls.dashboard, method: REQUEST_METHOD.GET }),
}

export default apis
