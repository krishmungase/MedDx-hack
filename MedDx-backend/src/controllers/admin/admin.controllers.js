import crypto from 'crypto'

import { ENV } from '../../config/index.js'
import { ApiError, ApiResponse } from '../../utils/index.js'
import {
  AccountStatus,
  MSG,
  UserRoles,
} from '../../constants/index.js'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

class AdminController {
  constructor(
    userService,
    notificationService,
    mailgenService,
    appointmentModel,
    medicalRecordModel,
    logger
  ) {
    this.userSvc = userService
    this.notificationSvc = notificationService
    this.mailgenSvc = mailgenService
    this.appointmentModel = appointmentModel
    this.medicalRecordModel = medicalRecordModel
    this.log = logger
  }

  // ── Doctor onboarding ─────────────────────────────────────────────────
  async registerDoctor(req, res) {
    const { name, email, specialty, licenseNumber } = req.body

    const existing = await this.userSvc.findByEmail(email)
    if (existing) {
      throw new ApiError(409, 'A user with this email already exists.')
    }

    const passwordSetupToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + TOKEN_TTL_MS)

    const doctor = await this.userSvc.create({
      name,
      email,
      role: UserRoles.DOCTOR,
      accountStatus: AccountStatus.PENDING_SETUP,
      specialty,
      licenseNumber,
      passwordSetupToken,
      tokenExpiry,
    })

    const link = `${ENV.CLIENT_URL}/set-password?token=${passwordSetupToken}`

    const mailerStatus = await this.sendSetupEmail({
      to: email,
      name,
      link,
    })

    this.log.info({
      msg: MSG.AUTH.DOCTOR_INVITED,
      data: {
        userId: doctor._id,
        email,
        emailed: mailerStatus.sent,
      },
    })

