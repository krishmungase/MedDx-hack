import express from 'express'
import { param } from 'express-validator'

import { UserModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate } from '../../middlewares/index.js'
import { UserService } from '../../services/index.js'
import { DoctorController } from '../../controllers/index.js'

const doctorRoutes = express.Router()

const userService = new UserService(UserModel)
const doctorController = new DoctorController(userService)

doctorRoutes.get(
  '/',
  asyncHandler((req, res, next) => doctorController.listActive(req, res, next))
)

doctorRoutes.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid doctor id'),
  validate,
  asyncHandler((req, res, next) => doctorController.getById(req, res, next))
)

export default doctorRoutes
