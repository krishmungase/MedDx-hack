import express from 'express'

import { logger } from '../../logger/index.js'
import { SlotModel } from '../../models/index.js'
import { asyncHandler } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'
import { SlotService } from '../../services/index.js'
import { SlotController } from '../../controllers/index.js'
import {
  requireRole,
  validate,
  verifyJWT,
} from '../../middlewares/index.js'
import {
  doctorIdParamValidator,
  generateSlotsValidator,
  slotIdParamValidator,
} from '../../validators/slot/slot.validators.js'

const slotRoutes = express.Router()

const slotService = new SlotService(SlotModel)
const slotController = new SlotController(slotService, logger)

// Public route: list available future slots by doctor (used by patients in Phase 4)
slotRoutes.get(
  '/by-doctor/:doctorId',
  doctorIdParamValidator,
  validate,
  asyncHandler((req, res, next) =>
    slotController.listAvailableByDoctor(req, res, next)
  )
)

// Doctor-only routes below
slotRoutes.use(verifyJWT, requireRole(UserRoles.DOCTOR))

slotRoutes.post(
  '/',
  generateSlotsValidator,
  validate,
  asyncHandler((req, res, next) => slotController.generateSlots(req, res, next))
)

slotRoutes.get(
  '/mine',
  asyncHandler((req, res, next) => slotController.listMine(req, res, next))
)

slotRoutes.delete(
  '/:id',
  slotIdParamValidator,
  validate,
  asyncHandler((req, res, next) => slotController.deleteSlot(req, res, next))
)

export default slotRoutes
