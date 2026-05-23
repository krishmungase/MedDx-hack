import express from 'express'

import { logger } from '../../logger/index.js'
import {
  AppointmentModel,
  MedicalRecordModel,
  SlotModel,
  TransactionModel,
  UserModel,
  VillagePatientModel,
} from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import {
  AppointmentService,
  DailyService,
  IcsService,
  MailgenService,
  MedicalRecordService,
  NotificationService,
  PaymentService,
  SlotService,
  TransactionService,
  UserService,
  VillagePatientService,
} from '../../services/index.js'
import { AppointmentController } from '../../controllers/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
  verifyPermission,
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
const userService = new UserService(UserModel)
const paymentService = new PaymentService()
const transactionService = new TransactionService(TransactionModel)
const notificationService = new NotificationService()
const mailgenService = new MailgenService()
const icsService = new IcsService({
  appName: ENV.APP_NAME || 'MedDx',
  organizerEmail: ENV.GMAIL_USER,
})
const dailyService = new DailyService()
const vpService = new VillagePatientService(VillagePatientModel)

const apptController = new AppointmentController(
  apptService,
  slotService,
  mrService,
  userService,
  paymentService,
  transactionService,
  notificationService,
  mailgenService,
  icsService,
  dailyService,
  vpService,
  logger
)

appointmentRoutes.use(verifyJWT)

// Patient OR ASHA: book a slot. ASHA bookings include villagePatientId
// in the body and are attributed via bookedByAshaId on the appointment.
appointmentRoutes.post(
  '/book',
  verifyPermission([UserRoles.PATIENT, UserRoles.ASHA]),
  bookValidator,
  validate,
  asyncHandler((req, res, next) => apptController.book(req, res, next))
)

// Patient OR ASHA: verify Razorpay payment and finalise the booking
appointmentRoutes.post(
  '/verify-payment',
  verifyPermission([UserRoles.PATIENT, UserRoles.ASHA]),
  asyncHandler((req, res, next) =>
    apptController.verifyPayment(req, res, next)
  )
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

// Shared (patient/doctor/admin/asha) — controller does access check
appointmentRoutes.get(
  '/:id',
  idParamValidator,
  validate,
  asyncHandler((req, res, next) => apptController.getById(req, res, next))
)

// Video session URL + token (Daily.co, with Jitsi fallback)
appointmentRoutes.get(
  '/:id/video-session',
  idParamValidator,
  validate,
  asyncHandler((req, res, next) =>
    apptController.getVideoSession(req, res, next)
  )
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
