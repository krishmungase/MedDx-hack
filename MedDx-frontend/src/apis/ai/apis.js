import { apiRequest } from '@/request'
import { REQUEST_METHOD } from '@/constants'

const urls = {
  triage: '/ai/triage',
}

const apis = {
  triage: ({ data }) =>
    apiRequest({ url: urls.triage, method: REQUEST_METHOD.POST, data }),
}

export default apis
