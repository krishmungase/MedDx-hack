import { ChatGroq } from '@langchain/groq'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from '@langchain/langgraph'
import { MSG } from '../../constants/index.js'

const MODEL_CONFIG = {
  model: 'openai/gpt-oss-120b',
  temperature: 0,
}

class LLMServices {
  constructor(logger) {
    this.tools = []
    this.llm = new ChatGroq(MODEL_CONFIG).bindTools(this.tools)
    this.toolNode = new ToolNode(this.tools)
    this.app = this.buildGraph()
    this.logger = logger
  }

  buildGraph() {
    const graph = new StateGraph(MessagesAnnotation)
      .addNode('llm', this.callLLM.bind(this))
      .addNode('tools', this.toolNode)
      .addEdge('__start__', 'llm')
      .addEdge('tools', 'llm')
      .addConditionalEdges('llm', this.routeToTools, {
        __end__: END,
        tools: 'tools',
      })

    return graph.compile({ checkpointer: new MemorySaver() })
  }

  async callLLM(state) {
    try {
      const response = await this.llm.invoke(state.messages)
      return { messages: [response] }
    } catch (error) {
      this.logger.error({
        msg: MSG.LLM.CALL_LLM_ERROR,
        error: JSON.stringify(error),
      })
      return {
        messages: [
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ],
      }
    }
  }

  routeToTools(state) {
    const lastMessage = state.messages.at(-1)
    return lastMessage?.tool_calls?.length ? 'tools' : '__end__'
  }

  async processUserInput(userInput, threadId) {
    if (!userInput?.trim()) return null

    try {
      const config = { configurable: { thread_id: threadId } }
      const result = await this.app.invoke(
        { messages: [{ role: 'user', content: userInput.trim() }] },
        config
      )

      return result.messages.at(-1)?.content || 'No response generated.'
    } catch (error) {
      console.error('Error processing input:', error.message)
      return "Sorry, I couldn't process your request. Please try again."
    }
  }
}

export default LLMServices
