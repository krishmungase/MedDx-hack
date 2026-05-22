import { body, query } from 'express-validator'

const createNotEmptyMessage = (field) => `${field} is required`

const emailField = body('email')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Email'))
  .isEmail()
  .withMessage('Email is invalid')
  .normalizeEmail()

const passwordField = body('password')
  .notEmpty()
  .withMessage(createNotEmptyMessage('Password'))
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')

const nameField = body('name')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Name'))
  .isLength({ min: 2 })
  .withMessage('Name must be at least 2 characters long')

const tokenBody = body('token')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Token'))

const tokenQuery = query('token')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Token'))

const registerValidator = [nameField, emailField, passwordField]
const loginValidator = [emailField, passwordField]
const setPasswordValidator = [tokenBody, passwordField]
const verifySetupTokenValidator = [tokenQuery]

export {
  registerValidator,
  loginValidator,
  setPasswordValidator,
  verifySetupTokenValidator,
}
