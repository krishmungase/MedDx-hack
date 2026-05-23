import { useMutation } from '@tanstack/react-query'

import apis from './apis'

/**
 * One step of the conversational triage. Caller passes the full history
 * (array of { role, content }) plus a language code. The server replies with
 * either a follow-up question ({ type: 'question', question }) or a final
 * result ({ type: 'result', triage, disclaimer }).
 */
const useTriageChat = () => {
  const { mutateAsync, isPending, reset, error } = useMutation({
    mutationFn: ({ history, language }) =>
      apis.triageChat({ data: { history, language } }),
    retry: false,
  })

  const step = async ({ history, language }) => {
    const res = await mutateAsync({ history, language })
    return res?.data?.data || null
  }

  return { step, isLoading: isPending, error, reset }
}

export default useTriageChat
