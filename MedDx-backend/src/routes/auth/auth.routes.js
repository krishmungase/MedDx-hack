import express from 'express'

import { logger } from '../../logger/index.js'
import { UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate } from '../../middlewares/index.js'
import { AuthController } from '../../controllers/index.js'
import {
  HashService,
  TokenService,
  UserService,
} from '../../services/index.js'

import {
  loginValidator,
  registerValidator,
} from '../../validators/auth/user.validators.js'

const authRoutes = express.Router()

const hashService = new HashService()
const tokenService = new TokenService()
const userService = new UserService(UserModel)

const authController = new AuthController(
  userService,
  tokenService,
  hashService,
  logger
)

const routeDefinitions = [
  {
    path: '/register',
    method: 'post',
    validators: [registerValidator, validate],
    handler: authController.register.bind(authController),
  },
  {
    path: '/login',
    method: 'post',
    validators: [loginValidator, validate],
    handler: authController.login.bind(authController),
  },
]

routeDefinitions.forEach((route) => {
  authRoutes[route.method](
    route.path,
    ...route.validators,
    asyncHandler((req, res, next) => route.handler(req, res, next))
  )
})

export default authRoutes
