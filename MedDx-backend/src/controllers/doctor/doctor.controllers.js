import mongoose from 'mongoose'

import { ApiError, ApiResponse } from '../../utils/index.js'
import {
  AccountStatus,
  AppointmentStatus,
  UserRoles,
} from '../../constants/index.js'

class DoctorController {
  constructor(
    userService,
    transactionService,
    appointmentModel,
    transactionModel
  ) {
    this.userSvc = userService
    this.transactionSvc = transactionService
    this.appointmentModel = appointmentModel
    this.transactionModel = transactionModel
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

  // GET /doctors/me/prescriptions — every completed consult I've issued a
  // prescription on. Returned newest-first so the doctor can reuse Rx text
  // and review what they handed out.
  async getMyPrescriptions(req, res) {
    if (req.user.role !== UserRoles.DOCTOR) {
      throw new ApiError(403, 'Only doctors can view prescriptions.')
    }
    if (!this.appointmentModel) {
      return res
        .status(200)
        .json(new ApiResponse(200, { items: [] }, 'Prescriptions fetched.'))
    }

    const appts = await this.appointmentModel
      .find({
        doctorId: req.user._id,
        status: 'completed',
        prescription: { $ne: null },
      })
      .sort({ datetime: -1 })
      .limit(200)
      .populate('patientId', 'name email language')

    const items = appts.map((a) => ({
      _id: a._id,
      datetime: a.datetime,
      status: a.status,
      doctorNotes: a.doctorNotes || null,
      prescription: a.prescription,
      triageUrgency: a.triageUrgency || null,
      patient: a.patientId
        ? {
            _id: a.patientId._id,
            name: a.patientId.name,
            email: a.patientId.email,
            language: a.patientId.language || 'en',
          }
        : null,
    }))

    return res
      .status(200)
      .json(new ApiResponse(200, { items }, 'Prescriptions fetched.'))
  }

  // GET /doctors/me/stats — performance snapshot for the doctor profile.
  //   - totalConsults: lifetime completed
  //   - uniquePatients: distinct patients seen (completed only)
  //   - thisMonth.consults / thisMonth.earningsPaise
  //   - monthlyTrend: last 6 months of completed counts (chronological)
  //   - last7Days: completed-per-day for the last 7 days (sparkline data)
  //   - recent: 5 most recent completed consults with patient name + notes preview
  async getMyStats(req, res) {
    if (req.user.role !== UserRoles.DOCTOR) {
      throw new ApiError(403, 'Only doctors can view stats.')
    }
    if (!this.appointmentModel) {
      return res
        .status(200)
        .json(new ApiResponse(200, this.emptyStats(), 'Stats fetched.'))
    }

    const doctorId = new mongoose.Types.ObjectId(req.user._id)
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const completedMatch = {
      doctorId,
      status: AppointmentStatus.COMPLETED,
    }

    const [
      totalConsults,
      uniquePatientsAgg,
      thisMonthConsults,
      thisMonthEarningsAgg,
      monthlyTrendAgg,
      last7DaysAgg,
      recent,
    ] = await Promise.all([
      this.appointmentModel.countDocuments(completedMatch),
      this.appointmentModel.aggregate([
        { $match: completedMatch },
        { $group: { _id: '$patientId' } },
        { $count: 'n' },
      ]),
      this.appointmentModel.countDocuments({
        ...completedMatch,
        datetime: { $gte: startOfThisMonth },
      }),
      this.transactionModel
        ? this.transactionModel.aggregate([
            { $match: { doctorId, createdAt: { $gte: startOfThisMonth } } },
            {
              $group: {
                _id: null,
                total: { $sum: '$doctorEarning' },
              },
            },
          ])
        : [],
      this.appointmentModel.aggregate([
        {
          $match: { ...completedMatch, datetime: { $gte: sixMonthsAgo } },
        },
        {
          $group: {
            _id: {
              year: { $year: '$datetime' },
              month: { $month: '$datetime' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.appointmentModel.aggregate([
        {
          $match: { ...completedMatch, datetime: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: {
              year: { $year: '$datetime' },
              month: { $month: '$datetime' },
              day: { $dayOfMonth: '$datetime' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      this.appointmentModel
        .find(completedMatch)
        .sort({ datetime: -1 })
        .limit(5)
        .populate('patientId', 'name email'),
    ])

    // Build a continuous 6-month series so months with 0 consults show a flat
    // segment in the sparkline instead of vanishing.
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const found = monthlyTrendAgg.find(
        (x) => x._id.year === y && x._id.month === m
      )
      monthlyTrend.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        count: found ? found.count : 0,
      })
    }

    // Same continuity treatment for the last 7 days.
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const day = d.getDate()
      const found = last7DaysAgg.find(
        (x) =>
          x._id.year === y && x._id.month === m && x._id.day === day
      )
      last7Days.push({
        date: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        count: found ? found.count : 0,
      })
    }

    const payload = {
      totalConsults,
      uniquePatients: uniquePatientsAgg[0]?.n || 0,
      thisMonth: {
        consults: thisMonthConsults,
        earningsPaise: thisMonthEarningsAgg[0]?.total || 0,
      },
      monthlyTrend,
      last7Days,
      recent: recent.map((a) => ({
        _id: a._id,
        datetime: a.datetime,
        triageUrgency: a.triageUrgency || null,
        patient: a.patientId
          ? {
              _id: a.patientId._id,
              name: a.patientId.name,
              email: a.patientId.email,
            }
          : null,
        notesPreview: a.doctorNotes
          ? a.doctorNotes.slice(0, 140)
          : null,
      })),
    }

    return res
      .status(200)
      .json(new ApiResponse(200, payload, 'Stats fetched.'))
  }

  emptyStats() {
    return {
      totalConsults: 0,
      uniquePatients: 0,
      thisMonth: { consults: 0, earningsPaise: 0 },
      monthlyTrend: [],
      last7Days: [],
      recent: [],
    }
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
