import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  book: '/appointments/book',
  mine: '/appointments/mine',
  queue: '/appointments/queue',
  byId: (id) => `/appointments/${id}`,
  consultation: (id) => `/appointments/${id}/consultation`,
  videoSession: (id) => `/appointments/${id}/video-session`,
}

const apis = {
  book: ({ data }) =>
    apiRequest({ url: urls.book, method: REQUEST_METHOD.POST, data }),
  listMine: () =>
    apiRequest({ url: urls.mine, method: REQUEST_METHOD.GET }),
  getQueue: () =>
    apiRequest({ url: urls.queue, method: REQUEST_METHOD.GET }),
  getById: ({ id }) =>
    apiRequest({ url: urls.byId(id), method: REQUEST_METHOD.GET }),
  submitConsultation: ({ id, data }) =>
    apiRequest({
      url: urls.consultation(id),
      method: REQUEST_METHOD.PATCH,
      data,
    }),
  getVideoSession: ({ id }) =>
    apiRequest({ url: urls.videoSession(id), method: REQUEST_METHOD.GET }),
}

export default apis
