import { ChatGroq } from '@langchain/groq'

import { logger } from '../../logger/index.js'
import { TriageUrgency } from '../../constants/index.js'

const MODEL = 'llama-3.3-70b-versatile'

// Server-side cap: after this many *prior* assistant questions, force a result.
// "Question N" means the (N+1)th assistant turn — we want at most 4 questions
// before a verdict.
const MAX_QUESTIONS = 4

const ALLOWED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi (हिंदी, Devanagari script)',
  mr: 'Marathi (मराठी, Devanagari script)',
}

const ALLOWED_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pulmonology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Psychiatry',
  'Gynecology',
  'ENT',
  'Gastroenterology',
  'Ophthalmology',
]

const VALID_URGENCIES = Object.values(TriageUrgency)

const buildSystemPrompt = ({ langLabel, mustFinalize, questionsAsked }) => `You are MedDx's conversational triage assistant. You are talking to a patient who has rural access and possibly low literacy. The conversation will be SPOKEN aloud to them (text-to-speech), and they will SPEAK their answers back. Keep every question short, simple, and easily speakable.

CRITICAL RULES — read carefully:
- You DO NOT diagnose, prescribe, or recommend treatment.
- You only:
  1. Ask short, clarifying follow-up questions (one at a time)
  2. Eventually estimate an urgency level + suggest a specialty
- Ask ONE question per turn. Never ask multiple questions in a single message.
- Keep each question under ~15 words. Speakable. No clinical jargon.
- Patient's language for question prose: ${langLabel}. Always write the "question" or "reason" fields in this language. JSON keys + enum values stay in English.
- Hard limit: at most ${MAX_QUESTIONS} questions total in the whole conversation. After ${MAX_QUESTIONS} questions, you MUST return type=result.
- ${mustFinalize ? `You have ALREADY asked ${questionsAsked} questions — you MUST return type=result now. Do NOT ask another question.` : `So far you have asked ${questionsAsked} question(s). You may ask another only if it would change the urgency or specialty; otherwise return type=result.`}

URGENCY definitions:
- "emergency" — chest pain, severe bleeding, unconsciousness, severe trauma, stroke signs (face droop / weakness / speech), anaphylaxis, suicidal intent, sudden vision loss, severe shortness of breath. Recommend calling emergency services.
- "high" — strong pain or signs that need same-day specialist attention.
- "medium" — bothersome but stable; should see a doctor in 1–3 days.
- "low" — mild / self-limiting; routine review.

ALLOWED specialties (pick exactly one): ${ALLOWED_SPECIALTIES.join(', ')}.
Default to "General Medicine" if unsure.

OUTPUT FORMAT — return ONLY a single JSON object, no markdown, no commentary, no code fences. Exactly one of these two shapes:

If asking a follow-up question (and you haven't hit the cap yet):
{ "type": "question", "question": "<one short question in ${langLabel}, speakable>" }

If giving the final result:
{
  "type": "result",
  "urgency_level": "low" | "medium" | "high" | "emergency",
  "recommended_specialty": "<one of the allowed specialties, in English>",
  "reason": "<one sentence in ${langLabel} explaining the urgency + specialty>",
  "english_summary": "<two-sentence neutral summary in English of what the patient described>"
}`

const extractJSON = (text) => {
  if (!text) return null
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenceMatch ? fenceMatch[1] : text).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }
}

const countAssistantQuestions = (messages) =>
  messages.filter((m) => m.role === 'assistant').length

const safeFallbackResult = (langLabel) => ({
  type: 'result',
  urgency_level: TriageUrgency.MEDIUM,
  recommended_specialty: 'General Medicine',
  reason:
    langLabel === ALLOWED_LANGUAGES.hi
      ? 'लक्षण स्पष्ट नहीं हो पाए। कृपया जल्द ही एक डॉक्टर से मिलें।'
      : langLabel === ALLOWED_LANGUAGES.mr
        ? 'लक्षणे स्पष्ट झाली नाहीत. कृपया लवकरच डॉक्टरांना भेटा.'
        : 'We could not fully clarify the symptoms — please see a doctor soon.',
  english_summary:
    'Triage chatbot could not parse a clear answer. Defaulted to medium urgency, General Medicine.',
})

class TriageChatService {
  constructor() {
    this.llm = new ChatGroq({ model: MODEL, temperature: 0.1 })
  }

  /**
   * Step the conversation forward.
   *
   * @param {Object} input
   * @param {Array<{role: 'user'|'assistant', content: string}>} input.history
   *        Conversation history so far. The latest entry should be the user's
   *        most recent reply.
   * @param {string} input.language  Patient language code ('en'|'hi'|'mr').
   * @returns {Promise<{type:'question', question:string} |
   *                   {type:'result', urgency, specialty, reason, summary}>}
   */
  async step({ history = [], language = 'en' }) {
    const lang = ALLOWED_LANGUAGES[language] ? language : 'en'
    const langLabel = ALLOWED_LANGUAGES[lang]

    const questionsAsked = countAssistantQuestions(history)
    const mustFinalize = questionsAsked >= MAX_QUESTIONS

    const systemPrompt = buildSystemPrompt({
      langLabel,
      mustFinalize,
      questionsAsked,
    })

    // Map our history to Groq's expected shape.
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || ''),
      })),
    ]

    let raw = ''
    try {
      const response = await this.llm.invoke(messages)
      raw =
        typeof response?.content === 'string'
          ? response.content
          : Array.isArray(response?.content)
            ? response.content.map((c) => c.text || '').join('\n')
            : ''
    } catch (err) {
      logger.error({ msg: 'TriageChat: model invoke failed', error: err?.message })
      return this._normalizeResult(safeFallbackResult(langLabel))
    }

    const parsed = extractJSON(raw)
    if (!parsed) {
      logger.warn({ msg: 'TriageChat: failed to parse model JSON', data: { raw } })
      return this._normalizeResult(safeFallbackResult(langLabel))
    }

    // Server-side enforcement: if we've hit the cap but the model still
    // returned a question, coerce to result. Likewise if the model returned
    // an unknown type.
    if (mustFinalize && parsed.type !== 'result') {
      logger.warn({
        msg: 'TriageChat: cap reached, coercing question to fallback result',
      })
      return this._normalizeResult(safeFallbackResult(langLabel))
    }

    if (parsed.type === 'question') {
      const question = String(parsed.question || '').trim()
      if (!question) {
        return this._normalizeResult(safeFallbackResult(langLabel))
      }
      return { type: 'question', question }
    }

    if (parsed.type === 'result') {
      return this._normalizeResult(parsed)
    }

    return this._normalizeResult(safeFallbackResult(langLabel))
  }

  _normalizeResult(parsed) {
    const urgency = String(parsed.urgency_level || '')
      .toLowerCase()
      .trim()
    const specialty = String(parsed.recommended_specialty || '').trim()
    return {
      type: 'result',
      urgency: VALID_URGENCIES.includes(urgency) ? urgency : TriageUrgency.MEDIUM,
      specialty: ALLOWED_SPECIALTIES.includes(specialty)
        ? specialty
        : 'General Medicine',
      reason: String(parsed.reason || '').trim(),
      summary: String(parsed.english_summary || '').trim(),
    }
  }
}

export default TriageChatService
export { MAX_QUESTIONS }
