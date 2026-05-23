import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  triage: '/ai/triage',
  triageChat: '/ai/triage-chat',
}

const apis = {
  triage: ({ data }) =>
    apiRequest({ url: urls.triage, method: REQUEST_METHOD.POST, data }),
  triageChat: ({ data }) =>
    apiRequest({ url: urls.triageChat, method: REQUEST_METHOD.POST, data }),
}

export default apis
