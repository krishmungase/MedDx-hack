import { ENV } from '../../config/index.js'
import { ApiError, ApiResponse } from '../../utils/index.js'
import {
  AppointmentStatus,
  ConsultationMode,
  PaymentStatus,
  SlotStatus,
  TransactionType,
  TriageUrgency,
  UserRoles,
} from '../../constants/index.js'
import {
  CONSULT_FEE_PAISE,
  splitFee,
} from '../../constants/pricing.js'

class AppointmentController {
  constructor(
    appointmentService,
    slotService,
    medicalRecordService,
    userService,
    paymentService,
    transactionService,
    notificationService,
    mailgenService,
    icsService,
    dailyService,
    villagePatientService,
    logger
  ) {
    this.apptSvc = appointmentService
    this.slotSvc = slotService
    this.mrSvc = medicalRecordService
    this.userSvc = userService
    this.paymentSvc = paymentService
    this.transactionSvc = transactionService
    this.notificationSvc = notificationService
    this.mailgenSvc = mailgenService
    this.icsSvc = icsService
    this.dailySvc = dailyService
    this.vpSvc = villagePatientService
    this.log = logger
  }

  // Determine whether the booking should bypass payment.
  // Two cases qualify, per project spec:
  //   1) Subject hasn't used their free first consult yet (patient OR villager).
  //   2) Triage assessed this case as an emergency.
  isFreeConsult(subject, triageUrgency) {
    if (!subject?.freeConsultationUsed) return true
    if (triageUrgency === TriageUrgency.EMERGENCY) return true
    return false
  }

  // Resolve the ASHA-assisted booking subject. Returns { villagePatient, asha }
  // when both are valid, throws otherwise. The ASHA must own the villager.
  async resolveAshaSubject(req, villagePatientId) {
    if (req.user.role !== UserRoles.ASHA) {
      throw new ApiError(
        403,
        'Only an ASHA can book on behalf of a village patient.'
      )
    }
    if (!this.vpSvc) {
      throw new ApiError(500, 'Village patient service not configured.')
    }
    const villager = await this.vpSvc.findByIdForAsha(
      villagePatientId,
      req.user._id
    )
    if (!villager) {
      throw new ApiError(404, 'Villager not in your roster.')
    }
    return { villager, asha: req.user }
  }

  // ── Book a slot (patient only) ─────────────────────────────────────────
  // POST /appointments/book { slotId, triageSummary?, triageUrgency?, demoSkipPayment? }
  //
  // Two response shapes:
  //   { paymentRequired: false, appointment }   — free path, slot locked, done
  //   { paymentRequired: true,  order, ... }    — Razorpay order created;
  //                                              client opens checkout, then
  //                                              calls /payments/verify
  //
  // `demoSkipPayment` is honored only when NODE_ENV !== 'production'. It lets
  // hackathon demos walk through the paid flow even when the patient's
  // browser blocks Razorpay's CDN (ad-blockers, corporate DNS, etc).
  async book(req, res) {
    const {
      slotId,
      triageSummary,
      triageUrgency,
      demoSkipPayment,
      villagePatientId,
    } = req.body

    const slot = await this.slotSvc.findById(slotId)
    if (!slot) throw new ApiError(404, 'Slot not found.')
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(409, 'Sorry — that slot was just taken.')
    }
    if (new Date(slot.datetime).getTime() < Date.now()) {
      throw new ApiError(400, 'That slot is in the past.')
    }

    // Determine the booking "subject" — either the logged-in patient OR
    // the village patient an ASHA is booking for.
    let subject = req.user
    let villager = null
    if (villagePatientId) {
      const resolved = await this.resolveAshaSubject(req, villagePatientId)
      villager = resolved.villager
      subject = villager // freebie accounting, free-consult check
    } else if (req.user.role === UserRoles.ASHA) {
      throw new ApiError(
        400,
        'ASHA bookings must include a villagePatientId.'
      )
    }

    const free = this.isFreeConsult(subject, triageUrgency)
    const isDev = ENV.NODE_ENV !== 'production'

    const ctx = { slot, triageSummary, triageUrgency, villager }

    if (free) {
      return this.confirmFreeBooking(req, res, ctx)
    }

