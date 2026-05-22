import cors from 'cors'
import express from 'express'
import passport from 'passport'
import session from 'express-session'
import { Strategy } from 'passport-google-oauth20'

import { ENV } from './config/index.js'
import { connectDB } from './db/index.js'
import { logger } from './logger/index.js'
import { UserModel } from './models/index.js'
import { TokenService } from './services/index.js'
import { MSG, UserLoginType } from './constants/index.js'
import { authRoutes, assistantRoutes } from './routes/index.js'
import { ApiResponse, ApiError, asyncHandler } from './utils/index.js'
import { errorHandler, morganMiddleware } from './middlewares/index.js'

class ServerApp {
  constructor() {
    this.app = express()
    this.tokenService = new TokenService()

    this.initializeMiddlewares()
    this.initializePassport()
    this.initializeRoutes()
  }

  initializeMiddlewares() {
    const corsOptions = {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }

    const sessionOptions = session({
      secret: ENV.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: ENV.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })

    this.app.use(morganMiddleware)
    this.app.use(cors(corsOptions))
    this.app.options('*', cors(corsOptions))
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.static('public'))
    this.app.use(sessionOptions)
    this.app.use(passport.initialize())
    this.app.use(passport.session())
  }

  httpsRedirectMiddleware = (req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`)
    }
    next()
  }

  initializePassport() {
    passport.use(
      new Strategy(
        {
          clientID: ENV.GOOGLE_CLIENT_ID,
          clientSecret: ENV.GOOGLE_CLIENT_SECRET,
          callbackURL: `${ENV.BACKEND_URL}/auth/google/callback`,
          scope: ['profile', 'email'],
        },
        this.googleStrategyCallback
      )
    )

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))
  }

  googleStrategyCallback = async (_, __, profile, done) => {
    try {
      const user = {
        email: profile?.emails?.[0]?.value,
        fullName: profile?.displayName,
        avatar: {
          url: profile?.photos?.[0]?.value,
        },
      }

      if (!user.email) {
        return done(new ApiError(400, 'Email not provided by Google'), null)
      }

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }

  initializeRoutes() {
    this.app.get('/', this.healthCheck)
    this.app.get('/auth/google', this.googleAuth)
    this.app.get('/auth/google/callback', this.googleCallback)

    this.app.use('/api/v1/auth', authRoutes)
    this.app.use('/api/v1/assistant', assistantRoutes)

    this.app.use(errorHandler)
  }

  healthCheck = asyncHandler((_, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, { msg: 'Hello from server!' }))
  })

  googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] })

  googleCallback = [
    passport.authenticate('google', { session: false }),
    asyncHandler(async (req, res) => {
      const user = req.user
      if (!user?.email)
        throw new ApiError(400, 'Authentication failed: Invalid user data')

      let curUser = await UserModel.findOne({ email: user.email }).lean()
      if (!curUser) curUser = await this.createNewUser(user)

      const accessToken = await this.tokenService.signToken({
        user: {
          _id: curUser._id,
          email: curUser.email,
          fullName: curUser.fullName,
        },
      })

      const redirectUrl = this.getRedirectUrl(curUser, accessToken)
      return res.redirect(redirectUrl)
    }),
  ]

  async createNewUser(userData) {
    const newUserData = {
      ...userData,
      isVerified: true,
      userLoginType: UserLoginType.GOOGLE,
    }
    await UserModel.create(newUserData)
    return await UserModel.findOne({ email: userData.email }).lean()
  }

  getRedirectUrl(user, accessToken) {
    if (!user) return `${ENV.FRONTEND_URL}/auth/sign-up`
    else if (!user.isVerified)
      return `${ENV.FRONTEND_URL}/guidance/under-review`
    return `${ENV.FRONTEND_URL}/auth/verify?token=${accessToken}`
  }

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
