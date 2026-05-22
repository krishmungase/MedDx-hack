import { body } from 'express-validator'

const prescriptionFormatValidator = [
  body('rawText')
    .isString()
    .withMessage('Prescription text required')
    .trim()
    .isLength({ min: 2, max: 4000 })
    .withMessage('Prescription should be 2 to 4000 characters'),
  body('language')
    .optional()
    .isIn(['en', 'hi', 'mr'])
    .withMessage('Unsupported language'),
  body('patientContext').optional().isString().isLength({ max: 2000 }),
]

export { prescriptionFormatValidator }
