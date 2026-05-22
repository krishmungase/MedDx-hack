import { model, Schema } from 'mongoose'

const consultationEntrySchema = new Schema(
  {
    date: { type: Date, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: null },
    prescription: { type: Schema.Types.Mixed, default: null },
    triageSummary: { type: String, default: null },
  },
  { _id: false }
)

const auditLogEntrySchema = new Schema(
  {
    viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const medicalRecordSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    conditions: [{ type: String }],
    allergies: [{ type: String }],
    medications: [{ type: String }],
    consultations: { type: [consultationEntrySchema], default: [] },
    auditLog: { type: [auditLogEntrySchema], default: [] },
  },
  { timestamps: true }
)

const MedicalRecordModel = model(
  'MedicalRecord',
  medicalRecordSchema,
  'medical_records'
)

export default MedicalRecordModel
