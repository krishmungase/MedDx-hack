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
    logger
  ) {
    this.userSvc = userService
    this.notificationSvc = notificationService
    this.mailgenSvc = mailgenService
    this.appointmentModel = appointmentModel
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
