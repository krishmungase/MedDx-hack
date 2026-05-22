import { ApiError, ApiResponse } from '../../utils/index.js'
import { AccountStatus, UserRoles } from '../../constants/index.js'

class DoctorController {
  constructor(userService, transactionService) {
    this.userSvc = userService
    this.transactionSvc = transactionService
  }

  serialize(doc) {
    return {
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      specialty: doc.specialty,
      licenseNumber: doc.licenseNumber,
      status: doc.status,
      accountStatus: doc.accountStatus,
    }
  }

  // GET /doctors — public list of active doctors.
  async listActive(req, res) {
    const { specialty } = req.query
    const filter = {
      role: UserRoles.DOCTOR,
      accountStatus: AccountStatus.ACTIVE,
    }
    if (specialty) filter.specialty = specialty
    const doctors = await this.userSvc.findAll(filter, {
      select: '-passwordHash -passwordSetupToken -tokenExpiry',
    })
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { doctors: doctors.map((d) => this.serialize(d)) },
          'Doctors fetched.'
        )
      )
  }

  async getById(req, res) {
    const doctor = await this.userSvc.findById(req.params.id)
    if (
      !doctor ||
      doctor.role !== UserRoles.DOCTOR ||
      doctor.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ApiError(404, 'Doctor not found.')
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { doctor: this.serialize(doctor) }, 'Doctor fetched.')
      )
  }

  // GET /doctors/me/earnings — wallet balance + recent transactions.
  // Used by the doctor's "Earnings" page (Phase 6).
  async getMyEarnings(req, res) {
    if (req.user.role !== UserRoles.DOCTOR) {
      throw new ApiError(403, 'Only doctors can view earnings.')
    }

    const me = await this.userSvc.findById(req.user._id)
    const balancePaise = me?.walletBalance || 0

    const transactions = await this.transactionSvc.findByDoctor(req.user._id, {
      limit: 50,
    })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          balancePaise,
          transactions: transactions.map((t) => ({
            _id: t._id,
            amount: t.amount,
            platformFee: t.platformFee,
            doctorEarning: t.doctorEarning,
            type: t.type,
            createdAt: t.createdAt,
            patient: t.patientId
              ? { _id: t.patientId._id, name: t.patientId.name }
              : null,
            appointment: t.appointmentId
              ? {
                  _id: t.appointmentId._id,
                  datetime: t.appointmentId.datetime,
                  status: t.appointmentId.status,
                }
              : null,
          })),
        },
        'Earnings fetched.'
      )
    )
  }
}

export default DoctorController
