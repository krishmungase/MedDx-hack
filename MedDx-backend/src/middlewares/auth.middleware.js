import jwt from 'jsonwebtoken'

import { ENV } from '../config/index.js'
import { UserModel } from '../models/index.js'
import { ApiError, asyncHandler } from '../utils/index.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new ApiError(401, 'Unauthorized request')
  }

  try {
    const decodedToken = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET)
    const user = await UserModel.findById(decodedToken?.user?._id).select(
      '-password'
    )
    if (!user) {
      throw new ApiError(401, 'Invalid access token')
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token')
  }
})

export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '')

  try {
    const decodedToken = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET)
    const user = await UserModel.findById(decodedToken?._id).select('-password')
    req.user = user
    next()
  } catch (error) {
    next()
  }
})

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
