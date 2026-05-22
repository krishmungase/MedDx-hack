import express from 'express'

import { logger } from '../../logger/index.js'
import {
  PrescriptionFormatterService,
  TriageService,
} from '../../services/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import { triageValidator } from '../../validators/ai/triage.validators.js'
import { prescriptionFormatValidator } from '../../validators/ai/prescription.validators.js'
import TriageController from '../../controllers/ai/triage.controllers.js'
import PrescriptionController from '../../controllers/ai/prescription.controllers.js'

const aiRoutes = express.Router()

const triageService = new TriageService()
const triageController = new TriageController(triageService, logger)

const formatterService = new PrescriptionFormatterService()
const prescriptionController = new PrescriptionController(
  formatterService,
  logger
)

aiRoutes.use(verifyJWT)

aiRoutes.post(
  '/triage',
  triageValidator,
  validate,
  asyncHandler((req, res, next) => triageController.assess(req, res, next))
)

// Doctor-only: helps the doctor format raw notes into structured Rx.
aiRoutes.post(
  '/prescription/format',
  requireRole(UserRoles.DOCTOR),
  prescriptionFormatValidator,
  validate,
  asyncHandler((req, res, next) =>
    prescriptionController.format(req, res, next)
  )
)

export default aiRoutes