    // Dev-mode escape hatch: confirm a paid booking without going through
    // Razorpay. Slot still locks, an appointment is created with
    // paymentStatus='paid', and a Transaction row is written so doctor
    // earnings + the admin dashboard still look right.
    if (demoSkipPayment && isDev) {
      return this.confirmPaidBookingDemo(req, res, ctx)
    }

    // Paid path — create Razorpay order. We deliberately do NOT lock the
    // slot here. The slot is locked inside /payments/verify after signature
    // verification succeeds, so an abandoned checkout doesn't strand a slot.
    if (!this.paymentSvc?.isConfigured) {
      throw new ApiError(
        503,
        'Payments are not configured yet. Please ask the admin to set Razorpay test keys.'
      )
    }

    let order
    try {
      order = await this.paymentSvc.createOrder({
        amountPaise: CONSULT_FEE_PAISE,
        slotId: slot._id,
        patientId: req.user._id,
      })
    } catch (err) {
      this.log.error({ msg: 'Razorpay order failed', error: err?.message })
      throw new ApiError(502, 'Could not start payment. Please try again.')
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentRequired: true,
          order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
          },
          keyId: ENV.RAZORPAY_KEY_ID,
          slotId: String(slot._id),
          // Echo triage context back so the client can pass it to /verify.
          triageSummary: triageSummary || null,
          triageUrgency: triageUrgency || null,
          villagePatientId: villager ? String(villager._id) : null,
        },
        'Razorpay order created. Complete payment to confirm the slot.'
      )
    )
  }

  // ── Free / emergency booking path ──────────────────────────────────────
  // `villager` is non-null for ASHA-assisted bookings.
  async confirmFreeBooking(req, res, { slot, triageSummary, triageUrgency, villager }) {
    slot.status = SlotStatus.BOOKED
    await slot.save()

    const apptDoc = {
      doctorId: slot.doctorId,
      slotId: slot._id,
      datetime: slot.datetime,
      status: AppointmentStatus.SCHEDULED,
      paymentStatus: PaymentStatus.FREE,
      mode: ConsultationMode.VIDEO,
      triageSummary: triageSummary || null,
      triageUrgency: triageUrgency || null,
    }
    if (villager) {
      apptDoc.villagePatientId = villager._id
      apptDoc.bookedByAshaId = req.user._id
    } else {
      apptDoc.patientId = req.user._id
    }

    let appointment
    try {
      appointment = await this.apptSvc.create(apptDoc)
    } catch (err) {
      slot.status = SlotStatus.AVAILABLE
      await slot.save()
      throw err
    }

    // First-consult freebie burns on the actual subject (villager or patient),
    // never on the ASHA's user record. Emergency bookings don't burn the quota.
    if (triageUrgency !== TriageUrgency.EMERGENCY) {
      if (villager && !villager.freeConsultationUsed) {
        await this.vpSvc?.updateById(villager._id, {
          freeConsultationUsed: true,
        })
      } else if (!villager && !req.user.freeConsultationUsed) {
        await this.userSvc.updateById(req.user._id, {
          freeConsultationUsed: true,
        })
      }
    }

    this.log.info({
      msg: villager
        ? 'Appointment booked (free path, ASHA-assisted)'
        : 'Appointment booked (free path)',
      data: {
        appointmentId: appointment._id,
        patientId: villager ? null : req.user._id,
        villagePatientId: villager?._id || null,
        bookedByAshaId: villager ? req.user._id : null,
        doctorId: slot.doctorId,
        urgency: triageUrgency || 'n/a',
      },
    })

    const populated = await this.apptSvc.findByIdPopulated(appointment._id)
    this.sendBookingInvites(populated).catch((err) =>
      this.log.warn({ msg: 'Booking invite send failed', error: err?.message })
    )

    return res.status(201).json(
      new ApiResponse(
        201,
        { paymentRequired: false, appointment: populated },
        'Appointment confirmed.'
      )
    )
  }

  // ── Dev-only: confirm a paid booking without Razorpay ────────────────
  // Same accounting as the real verify path (80/20 split, transaction row,
  // wallet credit) so the rest of the app stays consistent. Gated by
  // NODE_ENV !== 'production' inside book().
  async confirmPaidBookingDemo(req, res, { slot, triageSummary, triageUrgency, villager }) {
    slot.status = SlotStatus.BOOKED
    await slot.save()

    const apptDoc = {
      doctorId: slot.doctorId,
      slotId: slot._id,
      datetime: slot.datetime,
      status: AppointmentStatus.SCHEDULED,
      paymentStatus: PaymentStatus.PAID,
      mode: ConsultationMode.VIDEO,
      triageSummary: triageSummary || null,
      triageUrgency: triageUrgency || null,
    }
    if (villager) {
      apptDoc.villagePatientId = villager._id
      apptDoc.bookedByAshaId = req.user._id
    } else {
      apptDoc.patientId = req.user._id
    }

    let appointment
    try {
      appointment = await this.apptSvc.create(apptDoc)
    } catch (err) {
      slot.status = SlotStatus.AVAILABLE
      await slot.save()
      throw err
    }

    const { platformFee, doctorEarning } = splitFee(CONSULT_FEE_PAISE)
    await this.transactionSvc.create({
      appointmentId: appointment._id,
      patientId: villager ? null : req.user._id,
      doctorId: slot.doctorId,
      amount: CONSULT_FEE_PAISE,
      platformFee,
      doctorEarning,
      type: TransactionType.CONSULTATION,
    })
    await this.userSvc.updateById(slot.doctorId, {
      $inc: { walletBalance: doctorEarning },
    })

    this.log.warn({
      msg: 'Appointment booked (demo paid path — Razorpay skipped)',
      data: { appointmentId: appointment._id, doctorEarning, platformFee },
    })

    const populated = await this.apptSvc.findByIdPopulated(appointment._id)
    this.sendBookingInvites(populated).catch((err) =>
      this.log.warn({ msg: 'Booking invite send failed', error: err?.message })
    )

    return res.status(201).json(
      new ApiResponse(
        201,
        { paymentRequired: false, appointment: populated, demoBypass: true },
        'Appointment confirmed (demo payment).'
      )
    )
  }

  // ── Verify Razorpay payment + finalise the booking ─────────────────────
  // POST /appointments/verify-payment
  // body: { slotId, razorpay_order_id, razorpay_payment_id, razorpay_signature,
  //         triageSummary?, triageUrgency? }
  async verifyPayment(req, res) {
    const {
      slotId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      triageSummary,
      triageUrgency,
      villagePatientId,
    } = req.body

    // Re-resolve the ASHA-villager link so a stolen-signature attempt can't
    // attach the booking to a random villager.
    let villager = null
    if (villagePatientId) {
      const resolved = await this.resolveAshaSubject(req, villagePatientId)
      villager = resolved.villager
    }

    if (!this.paymentSvc?.isConfigured) {
      throw new ApiError(503, 'Payments are not configured.')
    }

    const ok = this.paymentSvc.verifySignature({ orderId, paymentId, signature })
    if (!ok) {
      this.log.warn({
        msg: 'Razorpay signature mismatch',
        data: { orderId, paymentId, patientId: req.user._id },
      })
      throw new ApiError(400, 'Payment verification failed.')
    }

    // Trust the order's notes, not the client's slotId — defends against the
    // client paying for slot A but trying to redeem against slot B.
    const order = await this.paymentSvc.fetchOrder(orderId)
    const notedSlotId = order?.notes?.slotId
    if (!notedSlotId || notedSlotId !== String(slotId)) {
      throw new ApiError(400, 'This payment is for a different slot.')
    }
    if (order.status !== 'paid') {
      // Razorpay marks the order as "paid" once a successful capture lands.
      throw new ApiError(400, 'Payment is not in a paid state yet.')
    }
    if (order.amount !== CONSULT_FEE_PAISE) {
      throw new ApiError(400, 'Payment amount mismatch.')
    }

    const slot = await this.slotSvc.findById(slotId)
    if (!slot) throw new ApiError(404, 'Slot not found.')
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(
        409,
        'That slot was taken while you were paying. We will refund you shortly.'
      )
    }
    if (new Date(slot.datetime).getTime() < Date.now()) {
      throw new ApiError(400, 'That slot is in the past.')
    }

    // Lock slot first so a parallel booker bounces off our 409 above.
    slot.status = SlotStatus.BOOKED
    await slot.save()

    const apptDoc = {
      doctorId: slot.doctorId,
      slotId: slot._id,
      datetime: slot.datetime,
      status: AppointmentStatus.SCHEDULED,
      paymentStatus: PaymentStatus.PAID,
      mode: ConsultationMode.VIDEO,
      triageSummary: triageSummary || null,
      triageUrgency: triageUrgency || null,
    }
    if (villager) {
      apptDoc.villagePatientId = villager._id
      apptDoc.bookedByAshaId = req.user._id
    } else {
      apptDoc.patientId = req.user._id
    }

    let appointment
    try {
      appointment = await this.apptSvc.create(apptDoc)
    } catch (err) {
      slot.status = SlotStatus.AVAILABLE
      await slot.save()
      throw err
    }

    // 80/20 split, integer paise to avoid float drift on payouts.
    const { platformFee, doctorEarning } = splitFee(CONSULT_FEE_PAISE)
    await this.transactionSvc.create({
      appointmentId: appointment._id,
      patientId: villager ? null : req.user._id,
      doctorId: slot.doctorId,
      amount: CONSULT_FEE_PAISE,
      platformFee,
      doctorEarning,
      type: TransactionType.CONSULTATION,
    })
    await this.userSvc.updateById(slot.doctorId, {
      $inc: { walletBalance: doctorEarning },
    })

    this.log.info({
      msg: 'Appointment booked (paid path)',
      data: {
        appointmentId: appointment._id,
        orderId,
        paymentId,
        doctorEarning,
        platformFee,
      },
    })

    const populated = await this.apptSvc.findByIdPopulated(appointment._id)
    this.sendBookingInvites(populated).catch((err) =>
      this.log.warn({ msg: 'Booking invite send failed', error: err?.message })
    )

    return res.status(201).json(
      new ApiResponse(
        201,
        { paymentRequired: false, appointment: populated },
        'Payment received. Appointment confirmed.'
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
        populate: [
          { path: 'patientId', select: 'name email language' },
          {
            path: 'villagePatientId',
            select: 'name age gender phone language village',
          },
          {
            path: 'bookedByAshaId',
            select: 'name email village ashaIdNumber',
          },
        ],
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

    await this.mrSvc.appendConsultation({
      patientId: appt.villagePatientId ? null : appt.patientId,
      villagePatientId: appt.villagePatientId || null,
      entry: {
        date: new Date(),
        doctorId: appt.doctorId,
        notes: updated.doctorNotes,
        prescription: updated.prescription,
        triageSummary: updated.triageSummary,
        bookedByAshaId: appt.bookedByAshaId || null,
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

  // ── Video session (Daily.co) ─────────────────────────────────────────────
  async getVideoSession(req, res) {
    const appt = await this.apptSvc.findByIdPopulated(req.params.id)
    if (!appt) throw new ApiError(404, 'Appointment not found.')
    if (!this.canAccess(appt, req.user)) {
      throw new ApiError(403, 'You do not have access to this appointment.')
    }

    const roomName = `meddx-${appt._id}`
    const slotStartMs = new Date(appt.datetime).getTime()
    const expSec = Math.floor((slotStartMs + 90 * 60 * 1000) / 1000)

    if (!this.dailySvc?.isConfigured) {
      this.log.warn({
        msg: 'Daily not configured — falling back to Jitsi public room',
      })
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            provider: 'jitsi',
            url: `https://meet.jit.si/${roomName}`,
            roomName,
            token: null,
          },
          'Video session ready (Jitsi fallback).'
        )
      )
    }

    try {
      const { url } = await this.dailySvc.ensureRoom({ name: roomName, expSec })
      const isDoctor = req.user.role === UserRoles.DOCTOR
      const displayName = isDoctor
        ? `Dr ${req.user.name || 'Doctor'}`
        : req.user.name || 'Patient'
      const token = await this.dailySvc.createMeetingToken({
        roomName,
        userName: displayName,
        isOwner: isDoctor,
        expSec,
      })
      return res.status(200).json(
        new ApiResponse(
          200,
          { provider: 'daily', url, roomName, token },
          'Video session ready.'
        )
      )
    } catch (err) {
      this.log.error({
        msg: 'Daily session create failed',
        error: err?.message,
      })
      throw new ApiError(502, 'Could not start the video session.')
    }
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
      appt.patientId &&
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
    if (
      user.role === UserRoles.ASHA &&
      appt.bookedByAshaId &&
      String(appt.bookedByAshaId._id || appt.bookedByAshaId) === String(user._id)
    ) {
      return true
    }
    return false
  }
}

export default AppointmentController
