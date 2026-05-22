import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Languages,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  Sparkles,
  Thermometer,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { useSpeechRecognition } from '@/hooks'
import { errorToast } from '@/lib'

const DURATION_KEYS = [
  { value: '<1 hour', tKey: 'duration.lt_1h' },
  { value: 'few hours', tKey: 'duration.few_hours' },
  { value: '1 day', tKey: 'duration.1d' },
  { value: '2-3 days', tKey: 'duration.2_3d' },
  { value: '1 week', tKey: 'duration.1w' },
  { value: '>1 week', tKey: 'duration.gt_1w' },
  { value: '>1 month', tKey: 'duration.gt_1m' },
]

// Severity tone — gradient from sage (mild) → amber → destructive (severe).
const severityTone = (s) => {
  if (s <= 3) return { label: 'Mild', color: 'sage' }
  if (s <= 6) return { label: 'Moderate', color: 'amber' }
  if (s <= 8) return { label: 'Severe', color: 'amber' }
  return { label: 'Critical', color: 'destructive' }
}

const TONE_PILL = {
  sage: 'bg-sage/15 text-sage-foreground border-sage/30',
  amber: 'bg-amber-warm/15 text-amber-warm border-amber-warm/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/25',
}

const TriageForm = ({ onSubmit, isLoading }) => {
  const { t, i18n } = useTranslation()

  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('1 day')
  const [severity, setSeverity] = useState(4)
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('prefer_not_to_say')
  const [extra, setExtra] = useState('')

  const speech = useSpeechRecognition({
    language: i18n.language,
    onResult: (chunk, { final }) => {
      if (final) {
        setSymptoms((prev) => (prev ? `${prev.trim()} ${chunk}` : chunk))
      }
    },
  })

  const submit = (e) => {
    e.preventDefault()
    if (speech.listening) speech.stop()
    const cleaned = symptoms.trim()
    if (cleaned.length < 4) {
      return errorToast({
        message: 'Tell us a bit more — describe what you’re feeling.',
      })
    }
    onSubmit({
      symptoms: cleaned,
      duration,
      severity,
      age: age ? Number(age) : undefined,
      sex,
      extra: extra.trim() || undefined,
      language: i18n.language,
    })
  }

  const tone = severityTone(severity)

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* ── Section 1: Describe ───────────────────────────────────────────── */}
      <Section
        step={1}
        icon={Activity}
        title={t('triage.symptoms_label')}
        description={t('triage.card_subtitle')}
      >
        <div className="relative">
          <Textarea
            id="symptoms"
            rows={5}
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('triage.symptoms_placeholder')}
            className={`rounded-xl resize-none text-base bg-background pr-32 ${
              speech.listening ? 'ring-2 ring-primary/40' : ''
            }`}
          />
          {speech.isSupported && (
            <Button
              type="button"
              size="sm"
              onClick={speech.toggle}
              className={`absolute right-3 top-3 h-8 rounded-full px-3 text-xs font-semibold shadow-sm ${
                speech.listening
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              aria-pressed={speech.listening}
              title={
                speech.listening
                  ? t('triage.mic_listening')
                  : t('triage.mic_start')
              }
            >
              {speech.listening ? (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  Speak
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <Languages className="h-3 w-3" />
          {speech.isSupported
            ? 'You can type or speak — in Hindi, Marathi, or English'
            : t('triage.mic_unsupported')}
        </p>
      </Section>

      {/* ── Section 2: Duration + severity ────────────────────────────────── */}
      <Section
        step={2}
        icon={Thermometer}
        title="How long, how bad?"
        description="A quick read on the timeline and intensity helps us route correctly."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {t('triage.duration_label')}
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-11 rounded-xl bg-background border-border data-[size=default]:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_KEYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {t(d.tKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                {t('triage.severity_label')}
              </Label>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONE_PILL[tone.color]}`}
              >
                {tone.label}
                <span className="font-mono tabular-nums opacity-70">
                  {severity}/10
                </span>
              </span>
            </div>
            <Slider
              value={[severity]}
              onValueChange={(v) => setSeverity(v[0])}
              min={0}
              max={10}
              step={1}
              className="py-3"
            />
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 flex justify-between">
              <span>{t('triage.severity_mild')}</span>
              <span>{t('triage.severity_severe')}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 3: About you ──────────────────────────────────────────── */}
      <Section
        step={3}
        icon={UserRound}
        title="About you"
        description="Optional context that helps the doctor prepare for the call."
      >
        <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-start">
          <div className="space-y-2">
            <Label
              htmlFor="age"
              className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
            >
              {t('triage.age_label')}
            </Label>
            <Input
              id="age"
              type="number"
              min={0}
              max={130}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="32"
              className="h-11 rounded-xl bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {t('triage.sex_label')}
            </Label>
            <RadioGroup
              value={sex}
              onValueChange={setSex}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {[
                { v: 'male', l: t('triage.sex_male') },
                { v: 'female', l: t('triage.sex_female') },
                { v: 'other', l: t('triage.sex_other') },
                { v: 'prefer_not_to_say', l: t('triage.sex_skip') },
              ].map((opt) => (
                <label
                  key={opt.v}
                  htmlFor={`sex-${opt.v}`}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                    sex === opt.v
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-background hover:border-primary/30 hover:bg-muted/60'
                  }`}
                >
                  <RadioGroupItem value={opt.v} id={`sex-${opt.v}`} />
                  <span className="text-sm">{opt.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="extra"
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
          >
            {t('triage.extra_label')}
          </Label>
          <Textarea
            id="extra"
            rows={2}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={t('triage.extra_placeholder')}
            className="rounded-xl resize-none bg-background"
          />
        </div>
      </Section>

      {/* ── Disclaimer + submit ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/70 bg-soft-mesh p-4 flex items-start gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('triage.disclaimer')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 w-full sm:w-auto shadow-md shadow-primary/20"
        >
          {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
          {t('triage.submit')}
        </Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const Section = ({ step, icon: Icon, title, description, children }) => (
  <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 space-y-5 shadow-sm">
    <span
      className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary to-primary/30"
      aria-hidden
    />
    <header className="flex items-start gap-3 pl-1">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/15">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary tabular-nums">
            Step {step}
          </span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            <Sparkles className="inline h-3 w-3 mr-1" />
            AI-assisted
          </span>
        </div>
        <h3 className="mt-0.5 font-display text-xl tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </header>
    <div className="space-y-3 pl-1">{children}</div>
  </section>
)

export default TriageForm
