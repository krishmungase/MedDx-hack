import { body, param } from 'express-validator'

import { AvailableTriageUrgencies } from '../../constants/index.js'

const bookValidator = [
  body('slotId').isMongoId().withMessage('Invalid slotId'),
  body('triageSummary')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Triage summary too long'),
  body('triageUrgency')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(AvailableTriageUrgencies)
    .withMessage('Invalid triage urgency'),
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
