import { MSG } from '../../constants/index.js'
import { ApiResponse } from '../../utils/index.js'

class AssistantController {
  constructor(chatBot, logger) {
    this.chatBot = chatBot
    this.logger = logger
  }

  async response(req, res) {
    const { message, threadId } = req.body

    this.logger.info({
      msg: MSG.ASSISTANT.GENERATE_RESPONSE,
      data: { message, threadId },
    })

    const response = await this.chatBot.processUserInput(message, threadId)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { threadId, response },
          'Response generated successfully'
        )
      )
  }
}

export default AssistantController
