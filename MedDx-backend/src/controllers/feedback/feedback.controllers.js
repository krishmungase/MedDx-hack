import { ApiError, ApiResponse } from '../../utils/index.js'

class FeedbackController {
  constructor(feedbackService, logger) {
    this.svc = feedbackService
    this.log = logger
  }

  // POST /api/v1/feedback  (patient only)
  // body: { appointmentId, rating, comment? }
  async submit(req, res) {
    const { appointmentId, rating, comment } = req.body
    let saved
    try {
      saved = await this.svc.submit({
        appointmentId,
        patientId: req.user._id,
        rating: Number(rating),
        comment,
      })
    } catch (err) {
      if (err.code === 'NOT_FOUND') throw new ApiError(404, err.message)
      if (err.code === 'FORBIDDEN') throw new ApiError(403, err.message)
      if (err.code === 'CONFLICT') throw new ApiError(409, err.message)
      // Mongo unique violation (race condition) maps to a 409 too.
      if (err?.code === 11000) {
        throw new ApiError(409, 'You already rated this consultation.')
      }
      throw err
    }
    this.log.info({
      msg: 'Feedback submitted',
      data: { feedbackId: saved._id, doctorId: saved.doctorId },
    })
    return res
      .status(201)
      .json(new ApiResponse(201, { feedback: saved }, 'Feedback recorded.'))
  }

  // GET /api/v1/feedback/appointment/:id  (patient checks if they already left feedback)
  async getByAppointment(req, res) {
    const fb = await this.svc.getByAppointment(req.params.id)
    return res
      .status(200)
      .json(new ApiResponse(200, { feedback: fb || null }, 'OK.'))
  }

  // GET /api/v1/feedback/doctor/me  (doctor's own anonymized feedback)
  async listForMe(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const [list, stats] = await Promise.all([
      this.svc.listForDoctor(req.user._id, { page, limit }),
      this.svc.getDoctorStats(req.user._id),
    ])
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...list, stats },
          'Feedback fetched.'
        )
      )
  }

  // GET /api/v1/feedback/all  (admin — every review across the platform)
  async listAll(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const doctorId = req.query.doctorId || null
    const list = await this.svc.listAll({ page, limit, doctorId })
    return res
      .status(200)
      .json(new ApiResponse(200, list, 'Feedback fetched.'))
  }

  // GET /api/v1/feedback/leaderboard  (admin — per-doctor avg + total)
  async leaderboard(req, res) {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const rows = await this.svc.leaderboard({ limit })
    return res
      .status(200)
      .json(new ApiResponse(200, { items: rows }, 'Leaderboard fetched.'))
  }
}

export default FeedbackController
