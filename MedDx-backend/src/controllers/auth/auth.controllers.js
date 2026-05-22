import { ENV } from '../../config/index.js'
import { ApiError, ApiResponse } from '../../utils/index.js'
import { MSG, URLS, UserLoginType } from '../../constants/index.js'

class AuthController {
  constructor(
    userService,
    tokenService,
    hashService,
    notificationService,
    mailgenService,
    uploadService,
    logger
  ) {
    this.userSvc = userService
    this.tokenSvc = tokenService
    this.hashSvc = hashService
    this.notificationSvc = notificationService
    this.mailgenSvc = mailgenService
    this.uploadSvc = uploadService
    this.log = logger
  }

  verifyTokenOrThrow(token, ctx = 'token') {
    const decoded = this.tokenSvc.verifyToken(token)
    const isExpired = (decoded?.exp || 0) * 1000 < Date.now()

    if (!decoded?.user || isExpired) {
      throw new ApiError(400, `The ${ctx} provided is invalid or expired.`)
    }

    return decoded.user
  }

  buildUserResponse(user, token) {
    return {
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        pricingModel: user.pricingModel,
      },
      token,
    }
  }

  async register(req, res) {
    const { email, fullName } = req.body

    const existingUser = await this.userSvc.findByEmail(email)
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists.')
    }

    const token = await this.tokenSvc.signToken(
      { user: { fullName, email } },
      '10m'
    )

    const link = `${ENV.CLIENT_URL}${URLS.createPasswordUrl}?token=${token}`
    const { emailHTML, emailText } = this.mailgenSvc.verificationEmailHTML({
      name: fullName,
      link,
    })

    if (ENV.NODE_ENV === 'production') {
      await this.notificationSvc.send({
        to: email,
        subject: 'Verify Email and Create Password',
        text: emailText,
        html: emailHTML,
      })
    }

    this.log.info({
      msg: MSG.AUTH.USER_REGISTERED,
      data: { email, fullName },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fullName, email, ...(ENV.NODE_ENV === 'development' && { link }) },
          'Verification email sent successfully.'
        )
      )
  }

  async verifyEmail(req, res) {
    const { password, token } = req.body

    const decoded = this.tokenSvc.verifyToken(token)
    if (!decoded?.user || !decoded?.user?.email || !decoded?.user?.fullName)
      throw new ApiError(400, 'The token provided is invalid or expired.')

    if ((decoded?.exp || 0) * 1000 < Date.now())
      throw new ApiError(
        400,
        'We are sorry, but your token has expired. Please request a new token to proceed.'
      )

    const existingUser = await this.userSvc.findByEmail(decoded?.user?.email)
    if (existingUser)
      throw new ApiError(409, 'User with email already exists.', [])

    const hashedPwd = await this.hashSvc.hashData(password)

    const user = await this.userSvc.create({
      email: decoded.user.email,
      fullName: decoded.user.fullName,
      password: hashedPwd,
      isVerified: true,
      userLoginType: UserLoginType.EMAIL_PASSWORD,
    })

    this.log.info({
      msg: MSG.AUTH.USER_VERIFIED,
      data: { userId: user._id, fullName: user.fullName, email: user.email },
    })

    const accessToken = await this.tokenSvc.signToken({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          this.buildUserResponse(user, accessToken),
          'Your email has been successfully verified, and your password has been created.'
        )
      )
  }

  async login(req, res) {
    const { email, password } = req.body

    const user = await this.userSvc.findByEmail(email)
    if (!user) throw new ApiError(401, 'User not found.')

    if (user.userLoginType !== UserLoginType.EMAIL_PASSWORD)
      throw new ApiError(404, 'Please log in using Google.')

    const isMatch = await this.hashSvc.hashCompare(password, user.password)
    if (!isMatch) throw new ApiError(400, 'Invalid credentials.')

    const accessToken = await this.tokenSvc.signToken({
      user: { _id: user._id, email: user.email, fullName: user.fullName },
    })

    this.log.info({
      msg: MSG.AUTH.USER_LOGGED_IN,
      data: { userId: user._id, fullName: user.fullName, email: user.email },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this.buildUserResponse(user, accessToken),
          'User logged in successfully.'
        )
      )
  }

  async forgotPassword(req, res) {
    const { email } = req.body
    const user = await this.userSvc.findByEmail(email)

    if (!user) throw new ApiError(409, 'User does not exist.')

    const token = await this.tokenSvc.signToken(
      {
        user: {
          email: user.email,
          fullName: user.fullName,
          _id: user._id,
        },
      },
      '2 days'
    )

    const link = `${ENV.CLIENT_URL}${URLS.resetPasswordUrl}?token=${token}`
    const { emailHTML, emailText } = this.mailgenSvc.resetPasswordEmailHTML({
      name: user.fullName,
      link,
    })

    if (ENV.NODE_ENV === 'production') {
      await this.notificationSvc.send({
        to: email,
        subject: `Reset Your ${ENV.APP_NAME} Password`,
        text: emailText,
        html: emailHTML,
      })
    }

    this.log.info({ msg: MSG.AUTH.FORGOT_PASSWORD, data: { email } })

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          email: user.email,
          ...(ENV.NODE_ENV === 'development' && { link }),
        },
        'Reset password link sent successfully.'
      )
    )
  }

  async resetPassword(req, res) {
    const { password, token } = req.body
    const payload = this.verifyTokenOrThrow(token, 'reset password token')

    const user = await this.userSvc.findByEmail(payload.email)
    if (!user) throw new ApiError(409, 'User not found.')

    const hashedPwd = await this.hashSvc.hashData(password)
    await this.userSvc.updateById(user._id, { password: hashedPwd })

    const accessToken = await this.tokenSvc.signToken({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    })

    this.log.info({
      msg: MSG.AUTH.RESET_PASSWORD,
      data: { userId: user._id, email: user.email },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this.buildUserResponse(user, accessToken),
          'Password reset successfully.'
        )
      )
  }

  async me(req, res) {
    const { token } = req.body
    const payload = this.verifyTokenOrThrow(token, 'auth token')

    const user = await this.userSvc.findByEmail(payload.email)
    if (!user) throw new ApiError(409, 'User not found.')

    this.log.info({
      msg: MSG.AUTH.SELF,
      data: { userId: user._id, email: user.email },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this.buildUserResponse(user, token),
          'User details fetched successfully.'
        )
      )
  }
}

export default AuthController
