import express from 'express'

import { logger } from '../../logger/index.js'
import {
  AppointmentModel,
  MedicalRecordModel,
  SlotModel,
} from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import {
  AppointmentService,
  IcsService,
  MailgenService,
  MedicalRecordService,
  NotificationService,
  SlotService,
} from '../../services/index.js'
import { AppointmentController } from '../../controllers/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import {
  bookValidator,
  idParamValidator,
  submitConsultationValidator,
} from '../../validators/appointment/appointment.validators.js'
import { ENV } from '../../config/index.js'

const appointmentRoutes = express.Router()

const apptService = new AppointmentService(AppointmentModel)
const slotService = new SlotService(SlotModel)
const mrService = new MedicalRecordService(MedicalRecordModel)
const notificationService = new NotificationService()
const mailgenService = new MailgenService()
const icsService = new IcsService({
  appName: ENV.APP_NAME || 'MedDx',
  organizerEmail: ENV.GMAIL_USER,
})

const apptController = new AppointmentController(
  apptService,
  slotService,
  mrService,
  notificationService,
  mailgenService,
  icsService,
  logger
)

appointmentRoutes.use(verifyJWT)

// Patient: book a slot
appointmentRoutes.post(
  '/book',
  requireRole(UserRoles.PATIENT),
  bookValidator,
  validate,
  asyncHandler((req, res, next) => apptController.book(req, res, next))
)

// Patient: my appointments
appointmentRoutes.get(
  '/mine',
  requireRole(UserRoles.PATIENT),
  asyncHandler((req, res, next) => apptController.listMine(req, res, next))
)

// Doctor: queue
appointmentRoutes.get(
  '/queue',
  requireRole(UserRoles.DOCTOR),
  asyncHandler((req, res, next) => apptController.getQueue(req, res, next))
)

// Shared (patient/doctor/admin) — controller does access check
appointmentRoutes.get(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler((req, res, next) => apptController.getById(req, res, next))
)

// Doctor: submit consultation notes
appointmentRoutes.patch(
  '/:id/consultation',
  requireRole(UserRoles.DOCTOR),
  submitConsultationValidator,
  validate,
  asyncHandler((req, res, next) =>
    apptController.submitConsultation(req, res, next)
  )
)

export default appointmentRoutes
