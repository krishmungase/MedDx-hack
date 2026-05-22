import jwt from 'jsonwebtoken'

import { ENV } from '../config/index.js'
import { UserModel } from '../models/index.js'
import { ApiError, asyncHandler } from '../utils/index.js'

const extractToken = (req) =>
  req.cookies?.accessToken ||
  req.header('Authorization')?.replace(/^Bearer\s+/i, '')

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req)
  if (!token) {
    throw new ApiError(401, 'Unauthorized request')
  }

  let decoded
  try {
    decoded = jwt.verify(token, ENV.JWT_SECRET)
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token')
  }

  const user = await UserModel.findById(decoded?.id).select('-passwordHash')
  if (!user) {
    throw new ApiError(401, 'Invalid access token')
  }

  req.user = user
  next()
})

export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token = extractToken(req)
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET)
    const user = await UserModel.findById(decoded?.id).select('-passwordHash')
    req.user = user || null
  } catch {
    req.user = null
  }
  next()
})

// Single-role gate per MedDx spec.
export const requireRole = (role) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, 'Unauthorized request')
    }
    if (req.user.role !== role) {
      throw new ApiError(403, 'You are not allowed to perform this action')
    }
    next()
  })

// Multi-role gate (retained from boilerplate; still useful for endpoints
// that accept more than one role, e.g. doctor OR admin).
export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, 'Unauthorized request')
    }
    if (roles.includes(req.user?.role)) {
      next()
    } else {
      throw new ApiError(403, 'You are not allowed to perform this action')
    }
  })

export const avoidInProduction = asyncHandler(async (req, res, next) => {
  if (ENV.NODE_ENV === 'development') {
    next()
  } else {
    throw new ApiError(
      403,
      'This service is only available in the local environment.'
    )
  }
})
