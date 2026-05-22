import { ENV } from '../../config/index.js'
import { ApiError, ApiResponse } from '../../utils/index.js'
import {
  AppointmentStatus,
  ConsultationMode,
  PaymentStatus,
  SlotStatus,
  UserRoles,
} from '../../constants/index.js'

class AppointmentController {
  constructor(
    appointmentService,
    slotService,
    medicalRecordService,
    notificationService,
    mailgenService,
    icsService,
    logger
  ) {
    this.apptSvc = appointmentService
    this.slotSvc = slotService
    this.mrSvc = medicalRecordService
    this.notificationSvc = notificationService
    this.mailgenSvc = mailgenService
    this.icsSvc = icsService
    this.log = logger
  }

  // ── Book a slot (patient only) ─────────────────────────────────────────
  // POST /appointments/book { slotId }
  async book(req, res) {
    const { slotId } = req.body
    const patientId = req.user._id

    const slot = await this.slotSvc.findById(slotId)
    if (!slot) throw new ApiError(404, 'Slot not found.')
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(409, 'Sorry — that slot was just taken.')
    }
    if (new Date(slot.datetime).getTime() < Date.now()) {
      throw new ApiError(400, 'That slot is in the past.')
    }

    // Mark slot booked first (best-effort optimistic lock via the find).
    // A full transactional path is added in Phase 6 with payment.
    slot.status = SlotStatus.BOOKED
    await slot.save()

    let appointment
    try {
      appointment = await this.apptSvc.create({
        patientId,
        doctorId: slot.doctorId,
        slotId: slot._id,
        datetime: slot.datetime,
        status: AppointmentStatus.SCHEDULED,
        paymentStatus: PaymentStatus.FREE,
        mode: ConsultationMode.VIDEO,
      })
    } catch (err) {
      // Roll the slot back if the appointment insert fails
      slot.status = SlotStatus.AVAILABLE
      await slot.save()
      throw err
    }

    this.log.info({
      msg: 'Appointment booked',
      data: {
        appointmentId: appointment._id,
        patientId,
        doctorId: slot.doctorId,
        datetime: slot.datetime,
      },
    })

    const populated = await this.apptSvc.findByIdPopulated(appointment._id)

