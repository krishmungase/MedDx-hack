import morganMiddleware from './morgan.middleware.js'
import validate from './validate.middleware.js'
import errorHandler from './error.middleware.js'
import uploader from './uploader.middleware.js'
import {
  verifyJWT,
  getLoggedInUserOrIgnore,
  verifyPermission,
  avoidInProduction,
} from './auth.middleware.js'

export {
  morganMiddleware,
  validate,
  errorHandler,
  uploader,
  verifyJWT,
  getLoggedInUserOrIgnore,
  verifyPermission,
  avoidInProduction,
}
