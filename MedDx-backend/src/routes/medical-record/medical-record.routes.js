import express from 'express'

import { logger } from '../../logger/index.js'
import { asyncHandler } from '../../utils/index.js'
import { validate, verifyJWT } from '../../middlewares/index.js'
import {
  AppointmentModel,
  MedicalRecordModel,
} from '../../models/index.js'
import {
  AppointmentService,
  MedicalRecordService,
} from '../../services/index.js'
import { MedicalRecordController } from '../../controllers/index.js'
import { patientIdParamValidator } from '../../validators/medical-record/medical-record.validators.js'

const medicalRecordRoutes = express.Router()

const mrService = new MedicalRecordService(MedicalRecordModel)
const apptService = new AppointmentService(AppointmentModel)
const mrController = new MedicalRecordController(mrService, apptService, logger)

medicalRecordRoutes.use(verifyJWT)

medicalRecordRoutes.get(
  '/:patientId',
  patientIdParamValidator,
  validate,
  asyncHandler((req, res, next) => mrController.getByPatient(req, res, next))
)

export default medicalRecordRoutes
