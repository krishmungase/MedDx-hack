import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, MicOff, Send, ShieldAlert, Sparkles } from 'lucide-react'

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

const TriageForm = ({ onSubmit, isLoading }) => {
  const { t, i18n } = useTranslation()

  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('1 day')
  const [severity, setSeverity] = useState(4)
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('prefer_not_to_say')
  const [extra, setExtra] = useState('')

  // Speech-to-text for the symptoms field. Uses the user's current i18n
  // language so a Hindi speaker gets Hindi transcription, etc. When the
  // browser doesn't support Web Speech, the mic button hides itself.
  const speech = useSpeechRecognition({
    language: i18n.language,
    onResult: (chunk, { final }) => {
      if (final) {
        setSymptoms((prev) =>
          prev ? `${prev.trim()} ${chunk}` : chunk
        )
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

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border/70 bg-card p-6 md:p-7 space-y-6"
    >
      <header>
        <div className="flex items-center gap-2 text-clinic">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.16em] font-semibold">
            {t('triage.card_eyebrow')}
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl tracking-tight">
          {t('triage.card_title')}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t('triage.card_subtitle')}
        </p>
      </header>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="symptoms"
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
          >
            {t('triage.symptoms_label')}
          </Label>
          {speech.isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={speech.toggle}
              className={`rounded-full h-7 px-3 text-[11px] ${
                speech.listening
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'text-clinic hover:bg-clinic/10'
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
                  <MicOff className="h-3 w-3" />
                  {t('triage.mic_listening')}
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3" />
                  {t('triage.mic_start')}
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          id="symptoms"
          rows={5}
          required
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder={t('triage.symptoms_placeholder')}
          className={`rounded-xl resize-none ${
            speech.listening ? 'ring-2 ring-clinic/40' : ''
          }`}
        />
        {!speech.isSupported && (
          <p className="text-[10px] text-muted-foreground">
            {t('triage.mic_unsupported')}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            {t('triage.duration_label')}
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border data-[size=default]:h-11">
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

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              {t('triage.severity_label')}
            </Label>
            <span className="text-xs font-mono tabular-nums text-muted-foreground">
              {severity} / 10
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
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 flex justify-between">
            <span>{t('triage.severity_mild')}</span>
            <span>{t('triage.severity_severe')}</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-start">
        <div className="space-y-1.5">
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
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
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
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                  sex === opt.v
                    ? 'border-clinic bg-clinic/10 text-clinic'
                    : 'border-border bg-card hover:bg-muted/60'
                }`}
              >
                <RadioGroupItem value={opt.v} id={`sex-${opt.v}`} />
                <span className="text-sm">{opt.l}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-1.5">
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
          className="rounded-xl resize-none"
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-clinic mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('triage.disclaimer')}
        </p>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 w-full sm:w-auto"
      >
        {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
        {t('triage.submit')}
      </Button>
    </form>
  )
}

export default TriageForm
