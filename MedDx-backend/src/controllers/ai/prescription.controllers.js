import { ApiError, ApiResponse } from '../../utils/index.js'

class PrescriptionController {
  constructor(formatterService, logger) {
    this.formatterSvc = formatterService
    this.log = logger
  }

  // POST /api/v1/ai/prescription/format
  // body: { rawText, language?, patientContext? }
  async format(req, res) {
    const { rawText, language, patientContext } = req.body

    let formatted
    try {
      formatted = await this.formatterSvc.format({
        rawText,
        language,
        patientContext,
      })
    } catch (err) {
      this.log.error({
        msg: 'Prescription formatter failed',
        error: err?.message,
      })
      throw new ApiError(502, 'Could not format the prescription right now.')
    }

    this.log.info({
      msg: 'Prescription formatted',
      data: {
        userId: req.user?._id,
        meds: formatted.medications.length,
        lang: formatted.language,
      },
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          prescription: formatted,
          disclaimer:
            'AI helps format the doctor’s words. It does not prescribe or diagnose. The doctor reviews and approves before this is saved to your record.',
        },
        'Prescription formatted.'
      )
    )
  }
}

export default PrescriptionController
