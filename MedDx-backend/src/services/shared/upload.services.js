import { v2 as cloudinary } from 'cloudinary'

import { ENV } from '../../config/index.js'

class UploadService {
  constructor() {
    // Cloudinary v2 auto-parses CLOUDINARY_URL from process.env when
    // cloudinary.config() is called with no arguments. Calling it
    // explicitly here makes the dependency on ENV.CLOUDINARY_URL clear.
    if (ENV.CLOUDINARY_URL) {
      cloudinary.config({ secure: true })
    }
  }

  async upload(filePath) {
    return await cloudinary.uploader.upload(filePath)
  }
}

export default UploadService
