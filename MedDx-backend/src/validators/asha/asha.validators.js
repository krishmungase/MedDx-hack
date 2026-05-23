import { body, param } from 'express-validator'

import { AvailableGenders } from '../../constants/index.js'

const addPatientValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('age').optional({ nullable: true }).isInt({ min: 0, max: 130 }),
  body('gender').optional().isIn(AvailableGenders),
  body('phone').optional({ nullable: true }).isString().isLength({ max: 20 }),
  body('language').optional().isIn(['en', 'hi', 'mr']),
  body('village').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 2000 }),
]

const villagePatientIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid village patient id'),
]

export { addPatientValidator, villagePatientIdParamValidator }