    // Best-effort: fire the calendar invites + emails. Never fail booking
    // because email/Gmail had a bad day.
    this.sendBookingInvites(populated).catch((err) =>
      this.log.warn({ msg: 'Booking invite send failed', error: err?.message })
    )

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { appointment: populated },
          'Appointment confirmed. Calendar invite is on its way.'
        )
      )
  }

  // GET /appointments/mine — patient's appointments
  async listMine(req, res) {
    const appointments = await this.apptSvc.findAll(
      { patientId: req.user._id },
      {
        sort: { datetime: -1 },
        populate: [
          { path: 'doctorId', select: 'name email specialty' },
          { path: 'slotId', select: 'datetime status' },
        ],
      }
    )
    return res
      .status(200)
      .json(
        new ApiResponse(200, { appointments }, 'Appointments fetched.')
      )
  }

  // GET /appointments/queue — doctor's queue (upcoming + scheduled today)
  async getQueue(req, res) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const appointments = await this.apptSvc.findAll(
      {
        doctorId: req.user._id,
        datetime: { $gte: start },
        status: { $ne: AppointmentStatus.CANCELLED },
      },
      {
        sort: { datetime: 1 },
        populate: [{ path: 'patientId', select: 'name email language' }],
      }
    )
    return res
      .status(200)
      .json(new ApiResponse(200, { appointments }, 'Queue fetched.'))
  }

  // GET /appointments/:id — both patient + doctor can fetch their own
  async getById(req, res) {
    const appt = await this.apptSvc.findByIdPopulated(req.params.id)
    if (!appt) throw new ApiError(404, 'Appointment not found.')
    if (!this.canAccess(appt, req.user)) {
      throw new ApiError(403, 'You do not have access to this appointment.')
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment: appt }, 'Appointment fetched.'))
  }

  // PATCH /appointments/:id/consultation — doctor only
  // Body: { doctorNotes, prescription }
  async submitConsultation(req, res) {
    const { doctorNotes, prescription } = req.body
    const appt = await this.apptSvc.findById(req.params.id)
    if (!appt) throw new ApiError(404, 'Appointment not found.')
    if (String(appt.doctorId) !== String(req.user._id)) {
      throw new ApiError(403, 'You can only submit notes on your own appointments.')
    }

    const updated = await this.apptSvc.updateById(req.params.id, {
      doctorNotes: doctorNotes || appt.doctorNotes || null,
      prescription: prescription ?? appt.prescription ?? null,
      status: AppointmentStatus.COMPLETED,
    })

    // Push into patient's MedicalRecord.consultations (find-or-create).
    await this.mrSvc.appendConsultation({
      patientId: appt.patientId,
      entry: {
        date: new Date(),
        doctorId: appt.doctorId,
        notes: updated.doctorNotes,
        prescription: updated.prescription,
        triageSummary: updated.triageSummary,
      },
    })

    this.log.info({
      msg: 'Consultation submitted',
      data: {
        appointmentId: updated._id,
        doctorId: updated.doctorId,
        patientId: updated.patientId,
      },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { appointment: updated },
          'Consultation saved and added to the patient’s record.'
        )
      )
  }

  // ── Calendar invite + email ─────────────────────────────────────────────
  async sendBookingInvites(populated) {
    if (!this.notificationSvc || !this.icsSvc || !this.mailgenSvc) return

    const slotStart = new Date(populated.datetime)
    const durationMins = populated.slotId?.durationMins || 30
    const slotEnd = new Date(slotStart.getTime() + durationMins * 60_000)
    const videoUrl = `${ENV.CLIENT_URL || ''}/video/${populated._id}`
    const appName = ENV.APP_NAME || 'MedDx'

    const doctor = populated.doctorId
    const patient = populated.patientId
    const doctorLabel = doctor?.name ? `Dr ${doctor.name}` : 'your doctor'
    const patientLabel = patient?.name || 'your patient'

    const formattedTime = slotStart.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    const recipients = [
      {
        role: 'patient',
        user: patient,
        summary: `${appName} consult with ${doctorLabel}`,
        intro: `Your ${appName} video consult with ${doctorLabel}${doctor?.specialty ? ` (${doctor.specialty})` : ''} is confirmed for ${formattedTime}.`,
      },
      {
        role: 'doctor',
        user: doctor,
        summary: `${appName} consult — ${patientLabel}`,
        intro: `${patientLabel} just booked a ${appName} video consult with you for ${formattedTime}.`,
      },
    ]

    for (const r of recipients) {
      if (!r.user?.email) continue

      const ics = this.icsSvc.buildInvite({
        uid: `${populated._id}-${r.role}`,
        start: slotStart,
        end: slotEnd,
        summary: r.summary,
        description: `${r.summary}\n\nJoin the room: ${videoUrl}\n\nYour calendar will remind you 10 minutes and 5 minutes before the call.`,
        location: videoUrl,
        attendee: { name: r.user.name, email: r.user.email },
      })

      const { emailHTML, emailText } = this.mailgenSvc.generateEmail({
        name: r.user.name,
        intro: r.intro,
        actionInstructions:
          'Tap below to open the video room. The attached invite drops the meeting into your calendar with reminders 10 minutes and 5 minutes before.',
        actionText: 'Open the video room',
        actionLink: videoUrl,
        outro: `If you need to reschedule, sign in to ${appName} and let us know.`,
      })

      try {
        await this.notificationSvc.send({
          to: r.user.email,
          subject: r.summary,
          text: emailText,
          html: emailHTML,
          icalEvent: {
            method: 'REQUEST',
            filename: 'invite.ics',
            content: ics,
          },
        })
        this.log.info({
          msg: 'Booking invite sent',
          data: { to: r.user.email, role: r.role, appointmentId: populated._id },
        })
      } catch (err) {
        this.log.warn({
          msg: 'Booking invite send failed',
          error: err?.message,
          to: r.user.email,
          role: r.role,
        })
      }
    }
  }

  // Helpers ────────────────────────────────────────────────────────────────
  canAccess(appt, user) {
    if (user.role === UserRoles.ADMIN) return true
    if (
      user.role === UserRoles.PATIENT &&
      String(appt.patientId._id || appt.patientId) === String(user._id)
    ) {
      return true
    }
    if (
      user.role === UserRoles.DOCTOR &&
      String(appt.doctorId._id || appt.doctorId) === String(user._id)
    ) {
      return true
    }
    return false
  }
}

export default AppointmentController