    const responseBody = {
      doctor: this.serializeDoctor(doctor),
      emailed: mailerStatus.sent,
      ...(mailerStatus.sent ? {} : { link }),
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          responseBody,
          mailerStatus.sent
            ? 'Doctor registered. Set-password link emailed.'
            : 'Doctor registered. Email not configured — share the link manually.'
        )
      )
  }

  async sendSetupEmail({ to, name, link }) {
    const { emailHTML, emailText } = this.mailgenSvc.generateEmail({
      name,
      intro: `You have been invited to join ${ENV.APP_NAME || 'MedDx'} as a specialist doctor. Please set your password to activate your account.`,
      actionInstructions:
        'This one-time link expires in 24 hours. Click below to choose a password and sign in.',
      actionText: 'Set my password',
      actionLink: link,
      outro:
        "If you weren't expecting this invitation, you can safely ignore this email.",
    })

    try {
      const result = await this.notificationSvc.send({
        to,
        subject: `Activate your ${ENV.APP_NAME || 'MedDx'} doctor account`,
        text: emailText,
        html: emailHTML,
      })
      return { sent: result?.sent !== false }
    } catch (err) {
      this.log.error({ msg: MSG.MAILER.SEND_FAILED, error: err?.message })
      return { sent: false }
    }
  }

  // ── Doctor listing ────────────────────────────────────────────────────
  async listDoctors(req, res) {
    const doctors = await this.userSvc.findAll(
      { role: UserRoles.DOCTOR },
      { select: '-passwordHash -passwordSetupToken -tokenExpiry' }
    )
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { doctors: doctors.map((d) => this.serializeDoctor(d)) },
          'Doctors fetched.'
        )
      )
  }

  // ── All appointments (platform-wide) ──────────────────────────────────
  // GET /admin/appointments?status=&limit=
  async listAppointments(req, res) {
    const { status, limit = 100 } = req.query
    const filter = {}
    if (status) filter.status = status

    const appointments = await this.appointmentModel
      .find(filter)
      .sort({ datetime: -1 })
      .limit(Math.min(Number(limit) || 100, 500))
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialty')

    return res
      .status(200)
      .json(
        new ApiResponse(200, { appointments }, 'Appointments fetched.')
      )
  }

  // ── Audit log (record access) ─────────────────────────────────────────
  // GET /admin/audit-log?limit=
  // Flattens the auditLog arrays embedded on every MedicalRecord into a
  // single chronological list. Uses $unwind so we can join in viewer and
  // patient names without a separate per-entry query.
  async listAuditLog(req, res) {
    if (!this.medicalRecordModel) {
      return res
        .status(200)
        .json(new ApiResponse(200, { entries: [] }, 'Audit log empty.'))
    }
    const limit = Math.min(Number(req.query.limit) || 200, 1000)

    const entries = await this.medicalRecordModel.aggregate([
      { $unwind: '$auditLog' },
      {
        $project: {
          _id: 0,
          patientId: 1,
          viewerId: '$auditLog.viewerId',
          viewedAt: '$auditLog.viewedAt',
        },
      },
      { $sort: { viewedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'viewerId',
          foreignField: '_id',
          as: 'viewer',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
        },
      },
      {
        $project: {
          viewedAt: 1,
          viewer: {
            $arrayElemAt: [
              {
                $map: {
                  input: '$viewer',
                  as: 'v',
                  in: {
                    _id: '$$v._id',
                    name: '$$v.name',
                    email: '$$v.email',
                    role: '$$v.role',
                    specialty: '$$v.specialty',
                  },
                },
              },
              0,
            ],
          },
          patient: {
            $arrayElemAt: [
              {
                $map: {
                  input: '$patient',
                  as: 'p',
                  in: {
                    _id: '$$p._id',
                    name: '$$p.name',
                    email: '$$p.email',
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ])

    return res
      .status(200)
      .json(new ApiResponse(200, { entries }, 'Audit log fetched.'))
  }

  // ── Platform stats ────────────────────────────────────────────────────
  async getStats(req, res) {
    const [patients, doctors, appointments] = await Promise.all([
      this.userSvc.count({ role: UserRoles.PATIENT }),
      this.userSvc.count({ role: UserRoles.DOCTOR }),
      this.appointmentModel.countDocuments({}),
    ])

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { patients, doctors, appointments },
          'Stats fetched.'
        )
      )
  }

  // ── Suspend / unsuspend ───────────────────────────────────────────────
  async updateDoctorStatus(req, res) {
    const { id } = req.params
    const { accountStatus } = req.body

    const doctor = await this.userSvc.findById(id)
    if (!doctor || doctor.role !== UserRoles.DOCTOR) {
      throw new ApiError(404, 'Doctor not found.')
    }
    if (
      ![AccountStatus.ACTIVE, AccountStatus.SUSPENDED].includes(accountStatus)
    ) {
      throw new ApiError(
        400,
        "accountStatus must be 'active' or 'suspended'."
      )
    }

    const updated = await this.userSvc.updateById(id, { accountStatus })

    if (accountStatus === AccountStatus.SUSPENDED) {
      this.log.info({
        msg: MSG.ADMIN.DOCTOR_SUSPENDED,
        data: { doctorId: id, email: doctor.email },
      })
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { doctor: this.serializeDoctor(updated) },
          accountStatus === AccountStatus.SUSPENDED
            ? 'Doctor suspended.'
            : 'Doctor reactivated.'
        )
      )
  }

  // ── Hard remove ───────────────────────────────────────────────────────
  async removeDoctor(req, res) {
    const { id } = req.params
    const doctor = await this.userSvc.findById(id)
    if (!doctor || doctor.role !== UserRoles.DOCTOR) {
      throw new ApiError(404, 'Doctor not found.')
    }
    await this.userSvc.deleteById(id)

    this.log.info({
      msg: MSG.ADMIN.DOCTOR_REMOVED,
      data: { doctorId: id, email: doctor.email },
    })

    return res
      .status(200)
      .json(new ApiResponse(200, { id }, 'Doctor removed.'))
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  serializeDoctor(doctor) {
    return {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      accountStatus: doctor.accountStatus,
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      status: doctor.status,
      walletBalance: doctor.walletBalance,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }
  }
}

export default AdminController
