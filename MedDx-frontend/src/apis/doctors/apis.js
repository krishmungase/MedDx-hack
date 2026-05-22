import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  list: '/doctors',
  byId: (id) => `/doctors/${id}`,
}

const apis = {
  listActive: () =>
    apiRequest({ url: urls.list, method: REQUEST_METHOD.GET }),
  getById: ({ id }) =>
    apiRequest({ url: urls.byId(id), method: REQUEST_METHOD.GET }),
}

export default apis
