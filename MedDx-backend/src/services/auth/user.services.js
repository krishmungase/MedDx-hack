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

  async create(data) {
    return await this.model.create(data)
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true })
  }

  async findAll(filter = {}) {
    return await this.model.find(filter).sort({ createdAt: -1 })
  }
}

export default UserService
