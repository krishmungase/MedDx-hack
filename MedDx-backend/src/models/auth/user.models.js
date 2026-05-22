import { model, Schema } from 'mongoose'

import {
  AvailableAccountStatuses,
  AvailableDoctorStatuses,
  AvailableUserRoles,
  AccountStatus,
  DoctorStatus,
  UserRoles,
} from '../../constants/index.js'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: { values: AvailableUserRoles, message: 'Invalid user role' },
      required: true,
      default: UserRoles.PATIENT,
    },
    language: {
      type: String,
      default: 'en',
    },
    accountStatus: {
      type: String,
      enum: {
        values: AvailableAccountStatuses,
        message: 'Invalid account status',
      },
      default: AccountStatus.ACTIVE,
    },
    passwordSetupToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },

    // Doctor-only fields
    specialty: { type: String, default: null },
    licenseNumber: { type: String, default: null },
    walletBalance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: {
        values: AvailableDoctorStatuses,
        message: 'Invalid doctor status',
      },
      default: DoctorStatus.OFFLINE,
    },

    // Patient-only fields
    freeConsultationUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const UserModel = model('User', userSchema, 'users')

export default UserModel
