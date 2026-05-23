import { body, param } from 'express-validator'

const notEmpty = (field) => `${field} is required`

const registerDoctorValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Name'))
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Email'))
    .isEmail()
    .withMessage('Email is invalid')
    .normalizeEmail(),
  body('specialty')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Specialty'))
    .isLength({ min: 2 })
    .withMessage('Specialty must be at least 2 characters long'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('License number'))
    .isLength({ min: 2 })
    .withMessage('License number must be at least 2 characters long'),
]

const updateDoctorStatusValidator = [
  param('id').isMongoId().withMessage('Invalid doctor id'),
  body('accountStatus')
    .isIn(['active', 'suspended'])
    .withMessage("accountStatus must be 'active' or 'suspended'"),
]

const doctorIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid doctor id'),
]

const registerAshaValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Name'))
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Email'))
    .isEmail()
    .withMessage('Email is invalid')
    .normalizeEmail(),
  body('village')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('Village')),
  body('areaCode')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 40 }),
  body('ashaIdNumber')
    .trim()
    .notEmpty()
    .withMessage(notEmpty('ASHA ID number')),
  body('language').optional().isIn(['en', 'hi', 'mr']),
]

const updateAshaStatusValidator = [
  param('id').isMongoId().withMessage('Invalid ASHA id'),
  body('accountStatus')
    .isIn(['active', 'suspended'])
    .withMessage("accountStatus must be 'active' or 'suspended'"),
]

const ashaIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid ASHA id'),
]

export {
  registerDoctorValidator,
  updateDoctorStatusValidator,
  doctorIdParamValidator,
  registerAshaValidator,
  updateAshaStatusValidator,
  ashaIdParamValidator,
}
