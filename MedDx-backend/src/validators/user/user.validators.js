import { body } from 'express-validator'

// Update profile — all fields optional; controller checks at least one was sent.
const updateProfileValidator = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('language')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .withMessage('Language code is invalid'),
  body('specialty')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage('Specialty must be 2–64 characters'),
]

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
]

export { updateProfileValidator, changePasswordValidator }
