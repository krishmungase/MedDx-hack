import { model, Schema } from 'mongoose'
import { AvailableSlotStatuses, SlotStatus } from '../../constants/index.js'

const slotSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    datetime: {
      type: Date,
      required: true,
      index: true,
    },
    durationMins: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: { values: AvailableSlotStatuses, message: 'Invalid slot status' },
      default: SlotStatus.AVAILABLE,
    },
  },
  { timestamps: true }
)

slotSchema.index({ doctorId: 1, datetime: 1 }, { unique: true })

const SlotModel = model('Slot', slotSchema, 'slots')

export default SlotModel
