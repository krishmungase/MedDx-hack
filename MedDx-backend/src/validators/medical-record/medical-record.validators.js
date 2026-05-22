import { param } from 'express-validator'

const patientIdParamValidator = [
  param('patientId').isMongoId().withMessage('Invalid patient id'),
]

export { patientIdParamValidator }
