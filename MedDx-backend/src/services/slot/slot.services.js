class SlotService {
  constructor(model) {
    this.model = model
  }

  async findById(id) {
    return await this.model.findById(id)
  }

  async findAll(filter = {}, { sort = { datetime: 1 } } = {}) {
    return await this.model.find(filter).sort(sort)
  }

  async createMany(docs) {
    return await this.model.insertMany(docs, { ordered: true })
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id)
  }

  /**
   * Returns existing slots that fall inside [start, end) for the given doctor.
   * Used to detect collisions before inserting a new batch.
   */
  async findInRange({ doctorId, start, end }) {
    return await this.model
      .find({
        doctorId,
        datetime: { $gte: start, $lt: end },
      })
      .sort({ datetime: 1 })
  }

  async findFutureByDoctor({ doctorId, statuses = ['available'] } = {}) {
    return await this.model
      .find({
        doctorId,
        datetime: { $gte: new Date() },
        status: { $in: statuses },
      })
      .sort({ datetime: 1 })
  }
}

export default SlotService
