import { useState } from 'react'
import { ClipboardCheck, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { useSubmitConsultation } from '@/apis'

const ConsultationNotesForm = ({ appointment, onSubmitted }) => {
  const isCompleted = appointment?.status === 'completed'
  const [notes, setNotes] = useState(appointment?.doctorNotes || '')
  const [prescription, setPrescription] = useState(
    typeof appointment?.prescription === 'string'
      ? appointment.prescription
      : appointment?.prescription
        ? JSON.stringify(appointment.prescription, null, 2)
        : ''
  )

  const { isLoading, submitConsultation } = useSubmitConsultation({
    onSuccess: (payload) => onSubmitted?.(payload.appointment),
  })

  const onSubmit = (e) => {
    e.preventDefault()
    submitConsultation({
      id: appointment._id,
      data: {
        doctorNotes: notes,
        prescription: prescription || null,
      },
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full flex-col gap-3 overflow-y-auto p-4"
    >
      <header>
        <div className="flex items-center gap-2 text-clinic">
          <ClipboardCheck className="h-4 w-4" />
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold">
            Consultation notes
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Save your notes and prescription before ending the call — they'll be
          attached to this patient's record.
        </p>
      </header>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
          Notes
        </label>
        <Textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Symptoms, examination findings, plan…"
          className="rounded-xl resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
          Prescription
        </label>
        <Textarea
          rows={4}
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          placeholder="Drug · dose · frequency · duration"
          className="rounded-xl resize-none font-mono text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 mt-auto h-11"
      >
        {isLoading ? <Spinner /> : <Save className="h-4 w-4" />}
        {isCompleted ? 'Update consultation' : 'Save & mark completed'}
      </Button>
    </form>
  )
}

export default ConsultationNotesForm
