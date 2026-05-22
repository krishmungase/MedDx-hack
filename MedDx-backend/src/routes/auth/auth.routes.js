import express from 'express'

import { logger } from '../../logger/index.js'
import { UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate } from '../../middlewares/index.js'
import { AuthController } from '../../controllers/index.js'
import {
  HashService,
  MailgenService,
  NotificationService,
  TokenService,
  UploadService,
  UserService,
} from '../../services/index.js'

import {
  emailValidator,
  loginValidator,
  passwordValidator,
  registerValidator,
  tokenValidator,
} from '../../validators/auth/user.validators.js'

const authRoutes = express.Router()

const hashService = new HashService()
const tokenService = new TokenService()
const uploadService = new UploadService()
const userService = new UserService(UserModel)
const mailgenService = new MailgenService()
const notificationService = new NotificationService()

const authController = new AuthController(
  userService,
  tokenService,
  hashService,
  notificationService,
  mailgenService,
  uploadService,
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
    path: '/verify-email',
    method: 'post',
    validators: [passwordValidator, validate],
    handler: authController.verifyEmail.bind(authController),
  },
  {
    path: '/login',
    method: 'post',
    validators: [loginValidator, validate],
    handler: authController.login.bind(authController),
  },
  {
    path: '/forgot-password',
    method: 'post',
    validators: [emailValidator, validate],
    handler: authController.forgotPassword.bind(authController),
  },
  {
    path: '/reset-password',
    method: 'post',
    validators: [passwordValidator, validate],
    handler: authController.resetPassword.bind(authController),
  },
  {
    path: '/me',
    method: 'post',
    validators: [tokenValidator, validate],
    handler: authController.me.bind(authController),
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
