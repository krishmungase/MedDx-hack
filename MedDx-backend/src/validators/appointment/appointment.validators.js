import { body, param } from 'express-validator'

const bookValidator = [
  body('slotId').isMongoId().withMessage('Invalid slotId'),
]

const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid appointment id'),
]

const submitConsultationValidator = [
  ...idParamValidator,
  body('doctorNotes')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 5000 })
    .withMessage('Notes too long'),
  body('prescription').optional({ nullable: true }),
]

export { bookValidator, idParamValidator, submitConsultationValidator }
