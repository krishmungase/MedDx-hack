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
      },
    }
  }

  async register(req, res) {
    const { name, email, password, role } = req.body

    // Public registration is for PATIENTS ONLY. Reject any attempt to
    // self-register as doctor or admin.
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
      throw new ApiError(
        403,
        'Your account is not active yet. Please complete the password setup link sent to your email.'
      )
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
}

export default AuthController
