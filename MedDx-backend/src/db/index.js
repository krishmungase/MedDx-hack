import mongoose from 'mongoose'
import { ENV } from '../config/index.js'

export const connectDB = async () => {
  if (!ENV.MONGO_URI) throw new Error('MONGO_URI is not defined in environment')
  await mongoose.connect(ENV.MONGO_URI)
}
