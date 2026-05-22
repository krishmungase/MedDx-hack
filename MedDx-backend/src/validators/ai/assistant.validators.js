import { body } from 'express-validator'

const responseValidator = [
  body('message').trim().notEmpty().withMessage('User message is required'),
  body('threadId').trim().notEmpty().withMessage('Thread ID is required'),
]

export { responseValidator }
