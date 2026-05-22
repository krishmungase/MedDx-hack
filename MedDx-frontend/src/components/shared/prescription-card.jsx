import {
  CalendarClock,
  Download,
  Pill,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { printPrescription } from '@/lib'

const looksStructured = (rx) =>
  rx &&
  typeof rx === 'object' &&
  (Array.isArray(rx.medications) ||
    rx.plainLanguageSummary ||
    rx.followUp ||
    rx.advice)

/**
 * Read-only render of a prescription saved on a consultation.
 *
 * Accepts either:
 *   - structured object {medications, advice, followUp, plainLanguageSummary, rawText, language}
 *   - legacy free-text string
 *   - { rawText } shape for non-AI-formatted entries
 *
 * Pass `printContext` to enable the Download button (opens a clean printable
 * sheet in a new window — browser handles "Save as PDF" natively).
 */
const PrescriptionCard = ({ prescription, compact = false, printContext }) => {
  if (!prescription) return null

  const onDownload = () =>
    printPrescription({
      prescription,
      doctorName: printContext?.doctorName,
      doctorSpecialty: printContext?.doctorSpecialty,
      patientName: printContext?.patientName,
      date: printContext?.date,
      notes: printContext?.notes,
    })

  if (typeof prescription === 'string') {
    return (
      <div className="space-y-2">
        <pre className="rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] font-mono whitespace-pre-wrap wrap-break-word">
          {prescription}
        </pre>
        {printContext && <DownloadAction onClick={onDownload} />}
      </div>
    )
  }

  if (!looksStructured(prescription)) {
    if (prescription.rawText) {
      return (
        <div className="space-y-2">
          <pre className="rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] font-mono whitespace-pre-wrap wrap-break-word">
            {prescription.rawText}
          </pre>
          {printContext && <DownloadAction onClick={onDownload} />}
        </div>
      )
    }
    return null
  }

  const meds = prescription.medications || []
  const advice = prescription.advice || []

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {prescription.plainLanguageSummary && (
        <div className="px-4 py-3 bg-sage/10 border-b border-sage/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3 w-3 text-clinic" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              In plain language
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            {prescription.plainLanguageSummary}
          </p>
        </div>
      )}

      {meds.length > 0 && (
        <div className="px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-3 w-3 text-clinic" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              Medications
            </p>
          </div>
          <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
            {meds.map((m, i) => (
              <li
                key={i}
                className="rounded-lg border border-border/60 bg-background/60 p-2.5"
              >
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-0.5">
                  {[m.dose, m.frequency, m.duration].filter(Boolean).join(' · ')}
                </p>
                {m.notes && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {m.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {advice.length > 0 && (
        <div className="px-4 py-3 border-b border-border/60">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5">
            Advice
          </p>
          <ul className="text-xs space-y-1 list-disc pl-4">
            {advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {prescription.followUp && (
        <div className="px-4 py-3 border-b border-border/60 flex items-start gap-2">
          <CalendarClock className="h-3.5 w-3.5 text-clinic mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">{prescription.followUp}</p>
        </div>
      )}

      <div className="px-4 py-2 flex items-center gap-2 bg-muted/40">
        <ShieldAlert className="h-3 w-3 text-clinic shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
          Reviewed and approved by your doctor on the call.
          {prescription.language && prescription.language !== 'en' && (
            <Badge
              variant="outline"
              className="ml-1.5 rounded-full text-[9px] uppercase tracking-[0.14em]"
            >
              {prescription.language}
            </Badge>
          )}
        </p>
        {printContext && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full h-7 px-3 text-[11px] text-clinic hover:bg-clinic/10"
            onClick={onDownload}
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        )}
      </div>
    </div>
  )
}

const DownloadAction = ({ onClick }) => (
  <div className="flex justify-end">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="rounded-full h-7 px-3 text-[11px] text-clinic hover:bg-clinic/10"
      onClick={onClick}
    >
      <Download className="h-3 w-3" />
      Download
    </Button>
  </div>
)

export default PrescriptionCard
