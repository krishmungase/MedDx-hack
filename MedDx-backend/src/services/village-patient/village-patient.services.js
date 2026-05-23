class VillagePatientService {
  constructor(model) {
    this.model = model
  }

  async create(data) {
    return await this.model.create(data)
  }

  async findById(id) {
    return await this.model.findById(id)
  }

  async findByIdForAsha(id, ashaId) {
    // Ownership check baked in: only return if it belongs to this ASHA.
    return await this.model.findOne({ _id: id, ashaId })
  }

  async listByAsha(ashaId, { search } = {}) {
    const filter = { ashaId }
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' }
    }
    return await this.model.find(filter).sort({ createdAt: -1 })
  }

  async updateById(id, patch) {
    return await this.model.findByIdAndUpdate(id, patch, { new: true })
  }

  async countByAsha(ashaId) {
    return await this.model.countDocuments({ ashaId })
  }
}

export default VillagePatientService
