import { body } from 'express-validator'

const createNotEmptyMessage = (field) => `${field} is required`

const emailField = body('email')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Email'))
  .isEmail()
  .withMessage('Email is invalid')

const passwordField = body('password')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Password'))
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')

const confirmPasswordField = body('confirmPassword')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Confirm password'))
  .custom((value, { req }) => value === req.body.password)
  .withMessage('Passwords do not match')

const tokenField = body('token')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Token'))

const nameField = body('fullName')
  .trim()
  .notEmpty()
  .withMessage(createNotEmptyMessage('Full Name'))
  .isLength({ min: 3 })
  .withMessage('Name must be at least 3 characters long')

const registerValidator = [emailField, nameField]

const passwordValidator = [passwordField, confirmPasswordField, tokenField]

const loginValidator = [emailField, passwordField]

const emailValidator = [emailField]

const tokenValidator = [tokenField]

export {
  registerValidator,
  passwordValidator,
  loginValidator,
  emailValidator,
  tokenValidator,
}
