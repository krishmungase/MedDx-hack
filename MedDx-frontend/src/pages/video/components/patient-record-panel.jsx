import { format } from 'date-fns'
import {
  AlertTriangle,
  FileHeart,
  Pill,
  ScrollText,
  Stethoscope,
} from 'lucide-react'

import { usePatientMedicalRecord } from '@/apis'
import PrescriptionCard from '@/components/shared/prescription-card'

const PatientRecordPanel = ({ patientId, patientName }) => {
  const { record, isLoading } = usePatientMedicalRecord({
    patientId,
    enabled: !!patientId,
  })

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
    )
  }

  const consultations = record?.consultations || []
  const conditions = record?.conditions || []
  const allergies = record?.allergies || []
  const medications = record?.medications || []

  const hasAny =
    consultations.length > 0 ||
    conditions.length > 0 ||
    allergies.length > 0 ||
    medications.length > 0

  return (
    <div className="overflow-y-auto h-full">
      <header className="px-4 py-3 border-b border-border/60 bg-card sticky top-0 z-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          Patient history
        </p>
        <p className="font-display text-base tracking-tight mt-0.5 truncate">
          {patientName || 'Patient'}
        </p>
      </header>

      <div className="p-4 space-y-5">
        {conditions.length > 0 && (
          <Section icon={FileHeart} title="Conditions">
            <Chips items={conditions} tone="clinic" />
          </Section>
        )}
        {allergies.length > 0 && (
          <Section icon={AlertTriangle} title="Allergies">
            <Chips items={allergies} tone="destructive" />
          </Section>
        )}
        {medications.length > 0 && (
          <Section icon={Pill} title="Medications">
            <Chips items={medications} tone="sage" />
          </Section>
        )}

        <Section icon={ScrollText} title={`Past consultations (${consultations.length})`}>
          {consultations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No prior visits.</p>
          ) : (
            <ul className="space-y-3">
              {consultations
                .slice()
                .reverse()
                .map((c, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-border/60 bg-background/60 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3 text-clinic" />
                      <span className="font-mono tabular-nums">
                        {c.date ? format(new Date(c.date), 'MMM d, yyyy') : '—'}
                      </span>
                      {c.doctorId?.name && (
                        <>
                          <span className="opacity-50">·</span>
                          <span>Dr {c.doctorId.name}</span>
                        </>
                      )}
                    </div>
                    {c.notes && (
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {c.notes}
                      </p>
                    )}
                    {c.prescription && (
                      <div className="mt-2">
                        <PrescriptionCard
                          prescription={c.prescription}
                          compact
                        />
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </Section>

        {!hasAny && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No history on file yet — this is the patient's first visit.
          </div>
        )}
      </div>
    </div>
  )
}

const Section = ({ icon: Icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-3.5 w-3.5 text-clinic" />
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
        {title}
      </p>
    </div>
    {children}
  </div>
)

const TONE = {
  clinic: 'bg-clinic/10 text-clinic border-clinic/25',
  destructive: 'bg-destructive/10 text-destructive border-destructive/25',
  sage: 'bg-sage/15 text-sage-foreground border-sage/30',
}

const Chips = ({ items, tone = 'clinic' }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((x, i) => (
      <span
        key={`${x}-${i}`}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${TONE[tone] || TONE.clinic}`}
      >
        {x}
      </span>
    ))}
  </div>
)

export default PatientRecordPanel
