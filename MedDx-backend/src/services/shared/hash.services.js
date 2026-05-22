import bcrypt from 'bcrypt'

class HashService {
  async hashData(data) {
    const SALT = 10
    return await bcrypt.hash(data, SALT)
  }

  async hashCompare(data, hashData) {
    return await bcrypt.compare(data, hashData)
  }
}

export default HashService
