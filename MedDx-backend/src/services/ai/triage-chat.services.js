import { ChatGroq } from '@langchain/groq'

import { logger } from '../../logger/index.js'
import { TriageUrgency } from '../../constants/index.js'

const MODEL = 'llama-3.3-70b-versatile'

// Server-side caps. We want a *conversation*, not a one-shot — so we ask the
// model to keep digging until it has covered all the standard dimensions
// (onset, duration, severity, associated symptoms, history). The hard upper
// bound prevents runaway loops.
const MIN_QUESTIONS = 5
const MAX_QUESTIONS = 7

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

const buildSystemPrompt = ({
  langLabel,
  mustFinalize,
  mustAskMore,
  questionsAsked,
}) => `You are MedDx's conversational triage assistant. You are talking to a patient who has rural access and possibly low literacy. The conversation will be SPOKEN aloud to them (text-to-speech), and they will SPEAK their answers back. Keep every question short, simple, and easily speakable.

CRITICAL RULES — read carefully:
- You DO NOT diagnose, prescribe, or recommend treatment.
- You only:
  1. Ask short, clarifying follow-up questions (one at a time)
  2. Eventually estimate an urgency level + suggest a specialty
- Ask ONE question per turn. Never ask multiple questions in a single message.
- Keep each question under ~15 words. Speakable. No clinical jargon.
- Patient's language for question prose: ${langLabel}. Always write the "question" or "reason" fields in this language. JSON keys + enum values stay in English.

CONVERSATION PACING — IMPORTANT:
- You must hold a real conversation, NOT jump to a result after one or two answers.
- Cover these dimensions before finalizing (one question per turn):
    1. Onset / duration ("when did this start?")
    2. Location & quality of the symptom ("where exactly? sharp/dull?")
    3. Severity ("how bad on a 1-to-10 scale?")
    4. Associated symptoms ("any fever, vomiting, breathing trouble?")
    5. Triggers / what makes it worse or better
    6. Relevant history (past similar episodes, ongoing conditions, medications)
- Minimum questions before result: ${MIN_QUESTIONS}.
- Maximum questions in total: ${MAX_QUESTIONS}.
- So far you have asked ${questionsAsked} question(s).
${mustFinalize
  ? `- You have reached the maximum. You MUST return type=result NOW. Do NOT ask another question.`
  : mustAskMore
    ? `- You have NOT yet asked ${MIN_QUESTIONS} questions. You MUST return type=question, picking the next unanswered dimension from the list above. Do NOT finalize yet.`
    : `- You have asked the minimum. You may finalize now, but prefer one more question if a useful dimension is still uncovered.`}

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
    const mustAskMore = !mustFinalize && questionsAsked < MIN_QUESTIONS

    const systemPrompt = buildSystemPrompt({
      langLabel,
      mustFinalize,
      mustAskMore,
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

    // Inverse: if the model tried to finalize before we've hit the minimum,
    // ignore its result and ask the next dimension instead. This forces a
    // real conversation rather than a one-shot.
    if (parsed.type === 'result' && mustAskMore) {
      logger.warn({
        msg: 'TriageChat: model finalized early, forcing follow-up question',
        data: { questionsAsked, min: MIN_QUESTIONS },
      })
      return {
        type: 'question',
        question: this._recoveryQuestion(langLabel, questionsAsked),
      }
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

  // Stock fallback questions in each language, indexed by how many turns
  // have already happened. Used when the model tries to finalize too early —
  // we keep the conversation moving instead of forcing a result.
  _recoveryQuestion(langLabel, questionsAsked) {
    const banks = {
      [ALLOWED_LANGUAGES.en]: [
        'How long has this been going on?',
        'Where exactly do you feel it, and how does it feel?',
        'On a scale of 1 to 10, how bad is the pain or discomfort?',
        'Any other symptoms — fever, vomiting, trouble breathing?',
        'Does anything make it worse or better?',
        'Have you had this before, or any ongoing health issues?',
      ],
      [ALLOWED_LANGUAGES.hi]: [
        'यह कब से हो रहा है?',
        'कहाँ महसूस होता है और कैसा दर्द है?',
        '1 से 10 में दर्द कितना है?',
        'कोई और तकलीफ़ है — बुखार, उल्टी, साँस की दिक्कत?',
        'किस से ज़्यादा बढ़ता है या कम होता है?',
        'पहले कभी ऐसा हुआ है, या कोई पुरानी बीमारी है?',
      ],
      [ALLOWED_LANGUAGES.mr]: [
        'हे कधीपासून होतंय?',
        'नक्की कुठे जाणवतंय आणि कसं वाटतंय?',
        '1 ते 10 मध्ये किती त्रास होतोय?',
        'दुसरं काही लक्षण आहे का — ताप, उलटी, श्वासाचा त्रास?',
        'कशामुळे वाढतं किंवा कमी होतं?',
        'पूर्वी असं झालंय का, किंवा काही जुना आजार आहे का?',
      ],
    }
    const bank = banks[langLabel] || banks[ALLOWED_LANGUAGES.en]
    return bank[Math.min(questionsAsked, bank.length - 1)]
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
export { MIN_QUESTIONS, MAX_QUESTIONS }
