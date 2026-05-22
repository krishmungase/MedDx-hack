class TransactionService {
  constructor(model) {
    this.model = model
  }

  async create(data) {
    return await this.model.create(data)
  }

  async findByDoctor(doctorId, { limit = 50 } = {}) {
    return await this.model
      .find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patientId', 'name email')
      .populate('appointmentId', 'datetime status')
  }

  async findByPatient(patientId, { limit = 50 } = {}) {
    return await this.model
      .find({ patientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('doctorId', 'name email specialty')
      .populate('appointmentId', 'datetime status')
  }

  async sumDoctorEarnings(doctorId) {
    const out = await this.model.aggregate([
      { $match: { doctorId } },
      { $group: { _id: null, total: { $sum: '$doctorEarning' } } },
    ])
    return out[0]?.total || 0
  }
}

export default TransactionService
