import jwt from 'jsonwebtoken'

import { ENV } from '../../config/index.js'

class TokenService {
  async signToken(payload, exp = '30 days') {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: exp,
      algorithm: 'HS256',
    })
  }

  verifyToken(token) {
    return jwt.verify(token, ENV.JWT_SECRET)
  }
}

export default TokenService
