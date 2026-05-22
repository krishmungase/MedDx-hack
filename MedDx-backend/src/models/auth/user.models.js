import { model, Schema } from 'mongoose'

import {
  AvailableUserLoginTypes,
  AvailableUserRoles,
  UserRoles,
} from '../../constants/index.js'

const userShecma = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: AvailableUserRoles,
        message: 'Invalid user role',
      },
      default: UserRoles.USER,
    },
    password: { type: String, default: null },
    avatar: { type: { url: String, _id: false } },
    userLoginType: {
      type: String,
      required: [true, 'Login type is required'],
      enum: {
        values: AvailableUserLoginTypes,
        message: 'Invalid login type',
      },
    },
    isVerified: { type: Boolean, default: false },
  },

  { timestamps: true }
)

const UserModel = model('User', userShecma, 'users')

export default UserModel
