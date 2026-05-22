import { useState } from 'react'
import { Send, ShieldAlert, Sparkles } from 'lucide-react'

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

import { errorToast } from '@/lib'

const DURATIONS = [
  { value: '<1 hour', label: 'Less than an hour' },
  { value: 'few hours', label: 'A few hours' },
  { value: '1 day', label: 'About a day' },
  { value: '2-3 days', label: '2 – 3 days' },
  { value: '1 week', label: 'Around a week' },
  { value: '>1 week', label: 'More than a week' },
  { value: '>1 month', label: 'More than a month' },
]

const TriageForm = ({ onSubmit, isLoading }) => {
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('1 day')
  const [severity, setSeverity] = useState(4)
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('prefer_not_to_say')
  const [extra, setExtra] = useState('')

  const submit = (e) => {
    e.preventDefault()
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
            Symptom check
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl tracking-tight">
          Tell us what's bothering you.
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Our triage assistant suggests an urgency level and the right
          specialist. It's not a diagnosis — a licensed doctor will see you on
          video.
        </p>
      </header>

      <div className="space-y-1.5">
        <Label
          htmlFor="symptoms"
          className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
        >
          What are you feeling?
        </Label>
        <Textarea
          id="symptoms"
          rows={5}
          required
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. chest tightness for the last two hours, gets worse when I climb stairs, no recent injury"
          className="rounded-xl resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            How long has this been going on?
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border data-[size=default]:h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              How severe is it?
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
            <span>Mild</span>
            <span>Severe</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-start">
        <div className="space-y-1.5">
          <Label
            htmlFor="age"
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
          >
            Age
          </Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={130}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 32"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            Sex
          </Label>
          <RadioGroup
            value={sex}
            onValueChange={setSex}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {[
              { v: 'male', l: 'Male' },
              { v: 'female', l: 'Female' },
              { v: 'other', l: 'Other' },
              { v: 'prefer_not_to_say', l: 'Skip' },
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
          Anything else? (optional)
        </Label>
        <Textarea
          id="extra"
          rows={2}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Allergies, recent medications, conditions you already manage"
          className="rounded-xl resize-none"
        />
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-clinic mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This is <strong className="text-foreground">not a diagnosis</strong>{' '}
          and won't appear in your medical record on its own. A licensed doctor
          on MedDx reviews every case on the video call.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 w-full sm:w-auto"
      >
        {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
        Run symptom check
      </Button>
    </form>
  )
}

export default TriageForm
