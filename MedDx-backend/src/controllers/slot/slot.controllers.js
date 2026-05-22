import { ApiError, ApiResponse } from '../../utils/index.js'
import { SlotStatus } from '../../constants/index.js'

const SLOT_MS = 30 * 60 * 1000 // 30 minutes

class SlotController {
  constructor(slotService, logger) {
    this.slotSvc = slotService
    this.log = logger
  }

  // POST /slots — doctor adds availability for a date+time range.
  // Body: { startDateTime: ISOString, endDateTime: ISOString }
  async generateSlots(req, res) {
    const doctorId = req.user._id
    const { startDateTime, endDateTime } = req.body

    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new ApiError(400, 'startDateTime and endDateTime must be valid dates.')
    }
    if (end.getTime() <= start.getTime()) {
      throw new ApiError(400, 'endDateTime must be after startDateTime.')
    }
    if (start.getTime() < Date.now() - 60_000) {
      // tolerate ~1 min clock drift
      throw new ApiError(400, 'Availability cannot start in the past.')
    }
    if (end.getTime() - start.getTime() > 12 * 60 * 60 * 1000) {
      throw new ApiError(
        400,
        'Availability range cannot exceed 12 hours in a single submission.'
      )
    }

    // Build the 30-min cursor list
    const proposed = []
    for (
      let t = start.getTime();
      t + SLOT_MS <= end.getTime();
      t += SLOT_MS
    ) {
      proposed.push(new Date(t))
    }

    if (proposed.length === 0) {
      throw new ApiError(
        400,
        'Range is shorter than 30 minutes. Pick at least one 30-minute window.'
      )
    }

    // Reject if ANY existing slot conflicts with the new range
    const conflicts = await this.slotSvc.findInRange({
      doctorId,
      start,
      end,
    })
    if (conflicts.length > 0) {
      throw new ApiError(
        409,
        `That range overlaps ${conflicts.length} existing slot${conflicts.length === 1 ? '' : 's'}. Pick a different range or delete the overlap first.`
      )
    }

    const created = await this.slotSvc.createMany(
      proposed.map((datetime) => ({
        doctorId,
        datetime,
        durationMins: 30,
        status: SlotStatus.AVAILABLE,
      }))
    )

    this.log.info({
      msg: 'Doctor created availability slots',
      data: {
        doctorId,
        count: created.length,
        from: start.toISOString(),
        to: end.toISOString(),
      },
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { slots: created },
          `${created.length} slot${created.length === 1 ? '' : 's'} added.`
        )
      )
  }

  // GET /slots/mine — doctor lists their own slots (all statuses)
  async listMine(req, res) {
    const slots = await this.slotSvc.findAll({ doctorId: req.user._id })
    return res
      .status(200)
      .json(new ApiResponse(200, { slots }, 'Slots fetched.'))
  }

  // DELETE /slots/:id — doctor deletes an available slot
  async deleteSlot(req, res) {
    const { id } = req.params
    const slot = await this.slotSvc.findById(id)
    if (!slot) throw new ApiError(404, 'Slot not found.')
    if (String(slot.doctorId) !== String(req.user._id)) {
      throw new ApiError(403, 'You can only delete your own slots.')
    }
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(
        400,
        'This slot is already booked. Cancel the appointment first.'
      )
    }
    await this.slotSvc.deleteById(id)
    return res.status(200).json(new ApiResponse(200, { id }, 'Slot deleted.'))
  }

  // GET /slots/by-doctor/:doctorId — public; future available slots only
  async listAvailableByDoctor(req, res) {
    const { doctorId } = req.params
    const slots = await this.slotSvc.findFutureByDoctor({ doctorId })
    return res
      .status(200)
      .json(new ApiResponse(200, { slots }, 'Slots fetched.'))
  }
}

export default SlotController
