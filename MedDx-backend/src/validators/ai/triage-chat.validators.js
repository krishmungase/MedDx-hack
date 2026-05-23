import { body } from 'express-validator'

const triageChatValidator = [
  body('history')
    .isArray({ min: 1, max: 30 })
    .withMessage('History must be an array of 1–30 messages'),
  body('history.*.role')
    .isIn(['user', 'assistant'])
    .withMessage("Each message role must be 'user' or 'assistant'"),
  body('history.*.content')
    .isString()
    .withMessage('Each message content must be a string')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message content must be 1–4000 characters'),
  body('language').optional().isString().isLength({ max: 12 }),
]

export { triageChatValidator }
