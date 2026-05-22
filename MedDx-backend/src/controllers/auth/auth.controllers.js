import { ApiError, ApiResponse } from '../../utils/index.js'
import { AccountStatus, MSG, UserRoles } from '../../constants/index.js'

class AuthController {
  constructor(userService, tokenService, hashService, logger) {
    this.userSvc = userService
    this.tokenSvc = tokenService
    this.hashSvc = hashService
    this.log = logger
  }

  buildAuthResponse(user, token) {
    return {
      token,
      name: user.name,
      role: user.role,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        accountStatus: user.accountStatus,
        // Patient-only flag — drives the "Free first consult" pricing chip.
        freeConsultationUsed: user.freeConsultationUsed,
        // Doctor-only — exposed so the dashboard can render wallet balance.
        walletBalance: user.walletBalance,
        specialty: user.specialty,
      },
    }
  }

  async register(req, res) {
    const { name, email, password, role } = req.body

    if (role && role !== UserRoles.PATIENT) {
      throw new ApiError(
        403,
        'Public registration is only available for patients. Doctors are registered by an admin.'
      )
    }

    const existingUser = await this.userSvc.findByEmail(email)
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.')
    }

    const passwordHash = await this.hashSvc.hashData(password)

    const user = await this.userSvc.create({
      name,
      email,
      passwordHash,
      role: UserRoles.PATIENT,
      accountStatus: AccountStatus.ACTIVE,
    })

    const token = await this.tokenSvc.signToken({
      id: user._id,
      role: user.role,
    })

    this.log.info({
      msg: MSG.AUTH.USER_REGISTERED,
      data: { userId: user._id, email: user.email, role: user.role },
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          this.buildAuthResponse(user, token),
          'Account created successfully.'
        )
      )
  }

  async login(req, res) {
    const { email, password } = req.body

    const user = await this.userSvc.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      const reason =
        user.accountStatus === AccountStatus.PENDING_SETUP
          ? 'Your account is not active yet. Please complete the password-setup link sent to your email.'
          : 'Your account has been suspended. Please contact the administrator.'
      throw new ApiError(403, reason)
    }

    const isMatch = await this.hashSvc.hashCompare(password, user.passwordHash)
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.')
    }

    const token = await this.tokenSvc.signToken({
      id: user._id,
      role: user.role,
    })

    this.log.info({
      msg: MSG.AUTH.USER_LOGGED_IN,
      data: { userId: user._id, email: user.email, role: user.role },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this.buildAuthResponse(user, token),
          'Logged in successfully.'
        )
      )
  }

  async verifySetupToken(req, res) {
    const token = (req.query?.token || '').trim()
    if (!token) throw new ApiError(400, 'Token is required.')

    const user = await this.userSvc.findOne({ passwordSetupToken: token })
    if (!user) {
      throw new ApiError(400, 'This link is invalid or has already been used.')
    }
    if (
      !user.tokenExpiry ||
      new Date(user.tokenExpiry).getTime() < Date.now()
    ) {
      throw new ApiError(
        400,
        'This link has expired. Please ask an admin to send a new invitation.'
      )
    }
    if (user.accountStatus !== AccountStatus.PENDING_SETUP) {
      throw new ApiError(
        400,
        'This account is already active. Please sign in instead.'
      )
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
        },
        'Token is valid.'
      )
    )
  }

  async setPassword(req, res) {
    const { token, password } = req.body
    if (!token) throw new ApiError(400, 'Token is required.')

    const user = await this.userSvc.findOne({ passwordSetupToken: token })
    if (!user) {
      throw new ApiError(400, 'This link is invalid or has already been used.')
    }
    if (
      !user.tokenExpiry ||
      new Date(user.tokenExpiry).getTime() < Date.now()
    ) {
      throw new ApiError(400, 'This link has expired.')
    }
    if (user.accountStatus !== AccountStatus.PENDING_SETUP) {
      throw new ApiError(400, 'This account is already active.')
    }

    const passwordHash = await this.hashSvc.hashData(password)

    const updated = await this.userSvc.updateById(user._id, {
      passwordHash,
      accountStatus: AccountStatus.ACTIVE,
      passwordSetupToken: null,
      tokenExpiry: null,
    })

    const accessToken = await this.tokenSvc.signToken({
      id: updated._id,
      role: updated.role,
    })

    this.log.info({
      msg: MSG.AUTH.DOCTOR_ACTIVATED,
      data: { userId: updated._id, email: updated.email },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          this.buildAuthResponse(updated, accessToken),
          'Password set successfully. You are now logged in.'
        )
      )
  }
}

export default AuthController
