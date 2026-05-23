import express from 'express'

import { logger } from '../../logger/index.js'
import { FeedbackService } from '../../services/index.js'
import { FeedbackModel, AppointmentModel } from '../../models/index.js'
import FeedbackController from '../../controllers/feedback/feedback.controllers.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import {
  appointmentIdParamValidator,
  feedbackSubmitValidator,
} from '../../validators/feedback/feedback.validators.js'

const feedbackRoutes = express.Router()

const service = new FeedbackService(FeedbackModel, AppointmentModel)
const controller = new FeedbackController(service, logger)

feedbackRoutes.use(verifyJWT)

// Patient: submit feedback for a completed consultation
feedbackRoutes.post(
  '/',
  requireRole(UserRoles.PATIENT),
  feedbackSubmitValidator,
  validate,
  asyncHandler((req, res, next) => controller.submit(req, res, next))
)

// Patient: check if feedback was already left for a given appointment
feedbackRoutes.get(
  '/appointment/:id',
  appointmentIdParamValidator,
  validate,
  asyncHandler((req, res, next) =>
    controller.getByAppointment(req, res, next)
  )
)

// Doctor: list anonymized feedback about me + my stats
feedbackRoutes.get(
  '/doctor/me',
  requireRole(UserRoles.DOCTOR),
  asyncHandler((req, res, next) => controller.listForMe(req, res, next))
)

// Admin: full firehose (filterable by doctorId)
feedbackRoutes.get(
  '/all',
  requireRole(UserRoles.ADMIN),
  asyncHandler((req, res, next) => controller.listAll(req, res, next))
)

// Admin: per-doctor avg / total leaderboard
feedbackRoutes.get(
  '/leaderboard',
  requireRole(UserRoles.ADMIN),
  asyncHandler((req, res, next) => controller.leaderboard(req, res, next))
)

export default feedbackRoutes
