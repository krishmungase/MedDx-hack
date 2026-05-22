import { ApiError, ApiResponse } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'

class MedicalRecordController {
  constructor(medicalRecordService, appointmentService, logger) {
    this.mrSvc = medicalRecordService
    this.apptSvc = appointmentService
    this.log = logger
  }

  // GET /medical-records/:patientId
  // Patients can view their own record. Doctors who have an appointment
  // (any status) with the patient can view too — every doctor view is
  // appended to auditLog. Admins always allowed.
  async getByPatient(req, res) {
    const { patientId } = req.params
    const viewer = req.user

    const isSelf =
      viewer.role === UserRoles.PATIENT && String(viewer._id) === String(patientId)
    const isAdmin = viewer.role === UserRoles.ADMIN

    if (!isSelf && !isAdmin) {
      if (viewer.role !== UserRoles.DOCTOR) {
        throw new ApiError(403, 'Not allowed to view this record.')
      }
      // Doctor: must have an appointment with this patient
      const hasAppt = await this.apptSvc.findAll(
        { doctorId: viewer._id, patientId },
        { sort: { datetime: -1 } }
      )
      if (!hasAppt || hasAppt.length === 0) {
        throw new ApiError(403, 'No appointment links you to this patient.')
      }
      // Audit: log this doctor's view
      await this.mrSvc.appendAudit({ patientId, viewerId: viewer._id })
      this.log.info({
        msg: 'Medical record viewed by doctor',
        data: { patientId, doctorId: viewer._id },
      })
    }

    const record = await this.mrSvc.findByPatientIdPopulated(patientId)
    if (!record) {
      // Patient never had a consultation yet — return empty shell so the
      // UI can render a friendly empty state instead of erroring out.
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            record: {
              patientId,
              conditions: [],
              allergies: [],
              medications: [],
              consultations: [],
              auditLog: [],
            },
          },
          'Medical record fetched.'
        )
      )
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { record }, 'Medical record fetched.'))
  }
}

export default MedicalRecordController
