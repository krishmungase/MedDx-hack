import { body, param } from 'express-validator'

const feedbackSubmitValidator = [
  body('appointmentId')
    .isMongoId()
    .withMessage('appointmentId must be a valid id'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer from 1 to 5'),
  body('comment')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('comment must be at most 1000 characters'),
]

const appointmentIdParamValidator = [
  param('id').isMongoId().withMessage('id must be a valid id'),
]

export { feedbackSubmitValidator, appointmentIdParamValidator }
