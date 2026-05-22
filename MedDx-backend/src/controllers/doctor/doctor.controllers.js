import { ApiError, ApiResponse } from '../../utils/index.js'
import { AccountStatus, UserRoles } from '../../constants/index.js'

class DoctorController {
  constructor(userService) {
    this.userSvc = userService
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
  // Phase 5 will accept ?specialty=... to filter.
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
}

export default DoctorController
