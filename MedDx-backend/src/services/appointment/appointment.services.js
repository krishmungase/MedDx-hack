class AppointmentService {
  constructor(model) {
    this.model = model
  }

  async findById(id) {
    return await this.model.findById(id)
  }

  async findByIdPopulated(id) {
    return await this.model
      .findById(id)
      .populate('doctorId', 'name email specialty')
      .populate('patientId', 'name email')
      .populate('slotId', 'datetime durationMins status')
  }

  async create(data) {
    return await this.model.create(data)
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true })
  }

  async findAll(filter = {}, { sort = { datetime: 1 }, populate } = {}) {
    let q = this.model.find(filter).sort(sort)
    if (populate) {
      for (const p of populate) q = q.populate(p)
    }
    return await q
  }
}

export default AppointmentService
