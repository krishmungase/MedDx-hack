import { Types } from 'mongoose'

class FeedbackService {
  constructor(feedbackModel, appointmentModel) {
    this.model = feedbackModel
    this.appointmentModel = appointmentModel
  }

  // Patient submits feedback for a completed consultation they own.
  // Returns the saved feedback document, or throws an Error with `.code` set
  // for the controller to map to a meaningful HTTP status.
  async submit({ appointmentId, patientId, rating, comment }) {
    const appt = await this.appointmentModel.findById(appointmentId).lean()
    if (!appt) {
      const e = new Error('Appointment not found.')
      e.code = 'NOT_FOUND'
      throw e
    }
    if (String(appt.patientId) !== String(patientId)) {
      const e = new Error('You can only rate your own consultations.')
      e.code = 'FORBIDDEN'
      throw e
    }
    if (appt.status !== 'completed') {
      const e = new Error(
        'Feedback can only be left after the consultation is completed.'
      )
      e.code = 'CONFLICT'
      throw e
    }

    const existing = await this.model.findOne({ appointmentId }).lean()
    if (existing) {
      const e = new Error('You already rated this consultation.')
      e.code = 'CONFLICT'
      throw e
    }

    return this.model.create({
      appointmentId,
      patientId,
      doctorId: appt.doctorId,
      rating,
      comment: comment || '',
    })
  }

  async getByAppointment(appointmentId) {
    return this.model.findOne({ appointmentId }).lean()
  }

  // Anonymized list for the doctor — no patient name returned.
  async listForDoctor(doctorId, { page = 1, limit = 20 } = {}) {
    const skip = (Math.max(1, page) - 1) * limit
    const [items, total] = await Promise.all([
      this.model
        .find({ doctorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('appointmentId', 'datetime')
        .select('-patientId')
        .lean(),
      this.model.countDocuments({ doctorId }),
    ])
    return { items, total, page, limit }
  }

  // Full list for admin, including patient name.
  async listAll({ page = 1, limit = 20, doctorId = null } = {}) {
    const filter = {}
    if (doctorId) filter.doctorId = doctorId
    const skip = (Math.max(1, page) - 1) * limit
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email specialty')
        .populate('appointmentId', 'datetime')
        .lean(),
      this.model.countDocuments(filter),
    ])
    return { items, total, page, limit }
  }

  // Aggregate stats — average rating, count, and a 1-5 histogram. Used by
  // the doctor's own feedback page and by admin doctor cards.
  async getDoctorStats(doctorId) {
    const id = new Types.ObjectId(String(doctorId))
    const [agg] = await this.model.aggregate([
      { $match: { doctorId: id } },
      {
        $group: {
          _id: '$doctorId',
          total: { $sum: 1 },
          avg: { $avg: '$rating' },
          ratings: { $push: '$rating' },
        },
      },
    ])
    if (!agg) {
      return {
        total: 0,
        avg: 0,
        histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of agg.ratings) histogram[r] = (histogram[r] || 0) + 1
    return {
      total: agg.total,
      avg: Math.round(agg.avg * 10) / 10,
      histogram,
    }
  }

  // For the admin's at-a-glance — list of { doctorId, avg, total } for every
  // doctor who has at least one rating, sorted by avg desc.
  async leaderboard({ limit = 20 } = {}) {
    return this.model.aggregate([
      {
        $group: {
          _id: '$doctorId',
          total: { $sum: 1 },
          avg: { $avg: '$rating' },
        },
      },
      { $sort: { avg: -1, total: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          total: 1,
          avg: { $round: ['$avg', 1] },
          name: '$doctor.name',
          email: '$doctor.email',
          specialty: '$doctor.specialty',
        },
      },
    ])
  }
}

export default FeedbackService
