import { ApiError, ApiResponse } from '../../utils/index.js'
import { UserRoles } from '../../constants/index.js'

/**
 * Profile management for the currently authenticated user.
 * verifyJWT populates req.user.
 */
class UserController {
  constructor(userService, hashService, logger) {
    this.userSvc = userService
    this.hashSvc = hashService
    this.log = logger
  }

  /**
   * Build a safe profile payload — strips the password hash and the setup
   * token fields (those are part of the doctor onboarding flow, not the
   * user's account). Role-specific fields (specialty/license/wallet for
   * doctors; freeConsultationUsed for patients) are kept.
   */
  toProfile(user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Doctor-only
      specialty: user.specialty,
      licenseNumber: user.licenseNumber,
      walletBalance: user.walletBalance,
      status: user.status,
      // Patient-only
      freeConsultationUsed: user.freeConsultationUsed,
    }
  }

  async getMe(req, res) {
    // req.user is loaded fresh from DB by verifyJWT
    return res
      .status(200)
      .json(new ApiResponse(200, this.toProfile(req.user), 'Profile loaded.'))
  }

  async updateMe(req, res) {
    const user = req.user
    const { name, language, specialty } = req.body

    const patch = {}
    if (typeof name === 'string') patch.name = name.trim()
    if (typeof language === 'string') patch.language = language.trim()

    // Specialty is only meaningful for doctors. Silently ignore for
    // other roles so a stray field doesn't poison the patient record.
    if (typeof specialty === 'string' && user.role === UserRoles.DOCTOR) {
      patch.specialty = specialty.trim()
    }

    // Disallow no-op submissions to surface client bugs early.
    if (Object.keys(patch).length === 0) {
      throw new ApiError(400, 'No editable fields provided.')
    }

    const updated = await this.userSvc.updateById(user._id, patch)

    this.log.info({
      msg: 'User profile updated',
      data: { userId: user._id, fields: Object.keys(patch) },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(200, this.toProfile(updated), 'Profile updated.')
      )
  }

  async changePassword(req, res) {
    const user = req.user
    const { currentPassword, newPassword } = req.body

    // Re-fetch with the hash since req.user is already stripped.
    const full = await this.userSvc.findById(user._id)
    if (!full?.passwordHash) {
      throw new ApiError(400, 'This account has no password set yet.')
    }

    const matches = await this.hashSvc.hashCompare(
      currentPassword,
      full.passwordHash
    )
    if (!matches) {
      throw new ApiError(401, 'Current password is incorrect.')
    }

    if (currentPassword === newPassword) {
      throw new ApiError(
        400,
        'New password must be different from the current one.'
      )
    }

    const passwordHash = await this.hashSvc.hashData(newPassword)
    await this.userSvc.updateById(user._id, { passwordHash })

    this.log.info({
      msg: 'User password changed',
      data: { userId: user._id },
    })

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'Password changed successfully.'))
  }
}

export default UserController
