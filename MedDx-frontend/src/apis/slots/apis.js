import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  base: '/slots',
  mine: '/slots/mine',
  byId: (id) => `/slots/${id}`,
  byDoctor: (doctorId) => `/slots/by-doctor/${doctorId}`,
}

const apis = {
  generateSlots: ({ data }) =>
    apiRequest({
      data,
      url: urls.base,
      method: REQUEST_METHOD.POST,
    }),
  listMine: () =>
    apiRequest({ url: urls.mine, method: REQUEST_METHOD.GET }),
  deleteSlot: ({ id }) =>
    apiRequest({ url: urls.byId(id), method: REQUEST_METHOD.DELETE }),
  listAvailableByDoctor: ({ doctorId }) =>
    apiRequest({ url: urls.byDoctor(doctorId), method: REQUEST_METHOD.GET }),
}

export default apis
