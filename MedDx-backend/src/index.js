import cors from 'cors'
import express from 'express'

import { ENV } from './config/index.js'
import { connectDB } from './db/index.js'
import { logger } from './logger/index.js'
import { MSG } from './constants/index.js'
import { authRoutes } from './routes/index.js'
import { asyncHandler } from './utils/index.js'
import { errorHandler, morganMiddleware } from './middlewares/index.js'

class ServerApp {
  constructor() {
    this.app = express()

    this.initializeMiddlewares()
    this.initializeRoutes()
  }

  initializeMiddlewares() {
    const corsOptions = {
      origin: ENV.CLIENT_URL || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }

    this.app.use(morganMiddleware)
    this.app.use(cors(corsOptions))
    this.app.options('*', cors(corsOptions))
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.static('public'))
  }

  initializeRoutes() {
    this.app.get('/', this.healthCheck)

    this.app.use('/api/v1/auth', authRoutes)

    this.app.use(errorHandler)
  }

  healthCheck = asyncHandler((_, res) => {
    return res.status(200).json({ ok: true })
  })

  async start() {
    const PORT = ENV.APP_PORT || 5555

    try {
      await connectDB()
      logger.info({ msg: MSG.DB_CONNECTED })

      this.app.listen(PORT, () => {
        logger.info({ msg: `Server listening on http://localhost:${PORT}` })
      })
    } catch (error) {
      logger.error({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
      process.exit(1)
    }
  }

  getApp() {
    return this.app
  }
}

const serverApp = new ServerApp()
await serverApp.start()

export default serverApp.getApp()
