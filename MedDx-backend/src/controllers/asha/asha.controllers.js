import mongoose from 'mongoose'

import { ApiError, ApiResponse } from '../../utils/index.js'
import {
  AppointmentStatus,
  TriageUrgency,
  UserRoles,
} from '../../constants/index.js'

/**
 * Dashboard + roster + per-villager endpoints for the ASHA (community
 * health worker) role. Booking itself goes through AppointmentController.book
 * with `villagePatientId` set — we don't duplicate the slot-locking,
 * payment, or invite logic here.
 */
class AshaController {
  constructor(
    villagePatientService,
    medicalRecordService,
    appointmentModel,
    logger
  ) {
    this.vpSvc = villagePatientService
    this.mrSvc = medicalRecordService
    this.appointmentModel = appointmentModel
    this.log = logger
  }

  ensureAsha(req) {
    if (req.user.role !== UserRoles.ASHA) {
      throw new ApiError(403, 'ASHA-only endpoint.')
    }
  }

  // POST /api/v1/asha/patients
  async addPatient(req, res) {
    this.ensureAsha(req)
    const ashaId = req.user._id
    const { name, age, gender, phone, language, village, notes } = req.body

    const villager = await this.vpSvc.create({
      ashaId,
      name,
      age,
      gender,
      phone: phone || null,
      language: language || req.user.language || 'en',
      village: village || req.user.village || null,
      notes: notes || null,
    })

    // Pre-create their medical record so subsequent appendConsultation
    // calls don't race on first save.
    await this.mrSvc.getOrCreate({ villagePatientId: villager._id })

    this.log.info({
      msg: 'ASHA added a villager',
      data: { ashaId, villagePatientId: villager._id, name },
    })

    return res
      .status(201)
      .json(new ApiResponse(201, { villager }, 'Villager added to your roster.'))
  }

  // GET /api/v1/asha/patients?search=
  // Returns the roster with last-visit date and any urgent/pending appts.
  async listMyPatients(req, res) {
    this.ensureAsha(req)
    const ashaId = req.user._id

    const villagers = await this.vpSvc.listByAsha(ashaId, {
      search: req.query.search,
    })

    if (villagers.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, { villagers: [] }, 'Roster fetched.'))
    }

    // Aggregate per-villager appointment metadata in a single query.
    const ids = villagers.map((v) => v._id)
    const appts = await this.appointmentModel.aggregate([
      { $match: { villagePatientId: { $in: ids } } },
      {
        $group: {
          _id: '$villagePatientId',
          lastVisit: { $max: '$datetime' },
          totalAppointments: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $eq: ['$status', AppointmentStatus.SCHEDULED] },
                1,
                0,
              ],
            },
          },
          urgent: {
            $sum: {
              $cond: [
                { $eq: ['$triageUrgency', TriageUrgency.EMERGENCY] },
                1,
                0,
              ],
            },
          },
        },
      },
    ])
    const apptIndex = new Map(appts.map((a) => [String(a._id), a]))

    const enriched = villagers.map((v) => {
      const a = apptIndex.get(String(v._id)) || {}
      return {
        _id: v._id,
        name: v.name,
        age: v.age || null,
        gender: v.gender,
        phone: v.phone,
        language: v.language,
        village: v.village,
        freeConsultationUsed: v.freeConsultationUsed,
        createdAt: v.createdAt,
        lastVisit: a.lastVisit || null,
        totalAppointments: a.totalAppointments || 0,
        pending: a.pending || 0,
        urgent: a.urgent || 0,
      }
    })

    return res
      .status(200)
      .json(new ApiResponse(200, { villagers: enriched }, 'Roster fetched.'))
  }

  // GET /api/v1/asha/patients/:id
  // Full villager profile + medical record. Appends an audit entry so the
  // ASHA's view of the record is traceable just like a doctor's.
  async getPatient(req, res) {
    this.ensureAsha(req)
    const villager = await this.vpSvc.findByIdForAsha(
      req.params.id,
      req.user._id
    )
    if (!villager) {
      throw new ApiError(404, 'Villager not found in your roster.')
    }

    // Audit + medical record
    const record = await this.mrSvc.appendAudit({
      villagePatientId: villager._id,
      viewerId: req.user._id,
      note: 'ASHA roster view',
    })

    // Appointments for this villager
    const appointments = await this.appointmentModel
      .find({ villagePatientId: villager._id })
      .sort({ datetime: -1 })
      .populate('doctorId', 'name email specialty')

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          villager,
          record: record
            ? {
                _id: record._id,
                conditions: record.conditions,
                allergies: record.allergies,
                medications: record.medications,
                consultations: record.consultations,
                auditLog: record.auditLog,
              }
            : null,
          appointments,
        },
        'Villager fetched.'
      )
    )
  }

  // GET /api/v1/asha/dashboard
  // Managed-patient count, this-week consults, urgent/pending cases.
  async dashboardStats(req, res) {
    this.ensureAsha(req)
    const ashaId = req.user._id
    const ashaObjId = new mongoose.Types.ObjectId(ashaId)

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [totalPatients, weekConsultsAgg, urgentAgg, pendingAgg, recent] =
      await Promise.all([
        this.vpSvc.countByAsha(ashaId),
        this.appointmentModel.countDocuments({
          bookedByAshaId: ashaObjId,
          datetime: { $gte: startOfWeek },
        }),
        this.appointmentModel.countDocuments({
          bookedByAshaId: ashaObjId,
          triageUrgency: TriageUrgency.EMERGENCY,
          status: AppointmentStatus.SCHEDULED,
        }),
        this.appointmentModel.countDocuments({
          bookedByAshaId: ashaObjId,
          status: AppointmentStatus.SCHEDULED,
        }),
        this.appointmentModel
          .find({ bookedByAshaId: ashaObjId })
          .sort({ datetime: -1 })
          .limit(8)
          .populate('villagePatientId', 'name age gender village language')
          .populate('doctorId', 'name specialty'),
      ])

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          managedPatients: totalPatients,
          weekConsults: weekConsultsAgg,
          urgentPending: urgentAgg,
          pending: pendingAgg,
          recentAppointments: recent,
        },
        'Dashboard fetched.'
      )
    )
  }
}

export default AshaController
