import { ApiError, ApiResponse } from '../../utils/index.js'

class TriageChatController {
  constructor(triageChatService, logger) {
    this.chatSvc = triageChatService
    this.log = logger
  }

  // POST /api/v1/ai/triage-chat
  // body: { history: [{role, content}], language? }
  async step(req, res) {
    const { history = [], language } = req.body

    let response
    try {
      response = await this.chatSvc.step({ history, language })
    } catch (err) {
      this.log.error({ msg: 'TriageChat failed', error: err?.message })
      throw new ApiError(
        502,
        'Could not get a triage response right now — please try again.'
      )
    }

    this.log.info({
      msg: 'TriageChat stepped',
      data: {
        userId: req.user?._id,
        type: response?.type,
        turn: history.length,
      },
    })

    // Question turn — just return the next question.
    if (response.type === 'question') {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { type: 'question', question: response.question },
            'Next question generated.'
          )
        )
    }

    // Result turn — shape matches /triage so the downstream booking flow is identical.
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          type: 'result',
          triage: {
            urgency: response.urgency,
            specialty: response.specialty,
            reason: response.reason,
            summary: response.summary,
          },
          disclaimer:
            'This triage is for guidance only. It is not a diagnosis or a substitute for a doctor. In a real emergency, contact local emergency services immediately.',
        },
        'Triage complete.'
      )
    )
  }
}

export default TriageChatController
