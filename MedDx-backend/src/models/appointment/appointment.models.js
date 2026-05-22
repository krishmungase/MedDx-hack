import { model, Schema } from 'mongoose'
import {
  AppointmentStatus,
  AvailableAppointmentStatuses,
  AvailableConsultationModes,
  AvailablePaymentStatuses,
  AvailableTriageUrgencies,
  ConsultationMode,
  PaymentStatus,
} from '../../constants/index.js'

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: AvailableAppointmentStatuses,
        message: 'Invalid appointment status',
      },
      default: AppointmentStatus.SCHEDULED,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: AvailablePaymentStatuses,
        message: 'Invalid payment status',
      },
      default: PaymentStatus.FREE,
    },
    triageSummary: { type: String, default: null },
    triageUrgency: {
      type: String,
      enum: { values: AvailableTriageUrgencies, message: 'Invalid urgency' },
      default: null,
    },
    doctorNotes: { type: String, default: null },
    prescription: { type: Schema.Types.Mixed, default: null },
    mediaUrls: [{ type: String }],
    mode: {
      type: String,
      enum: {
        values: AvailableConsultationModes,
        message: 'Invalid consultation mode',
      },
      default: ConsultationMode.VIDEO,
    },
  },
  { timestamps: true }
)

const AppointmentModel = model(
  'Appointment',
  appointmentSchema,
  'appointments'
)

export default AppointmentModel
