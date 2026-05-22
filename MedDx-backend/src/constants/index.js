import MSG from './msg.js'
import URLS from './urls.js'

export const UserLoginType = {
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
}

export const UserRoles = {
  ADMIN: 'Admin',
  USER: 'User',
}

export const PricingModel = {
  FREE: 'Free',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
}

export const AvailableUserRoles = Object.values(UserRoles)
export const AvailablePricingModels = Object.values(PricingModel)
export const AvailableUserLoginTypes = Object.values(UserLoginType)

export { MSG, URLS }
