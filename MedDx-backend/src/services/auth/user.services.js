class UserService {
  constructor(model) {
    this.model = model
  }

  async findById(id) {
    return await this.model.findById(id)
  }

  async findByEmail(email) {
    return await this.model.findOne({ email })
  }

  async findOne(filter) {
    return await this.model.findOne(filter)
  }

  async create(data) {
    return await this.model.create(data)
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id)
  }

  async findAll(filter = {}, { select } = {}) {
    let q = this.model.find(filter).sort({ createdAt: -1 })
    if (select) q = q.select(select)
    return await q
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter)
  }
}

export default UserService
