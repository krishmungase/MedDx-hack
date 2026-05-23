import express from 'express'

import { logger } from '../../logger/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import { AdminController } from '../../controllers/index.js'
import {
  AppointmentModel,
  MedicalRecordModel,
  UserModel,
} from '../../models/index.js'
import {
  MailgenService,
  NotificationService,
  UserService,
} from '../../services/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import {
  ashaIdParamValidator,
  doctorIdParamValidator,
  registerAshaValidator,
  registerDoctorValidator,
  updateAshaStatusValidator,
  updateDoctorStatusValidator,
} from '../../validators/admin/admin.validators.js'

const adminRoutes = express.Router()

const userService = new UserService(UserModel)
const notificationService = new NotificationService()
const mailgenService = new MailgenService()

const adminController = new AdminController(
  userService,
  notificationService,
  mailgenService,
  AppointmentModel,
  MedicalRecordModel,
  logger
)

// Every admin route requires a JWT + admin role.
adminRoutes.use(verifyJWT, requireRole(UserRoles.ADMIN))

const routeDefinitions = [
  {
    path: '/register-doctor',
    method: 'post',
    validators: [registerDoctorValidator, validate],
    handler: adminController.registerDoctor.bind(adminController),
  },
  {
    path: '/doctors',
    method: 'get',
    validators: [],
    handler: adminController.listDoctors.bind(adminController),
  },
  {
    path: '/stats',
    method: 'get',
    validators: [],
    handler: adminController.getStats.bind(adminController),
  },
  {
    path: '/appointments',
    method: 'get',
    validators: [],
    handler: adminController.listAppointments.bind(adminController),
  },
  {
    path: '/audit-log',
    method: 'get',
    validators: [],
    handler: adminController.listAuditLog.bind(adminController),
  },
  {
    path: '/doctors/:id',
    method: 'patch',
    validators: [updateDoctorStatusValidator, validate],
    handler: adminController.updateDoctorStatus.bind(adminController),
  },
  {
    path: '/doctors/:id',
    method: 'delete',
    validators: [doctorIdParamValidator, validate],
    handler: adminController.removeDoctor.bind(adminController),
  },
  {
    path: '/register-asha',
    method: 'post',
    validators: [registerAshaValidator, validate],
    handler: adminController.registerAsha.bind(adminController),
  },
  {
    path: '/ashas',
    method: 'get',
    validators: [],
    handler: adminController.listAshas.bind(adminController),
  },
  {
    path: '/ashas/:id',
    method: 'patch',
    validators: [updateAshaStatusValidator, validate],
    handler: adminController.updateAshaStatus.bind(adminController),
  },
  {
    path: '/ashas/:id',
    method: 'delete',
    validators: [ashaIdParamValidator, validate],
    handler: adminController.removeAsha.bind(adminController),
  },
]

routeDefinitions.forEach((route) => {
  adminRoutes[route.method](
    route.path,
    ...route.validators,
    asyncHandler((req, res, next) => route.handler(req, res, next))
  )
})

export default adminRoutes
