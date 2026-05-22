import { v2 as cloudinary } from 'cloudinary'

import { ENV } from '../../config/index.js'

class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: ENV.CLOUD_NAME,
      api_key: ENV.CLOUD_API_KEY,
      api_secret: ENV.CLOUD_API_SECRET,
    })
  }

  async upload(filePath) {
    return await cloudinary.uploader.upload(filePath)
  }
}

export default UploadService
