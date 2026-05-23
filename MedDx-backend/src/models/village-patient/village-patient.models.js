import { model, Schema } from 'mongoose'

import { AvailableGenders } from '../../constants/index.js'

/**
 * VillagePatient
 *
 * A lightweight profile for someone who can't (or doesn't want to) hold a
 * MedDx login of their own. Managed by exactly one ASHA — the community
 * health worker holds the device, runs triage, and books on their behalf.
 *
 * Free-first-consult accounting lives on this record so it's per-villager,
 * not per-ASHA. Emergency triage still bypasses payment per the global rule.
 */
const villagePatientSchema = new Schema(
  {
    ashaId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 130 },
    gender: {
      type: String,
      enum: { values: AvailableGenders, message: 'Invalid gender' },
      default: 'prefer_not_to_say',
    },
    phone: { type: String, default: null, trim: true },
    language: { type: String, default: 'en' },
    village: { type: String, default: null, trim: true },
    notes: { type: String, default: null },
    freeConsultationUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const VillagePatientModel = model(
  'VillagePatient',
  villagePatientSchema,
  'village_patients'
)

export default VillagePatientModel
