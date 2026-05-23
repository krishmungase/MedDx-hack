import { model, Schema } from 'mongoose'

const consultationEntrySchema = new Schema(
  {
    date: { type: Date, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: null },
    prescription: { type: Schema.Types.Mixed, default: null },
    triageSummary: { type: String, default: null },
    // ASHA who facilitated this consult, if applicable.
    bookedByAshaId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
)

const auditLogEntrySchema = new Schema(
  {
    viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now },
    note: { type: String, default: null },
  },
  { _id: false }
)

const medicalRecordSchema = new Schema(
  {
    // EITHER a registered patient user OR a village patient profile. Exactly
    // one is set; uniqueness is enforced per "owner" via the sparse partial
    // indexes below.
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    villagePatientId: {
      type: Schema.Types.ObjectId,
      ref: 'VillagePatient',
      default: null,
    },
    conditions: [{ type: String }],
    allergies: [{ type: String }],
    medications: [{ type: String }],
    consultations: { type: [consultationEntrySchema], default: [] },
    auditLog: { type: [auditLogEntrySchema], default: [] },
  },
  { timestamps: true }
)

// One record per registered patient.
medicalRecordSchema.index(
  { patientId: 1 },
  { unique: true, partialFilterExpression: { patientId: { $type: 'objectId' } } }
)
// One record per village patient.
medicalRecordSchema.index(
  { villagePatientId: 1 },
  {
    unique: true,
    partialFilterExpression: { villagePatientId: { $type: 'objectId' } },
  }
)

const MedicalRecordModel = model(
  'MedicalRecord',
  medicalRecordSchema,
  'medical_records'
)

export default MedicalRecordModel
