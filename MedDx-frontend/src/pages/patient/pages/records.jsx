import { format } from 'date-fns'
import {
  AlertTriangle,
  FileHeart,
  FileText,
  History,
  Pill,
  RefreshCw,
  Stethoscope,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { usePatientMedicalRecord } from '@/apis'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PrescriptionCard from '@/components/shared/prescription-card'

const RecordsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { user } = useAuth()
  const { record, isLoading, isFetching, refetch } = usePatientMedicalRecord({
    patientId: user?._id,
    enabled: !!user?._id,
  })

  const conditions = record?.conditions || []
  const allergies = record?.allergies || []
  const medications = record?.medications || []
  const consultations = record?.consultations || []

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            My records.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Everything your MedDx doctors have approved and added to your
            chart. AI helps format these — only a licensed doctor can write
            them.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => refetch?.()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="fade-up fade-up-delay-1 grid sm:grid-cols-3 gap-3">
            <ChipsCard
              icon={FileHeart}
              label="Conditions"
              items={conditions}
              tone="clinic"
            />
            <ChipsCard
              icon={AlertTriangle}
              label="Allergies"
              items={allergies}
              tone="destructive"
            />
            <ChipsCard
              icon={Pill}
              label="Medications"
              items={medications}
              tone="sage"
            />
          </div>

          <section className="fade-up fade-up-delay-2 rounded-2xl border border-border/70 bg-card overflow-hidden">
            <header className="px-6 py-4 border-b border-border/70 flex items-center gap-2">
              <History className="h-4 w-4 text-clinic" />
              <div>
                <h2 className="font-display text-xl tracking-tight">
                  Past consultations
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {consultations.length} visit
                  {consultations.length === 1 ? '' : 's'}
                </p>
              </div>
            </header>

            {consultations.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-border/60">
                {consultations
                  .slice()
                  .reverse()
                  .map((c, i) => (
                    <li key={i} className="px-6 py-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Stethoscope className="h-3 w-3 text-clinic" />
                        <span className="font-mono tabular-nums">
                          {c.date
                            ? format(new Date(c.date), "MMM d, yyyy · h:mm a")
                            : '—'}
                        </span>
                        {c.doctorId?.name && (
                          <>
                            <span className="opacity-50">·</span>
                            <span className="font-medium text-foreground">
                              Dr {c.doctorId.name}
                            </span>
                          </>
                        )}
                        {c.doctorId?.specialty && (
                          <Badge
                            variant="outline"
                            className="rounded-full text-[9px] uppercase tracking-[0.14em]"
                          >
                            {c.doctorId.specialty}
                          </Badge>
                        )}
                      </div>

                      {c.notes && (
                        <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                          {c.notes}
                        </div>
                      )}

                      {c.prescription && (
                        <PrescriptionCard
                          prescription={c.prescription}
                          printContext={{
                            doctorName: c.doctorId?.name,
                            doctorSpecialty: c.doctorId?.specialty,
                            patientName: user?.name,
                            date: c.date
                              ? format(
                                  new Date(c.date),
                                  "EEE, MMM d, yyyy · h:mm a"
                                )
                              : '',
                            notes: c.notes,
                          }}
                        />
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

const TONE = {
  clinic: 'bg-clinic/10 text-clinic border-clinic/25',
  destructive: 'bg-destructive/10 text-destructive border-destructive/25',
  sage: 'bg-sage/15 text-sage-foreground border-sage/30',
}

const ChipsCard = ({ icon: Icon, label, items, tone = 'clinic' }) => (
  <div className="rounded-2xl border border-border/70 bg-card p-4">
    <div className="flex items-center gap-2 text-clinic">
      <Icon className="h-3.5 w-3.5" />
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold">
        {label}
      </p>
    </div>
    {items.length === 0 ? (
      <p className="mt-3 text-xs text-muted-foreground">None on file.</p>
    ) : (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((x, i) => (
          <span
            key={`${x}-${i}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${TONE[tone] || TONE.clinic}`}
          >
            {x}
          </span>
        ))}
      </div>
    )}
  </div>
)

const Loading = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
    ))}
  </div>
)

const Empty = () => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-clinic/10 text-clinic">
      <FileText className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      No consultations yet
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      Once you complete a video consult, the doctor's notes and prescription
      will appear here.
    </p>
  </div>
)

export default RecordsPage
