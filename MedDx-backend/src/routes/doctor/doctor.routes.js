import express from 'express'
import { param } from 'express-validator'

import {
  AppointmentModel,
  TransactionModel,
  UserModel,
} from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate, verifyJWT } from '../../middlewares/index.js'
import { TransactionService, UserService } from '../../services/index.js'
import { DoctorController } from '../../controllers/index.js'

const doctorRoutes = express.Router()

const userService = new UserService(UserModel)
const transactionService = new TransactionService(TransactionModel)
const doctorController = new DoctorController(
  userService,
  transactionService,
  AppointmentModel
)

// Public list (used by patients searching for specialists)
doctorRoutes.get(
  '/',
  asyncHandler((req, res, next) => doctorController.listActive(req, res, next))
)

// Doctor's own earnings (authenticated)
doctorRoutes.get(
  '/me/earnings',
  verifyJWT,
  asyncHandler((req, res, next) =>
    doctorController.getMyEarnings(req, res, next)
  )
)

// Doctor's own prescription history (authenticated)
doctorRoutes.get(
  '/me/prescriptions',
  verifyJWT,
  asyncHandler((req, res, next) =>
    doctorController.getMyPrescriptions(req, res, next)
  )
)

doctorRoutes.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid doctor id'),
  validate,
  asyncHandler((req, res, next) => doctorController.getById(req, res, next))
)

export default doctorRoutes
