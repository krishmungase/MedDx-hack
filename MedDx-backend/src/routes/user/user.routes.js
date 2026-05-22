import express from 'express'

import { logger } from '../../logger/index.js'
import { UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate, verifyJWT } from '../../middlewares/index.js'
import { UserController } from '../../controllers/index.js'
import { HashService, UserService } from '../../services/index.js'

import {
  updateProfileValidator,
  changePasswordValidator,
} from '../../validators/user/user.validators.js'

const userRoutes = express.Router()

const hashService = new HashService()
const userService = new UserService(UserModel)

const userController = new UserController(userService, hashService, logger)

// Every endpoint in this module operates on the authenticated user.
userRoutes.use(verifyJWT)

userRoutes.get(
  '/me',
  asyncHandler((req, res, next) => userController.getMe(req, res, next))
)

userRoutes.patch(
  '/me',
  updateProfileValidator,
  validate,
  asyncHandler((req, res, next) => userController.updateMe(req, res, next))
)

userRoutes.post(
  '/change-password',
  changePasswordValidator,
  validate,
  asyncHandler((req, res, next) =>
    userController.changePassword(req, res, next)
  )
)

export default userRoutes
