import { model, Schema } from 'mongoose'
import {
  AvailableTransactionTypes,
  TransactionType,
} from '../../constants/index.js'

const transactionSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    doctorEarning: { type: Number, default: 0 },
    type: {
      type: String,
      enum: {
        values: AvailableTransactionTypes,
        message: 'Invalid transaction type',
      },
      default: TransactionType.CONSULTATION,
    },
  },
  { timestamps: true }
)

const TransactionModel = model(
  'Transaction',
  transactionSchema,
  'transactions'
)

export default TransactionModel
