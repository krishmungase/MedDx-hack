import { ApiError, ApiResponse } from '../../utils/index.js'

class TriageController {
  constructor(triageService, logger) {
    this.triageSvc = triageService
    this.log = logger
  }

  // POST /api/v1/ai/triage
  // body: { symptoms, duration?, severity?, age?, sex?, extra?, language? }
  async assess(req, res) {
    const { symptoms, duration, severity, age, sex, extra, language } =
      req.body

    let result
    try {
      result = await this.triageSvc.assess({
        symptoms,
        duration,
        severity,
        age,
        sex,
        extra,
        language,
      })
    } catch (err) {
      this.log.error({ msg: 'Triage failed', error: err?.message })
      throw new ApiError(
        502,
        'Could not get a triage response right now — please try again.'
      )
    }

    this.log.info({
      msg: 'Triage assessed',
      data: {
        userId: req.user?._id,
        urgency: result.urgency,
        specialty: result.specialty,
      },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          triage: {
            urgency: result.urgency,
            specialty: result.specialty,
            reason: result.reason,
            summary: result.summary,
          },
          disclaimer:
            'This triage is for guidance only. It is not a diagnosis or a substitute for a doctor. In a real emergency, contact local emergency services immediately.',
        },
        'Triage complete.'
      )
    )
  }
}

export default TriageController
