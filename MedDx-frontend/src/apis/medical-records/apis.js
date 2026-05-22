import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  byPatient: (patientId) => `/medical-records/${patientId}`,
}

const apis = {
  getByPatient: ({ patientId }) =>
    apiRequest({
      url: urls.byPatient(patientId),
      method: REQUEST_METHOD.GET,
    }),
}

export default apis
