import { body } from 'express-validator'

const triageValidator = [
  body('symptoms')
    .isString()
    .withMessage('Symptoms must be a string')
    .trim()
    .isLength({ min: 4, max: 4000 })
    .withMessage('Describe the symptoms in 4 to 4000 characters'),
  body('duration').optional().isString().isLength({ max: 200 }),
  body('severity').optional().isInt({ min: 0, max: 10 }),
  body('age').optional().isInt({ min: 0, max: 130 }),
  body('sex')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('extra').optional().isString().isLength({ max: 2000 }),
  body('language').optional().isString().isLength({ max: 12 }),
]

export { triageValidator }
