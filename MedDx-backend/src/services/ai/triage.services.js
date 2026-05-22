import { ChatGroq } from '@langchain/groq'

import { logger } from '../../logger/index.js'
import { TriageUrgency } from '../../constants/index.js'

const MODEL = 'llama-3.3-70b-versatile'

// Specialties the LLM is allowed to recommend. Kept aligned with the
// onboarding wizard the admin uses for doctors.
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

const SYSTEM_PROMPT = `You are MedDx's triage assistant. You receive a patient's reported symptoms and triage them.

CRITICAL RULES — read carefully:
- You DO NOT diagnose, prescribe, or give treatment plans.
- You only:
  1. Estimate an urgency level
  2. Suggest a medical specialty
  3. Summarise the symptoms back to the patient in plain English

URGENCY definitions:
- "emergency" — only for: chest pain, severe bleeding, loss of consciousness, severe trauma, suspected stroke (face droop / weakness / speech), anaphylaxis, suicidal intent, sudden vision loss, severe shortness of breath. Recommend the patient call emergency services immediately.
- "high" — strong pain or signs that need same-day specialist attention (e.g. high fever > 24h in a child, persistent vomiting, severe headache w/ no history, signs of infection).
- "medium" — bothersome but stable; should see a doctor within 1–3 days.
- "low" — mild / self-limiting symptoms; routine review.

ALLOWED specialties (pick exactly one): ${ALLOWED_SPECIALTIES.join(', ')}.
If no specialty clearly fits, default to "General Medicine".

OUTPUT FORMAT — return ONLY a single JSON object, no markdown, no commentary, no code fences:
{
  "urgency_level": "low" | "medium" | "high" | "emergency",
  "recommended_specialty": "<one of the allowed specialties>",
  "reason": "<one sentence explaining why you chose that urgency + specialty>",
  "english_summary": "<two-sentence neutral summary of what the patient described>"
}`

const buildUserPrompt = ({ symptoms, duration, severity, age, sex, extra }) => {
  const lines = []
  if (age) lines.push(`Patient age: ${age}`)
  if (sex) lines.push(`Patient sex: ${sex}`)
  if (duration) lines.push(`Symptom duration: ${duration}`)
  if (severity != null) lines.push(`Self-reported severity (0–10): ${severity}`)
  lines.push('')
  lines.push('Symptoms:')
  lines.push(symptoms.trim())
  if (extra && extra.trim()) {
    lines.push('')
    lines.push('Additional context:')
    lines.push(extra.trim())
  }
  return lines.join('\n')
}

// Extract a JSON object from a model response — handles ```json fences,
// stray prose, etc. by grabbing the first {...} block.
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

class TriageService {
  constructor() {
    this.llm = new ChatGroq({ model: MODEL, temperature: 0 })
  }

  async assess(input) {
    const userPrompt = buildUserPrompt(input)
    const response = await this.llm.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ])

    const raw =
      typeof response?.content === 'string'
        ? response.content
        : Array.isArray(response?.content)
          ? response.content.map((c) => c.text || '').join('\n')
          : ''

    const parsed = extractJSON(raw)
    if (!parsed) {
      logger.warn({ msg: 'Triage: failed to parse model JSON', data: { raw } })
      throw new Error('Could not parse triage response from the model.')
    }

    // Defensive normalisation — the model occasionally returns
    // capitalised or otherwise off-grid values.
    const urgency = String(parsed.urgency_level || '')
      .toLowerCase()
      .trim()
    const specialty = String(parsed.recommended_specialty || '').trim()

    return {
      urgency: VALID_URGENCIES.includes(urgency) ? urgency : TriageUrgency.MEDIUM,
      specialty: ALLOWED_SPECIALTIES.includes(specialty)
        ? specialty
        : 'General Medicine',
      reason: String(parsed.reason || '').trim(),
      summary: String(parsed.english_summary || '').trim(),
      // Echo the model's raw classification so the UI can show "off-grid"
      // values to the doctor for context if we ever care.
      rawUrgency: parsed.urgency_level,
      rawSpecialty: parsed.recommended_specialty,
      allowedSpecialties: ALLOWED_SPECIALTIES,
    }
  }
}

export default TriageService
export { ALLOWED_SPECIALTIES }
