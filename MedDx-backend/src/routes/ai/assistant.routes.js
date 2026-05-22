import express from 'express'

import { logger } from '../../logger/index.js'
import { asyncHandler } from '../../utils/index.js'
import { LLMServices } from '../../services/index.js'
import { validate } from '../../middlewares/index.js'
import { AssistantController } from '../../controllers/index.js'
import { responseValidator } from '../../validators/ai/assistant.validators.js'

const assistantRoutes = express.Router()
const chatBot = new LLMServices(logger)
const assistantController = new AssistantController(chatBot, logger)

const routeDefinitions = [
  {
    path: '/response',
    method: 'post',
    validators: [responseValidator, validate],
    handler: assistantController.response.bind(assistantController),
  },
]

routeDefinitions.forEach((route) => {
  assistantRoutes[route.method](
    route.path,
    ...route.validators,
    asyncHandler((req, res, next) => route.handler(req, res, next))
  )
})

export default assistantRoutes
