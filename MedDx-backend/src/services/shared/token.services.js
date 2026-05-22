import jwt from 'jsonwebtoken'

import { ENV } from '../../config/index.js'

class TokenService {
  async signToken(payload, exp = '30 days') {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
      expiresIn: exp,
      algorithm: 'HS256',
    })
  }

  verifyToken(token) {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET)
  }
}

export default TokenService
