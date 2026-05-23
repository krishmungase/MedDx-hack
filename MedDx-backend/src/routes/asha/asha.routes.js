import express from 'express'

import { logger } from '../../logger/index.js'
import {
  AppointmentModel,
  MedicalRecordModel,
  VillagePatientModel,
} from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import {
  MedicalRecordService,
  VillagePatientService,
} from '../../services/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import {
  addPatientValidator,
  villagePatientIdParamValidator,
} from '../../validators/asha/asha.validators.js'
import AshaController from '../../controllers/asha/asha.controllers.js'

const ashaRoutes = express.Router()

const vpService = new VillagePatientService(VillagePatientModel)
const mrService = new MedicalRecordService(MedicalRecordModel)
const ashaController = new AshaController(
  vpService,
  mrService,
  AppointmentModel,
  logger
)

ashaRoutes.use(verifyJWT, requireRole(UserRoles.ASHA))

ashaRoutes.post(
  '/patients',
  addPatientValidator,
  validate,
  asyncHandler((req, res, next) => ashaController.addPatient(req, res, next))
)

ashaRoutes.get(
  '/patients',
  asyncHandler((req, res, next) =>
    ashaController.listMyPatients(req, res, next)
  )
)

ashaRoutes.get(
  '/patients/:id',
  villagePatientIdParamValidator,
  validate,
  asyncHandler((req, res, next) => ashaController.getPatient(req, res, next))
)

ashaRoutes.get(
  '/dashboard',
  asyncHandler((req, res, next) =>
    ashaController.dashboardStats(req, res, next)
  )
)

export default ashaRoutes
