import { body, param } from 'express-validator'

const notEmpty = (field) => `${field} is required`

const generateSlotsValidator = [
  body('startDateTime')
    .notEmpty()
    .withMessage(notEmpty('startDateTime'))
    .isISO8601()
    .withMessage('startDateTime must be a valid ISO date'),
  body('endDateTime')
    .notEmpty()
    .withMessage(notEmpty('endDateTime'))
    .isISO8601()
    .withMessage('endDateTime must be a valid ISO date'),
]

const slotIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid slot id'),
]

const doctorIdParamValidator = [
  param('doctorId').isMongoId().withMessage('Invalid doctor id'),
]

export {
  generateSlotsValidator,
  slotIdParamValidator,
  doctorIdParamValidator,
}
