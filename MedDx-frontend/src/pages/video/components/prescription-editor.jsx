import { useState } from 'react'
import { Pill, Plus, ShieldAlert, Sparkles, Trash2, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { usePrescriptionFormat } from '@/apis'
import { errorToast } from '@/lib'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिंदी)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
]

const emptyMed = () => ({
  name: '',
  dose: '',
  frequency: '',
  duration: '',
  notes: '',
})

const ensureShape = (rx) => ({
  medications:
    Array.isArray(rx?.medications) && rx.medications.length
      ? rx.medications.map((m) => ({ ...emptyMed(), ...m }))
      : [],
  advice: Array.isArray(rx?.advice) ? rx.advice : [],
  followUp: rx?.followUp || '',
  plainLanguageSummary: rx?.plainLanguageSummary || '',
  language: rx?.language || 'en',
  rawText: rx?.rawText || '',
})

/**
 * Prescription editor:
 *  - Free-text textarea + "AI format" button → calls Groq, fills the structured fields.
 *  - Structured fields editable by the doctor.
 *  - onChange emits whichever shape exists: structured object or null if cleared.
 *
 * Backend stores whatever we send (Schema.Types.Mixed on the model).
 */
const PrescriptionEditor = ({ value, onChange, defaultLanguage = 'en' }) => {
  const [raw, setRaw] = useState(value?.rawText || '')
  const [language, setLanguage] = useState(value?.language || defaultLanguage)
  const [structured, setStructured] = useState(
    value && (value.medications?.length || value.plainLanguageSummary)
      ? ensureShape(value)
      : null
  )

  const { formatPrescriptionAsync, isLoading } = usePrescriptionFormat()

  const emit = (next) => {
    setStructured(next)
    if (!next) {
      onChange(raw.trim() ? { rawText: raw.trim() } : null)
    } else {
      onChange(next)
    }
  }

  // Runs the AI formatter. Accepts an explicit language so the language
  // dropdown can trigger a re-translation without needing the local state
  // to settle first.
  const runFormat = async (langOverride) => {
    const text = raw.trim()
    if (text.length < 2) {
      errorToast({ message: 'Type a prescription first.' })
      return false
    }
    const lang = langOverride || language
    try {
      const payload = await formatPrescriptionAsync({
        data: { rawText: text, language: lang },
      })
      const shaped = ensureShape({
        ...payload.prescription,
        rawText: text,
        language: payload.prescription?.language || lang,
      })
      emit(shaped)
      return true
    } catch (err) {
      errorToast({
        message:
          err?.response?.data?.message ||
          'Could not format the prescription. Try again or save as plain text.',
      })
      return false
    }
  }

  const onFormat = () => runFormat()

  const updateMed = (idx, patch) => {
    const next = {
      ...structured,
      medications: structured.medications.map((m, i) =>
        i === idx ? { ...m, ...patch } : m
      ),
    }
    emit(next)
  }
  const removeMed = (idx) => {
    const next = {
      ...structured,
      medications: structured.medications.filter((_, i) => i !== idx),
    }
    emit(next)
  }
  const addMed = () => {
    const next = {
      ...structured,
      medications: [...structured.medications, emptyMed()],
    }
    emit(next)
  }

  const updateAdvice = (idx, val) => {
    const next = {
      ...structured,
      advice: structured.advice.map((a, i) => (i === idx ? val : a)),
    }
    emit(next)
  }
  const removeAdvice = (idx) => {
    const next = {
      ...structured,
      advice: structured.advice.filter((_, i) => i !== idx),
    }
    emit(next)
  }
  const addAdvice = () => {
    const next = { ...structured, advice: [...structured.advice, ''] }
    emit(next)
  }

  const resetStructured = () => {
    setStructured(null)
    onChange(raw.trim() ? { rawText: raw.trim() } : null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
          Prescription
        </Label>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(v) => {
              setLanguage(v)
              // If we already have a structured prescription, re-run the AI
              // formatter so the plain-language summary and free-text fields
              // actually get translated into the new language. Doctor's
              // manual edits to medication names/doses are preserved by
              // re-running on the same rawText, but they'll want to scan
              // the result anyway since the summary will change.
              if (structured && raw.trim().length >= 2) {
                runFormat(v)
              } else if (structured) {
                emit({ ...structured, language: v })
              }
            }}
          >
            <SelectTrigger className="h-7 rounded-full text-[11px] bg-card border-border w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Textarea
        rows={3}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value)
          if (!structured) {
            onChange(e.target.value.trim() ? { rawText: e.target.value.trim() } : null)
          }
        }}
        placeholder="Type freely — e.g. amoxi 500 tds 5 days after meals, paracetamol 500 prn"
        className="rounded-xl resize-none font-mono text-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onFormat}
          disabled={isLoading || !raw.trim()}
        >
          {isLoading ? <Spinner /> : <Wand2 className="h-3.5 w-3.5" />}
          AI format
        </Button>
        {structured && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={resetStructured}
          >
            Clear structured
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 ml-auto">
          <ShieldAlert className="h-3 w-3 text-clinic" />
          AI formats — never prescribes.
        </p>
      </div>

      {structured && (
        <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-3">
          <div className="flex items-center gap-2">
            <Pill className="h-3.5 w-3.5 text-clinic" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Medications
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto rounded-full h-6 px-2 text-[11px]"
              onClick={addMed}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
          {structured.medications.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No medications. Add one or write some text and tap AI format.
            </p>
          ) : (
            <ul className="space-y-2">
              {structured.medications.map((m, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border/60 bg-background p-2 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={m.name}
                      onChange={(e) => updateMed(i, { name: e.target.value })}
                      placeholder="Drug name"
                      className="h-8 text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeMed(i)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Remove medication"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input
                      value={m.dose}
                      onChange={(e) => updateMed(i, { dose: e.target.value })}
                      placeholder="Dose"
                      className="h-7 text-[11px]"
                    />
                    <Input
                      value={m.frequency}
                      onChange={(e) =>
                        updateMed(i, { frequency: e.target.value })
                      }
                      placeholder="Frequency"
                      className="h-7 text-[11px]"
                    />
                    <Input
                      value={m.duration}
                      onChange={(e) =>
                        updateMed(i, { duration: e.target.value })
                      }
                      placeholder="Duration"
                      className="h-7 text-[11px]"
                    />
                  </div>
                  {m.notes && (
                    <Input
                      value={m.notes}
                      onChange={(e) => updateMed(i, { notes: e.target.value })}
                      placeholder="Notes"
                      className="h-7 text-[11px]"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 pt-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Advice
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto rounded-full h-6 px-2 text-[11px]"
              onClick={addAdvice}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
          {structured.advice.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No non-drug advice yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {structured.advice.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Input
                    value={a}
                    onChange={(e) => updateAdvice(i, e.target.value)}
                    className="h-7 text-[11px] flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdvice(i)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Remove advice"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-1 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Follow-up
            </Label>
            <Input
              value={structured.followUp}
              onChange={(e) => emit({ ...structured, followUp: e.target.value })}
              placeholder="e.g. Follow up in 7 days if symptoms persist."
              className="h-8 text-xs"
            />
          </div>

          <div className="pt-1 space-y-1.5">
            <Label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-clinic" />
              Plain-language summary for the patient
            </Label>
            <Textarea
              rows={3}
              value={structured.plainLanguageSummary}
              onChange={(e) =>
                emit({ ...structured, plainLanguageSummary: e.target.value })
              }
              placeholder="Friendly summary the patient will see in their record."
              className="rounded-lg resize-none text-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionEditor
