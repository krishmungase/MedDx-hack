import { ChatGroq } from '@langchain/groq'

import { logger } from '../../logger/index.js'

const MODEL = 'llama-3.3-70b-versatile'

// Supported plain-language locales for the patient-facing summary.
const ALLOWED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  mr: 'Marathi (मराठी)',
}

const SYSTEM_PROMPT = `You are MedDx's prescription formatter.

A licensed doctor will paste a free-text prescription. Your job is to:
1. Convert it into a clean structured object
2. Write a short plain-language summary the patient can actually understand

CRITICAL RULES:
- DO NOT invent or add medications the doctor did not mention.
- DO NOT add diagnosis, dosage advice, or clinical recommendations the doctor did not write.
- DO expand standard abbreviations (e.g. "tds" → "three times a day", "bd" → "twice a day", "qhs" → "at bedtime", "po" → "by mouth", "prn" → "as needed", "sos" → "as needed"). If an abbreviation is ambiguous, leave it as-is.
- DO clean up casing and spacing.
- The plain-language summary must be in the patient's language and use simple, everyday words. Aim for a class-6 reading level.

OUTPUT FORMAT — return ONLY a single JSON object, no markdown, no prose:
{
  "medications": [
    {
      "name": "<drug name>",
      "dose": "<dose, e.g. '500 mg'>",
      "frequency": "<how often, e.g. 'three times a day'>",
      "duration": "<how long, e.g. '5 days', or '' if not specified>",
      "notes": "<extra instructions, e.g. 'take after meals', or ''>"
    }
  ],
  "advice": ["<short non-drug instruction>", ...],
  "follow_up": "<one short sentence, e.g. 'Follow up in 7 days if no improvement.', or ''>",
  "plain_language_summary": "<friendly patient-facing summary in the requested language>"
}

If the input does not look like a prescription at all, return:
{ "medications": [], "advice": [], "follow_up": "", "plain_language_summary": "<polite note saying no prescription was given>" }`

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

class PrescriptionFormatterService {
  constructor() {
    // Low temperature — we're transforming, not generating.
    this.llm = new ChatGroq({ model: MODEL, temperature: 0 })
  }

  async format({ rawText, language = 'en', patientContext }) {
    const lang = ALLOWED_LANGUAGES[language] ? language : 'en'
    const langLabel = ALLOWED_LANGUAGES[lang]

    const userPrompt = [
      `Patient language for the summary: ${langLabel}.`,
      patientContext ? `Patient context: ${patientContext}` : '',
      '',
      "Doctor's prescription (verbatim):",
      rawText.trim(),
    ]
      .filter(Boolean)
      .join('\n')

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
      logger.warn({
        msg: 'Prescription formatter: failed to parse JSON',
        data: { raw },
      })
      throw new Error('Could not format prescription right now.')
    }

    // Defensive normalisation — keep arrays as arrays even if the model
    // shipped a single string.
    const medications = Array.isArray(parsed.medications)
      ? parsed.medications
          .filter((m) => m && typeof m === 'object')
          .map((m) => ({
            name: String(m.name || '').trim(),
            dose: String(m.dose || '').trim(),
            frequency: String(m.frequency || '').trim(),
            duration: String(m.duration || '').trim(),
            notes: String(m.notes || '').trim(),
          }))
          .filter((m) => m.name)
      : []

    const advice = Array.isArray(parsed.advice)
      ? parsed.advice.map((a) => String(a).trim()).filter(Boolean)
      : []

    return {
      medications,
      advice,
      followUp: String(parsed.follow_up || '').trim(),
      plainLanguageSummary: String(parsed.plain_language_summary || '').trim(),
      language: lang,
      rawText: rawText.trim(),
    }
  }
}

export default PrescriptionFormatterService
