import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  FileHeart,
  FileText,
  History,
  Pill,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { usePatientMedicalRecord } from '@/apis'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import PrescriptionCard from '@/components/shared/prescription-card'
import { DoctorAvatar, StatusBadge } from '@/components'

const RecordsPage = () => {
  usePageTitle({ title: pageTitle.PATIENT_DASHBOARD })
  const { t } = useTranslation()
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
    <div className="space-y-8">
      {/* ── Greeting strip ─────────────────────────────────────────────────── */}
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
            {t('nav.records', { defaultValue: 'Medical records' })}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-tight mt-1">
            {t('records.title')}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => refetch?.()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* ── Hero: privacy + summary ──────────────────────────────────── */}
          <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-soft-mesh ring-1 ring-border/60 p-6 sm:p-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/8 blur-3xl" aria-hidden />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-sage/10 blur-3xl" aria-hidden />

            <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Only your doctors see this
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl tracking-tight leading-tight">
                  Your complete health timeline,{' '}
                  <span className="italic text-primary">always with you.</span>
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                  {t('records.subtitle')}
                </p>
              </div>

              {/* Summary numbers stack */}
              <div className="grid grid-cols-3 gap-2">
                <SummaryStat
                  count={conditions.length}
                  label="Conditions"
                  tone="primary"
                />
                <SummaryStat
                  count={allergies.length}
                  label="Allergies"
                  tone="destructive"
                />
                <SummaryStat
                  count={medications.length}
                  label="Meds"
                  tone="sage"
                />
              </div>
            </div>
          </section>

          {/* ── Vital panels ─────────────────────────────────────────────── */}
          <section className="fade-up fade-up-delay-2 grid md:grid-cols-3 gap-4">
            <VitalPanel
              icon={FileHeart}
              label={t('records.conditions')}
              items={conditions}
              tone="primary"
            />
            <VitalPanel
              icon={AlertTriangle}
              label={t('records.allergies')}
              items={allergies}
              tone="destructive"
            />
            <VitalPanel
              icon={Pill}
              label={t('records.medications')}
              items={medications}
              tone="sage"
            />
          </section>

          {/* ── Visit timeline ───────────────────────────────────────────── */}
          <section className="fade-up fade-up-delay-3 space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-lg tracking-tight leading-none">
                  {t('records.past_consultations')}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {consultations.length}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Doctor visits, notes, and prescriptions over time
                </p>
              </div>
            </div>

            {consultations.length === 0 ? (
              <EmptyVisits />
            ) : (
              <ol className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-linear-to-b before:from-primary/40 before:via-border before:to-transparent">
                {consultations
                  .slice()
                  .reverse()
                  .map((c, i) => (
                    <ConsultEntry
                      key={i}
                      consult={c}
                      patientName={user?.name}
                      isFirst={i === 0}
                    />
                  ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const SUMMARY_TONE = {
  primary: 'from-primary/15 to-primary/5 text-primary border-primary/20',
  destructive: 'from-destructive/15 to-destructive/5 text-destructive border-destructive/20',
  sage: 'from-sage/20 to-sage/5 text-sage-foreground border-sage/30',
}

const SummaryStat = ({ count, label, tone = 'primary' }) => (
  <div
    className={`rounded-2xl border bg-linear-to-br p-3 text-center ${SUMMARY_TONE[tone]}`}
  >
    <p className="font-display text-3xl tracking-tight tabular-nums leading-none">
      {count}
    </p>
    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] font-semibold opacity-80">
      {label}
    </p>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────

const VITAL_TONE = {
  primary: {
    card: 'border-primary/15',
    icon: 'bg-primary/10 text-primary',
    chip: 'bg-primary/10 text-primary border-primary/20',
    bar: 'bg-linear-to-r from-primary to-primary/40',
  },
  destructive: {
    card: 'border-destructive/15',
    icon: 'bg-destructive/10 text-destructive',
    chip: 'bg-destructive/10 text-destructive border-destructive/20',
    bar: 'bg-linear-to-r from-destructive to-destructive/40',
  },
  sage: {
    card: 'border-sage/25',
    icon: 'bg-sage/15 text-sage-foreground',
    chip: 'bg-sage/15 text-sage-foreground border-sage/25',
    bar: 'bg-linear-to-r from-sage to-sage/40',
  },
}

const VitalPanel = ({ icon: Icon, label, items, tone }) => {
  const { t } = useTranslation()
  const T = VITAL_TONE[tone] || VITAL_TONE.primary

  return (
    <article className={`relative overflow-hidden rounded-2xl border bg-card p-5 ${T.card}`}>
      <span className={`absolute left-0 top-0 right-0 h-1 ${T.bar}`} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-3xl tracking-tight tabular-nums">
            {items.length}
          </p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${T.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('records.none_on_file')}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((x, i) => (
              <span
                key={`${x}-${i}`}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${T.chip}`}
              >
                {x}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const ConsultEntry = ({ consult, patientName, isFirst }) => {
  const dt = consult.date ? new Date(consult.date) : null
  return (
    <li className="relative">
      <span
        className="absolute -left-8 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background"
        aria-hidden
      >
        <Stethoscope className="h-3 w-3" />
        {isFirst && (
          <span
            className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-pulse"
            aria-hidden
          />
        )}
      </span>

      <article className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-colors hover:border-primary/30">
        {/* Header band */}
        <header className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <DoctorAvatar name={consult.doctorId?.name} size="sm" showRing={false} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              Dr {consult.doctorId?.name || '—'}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {dt ? format(dt, "EEE, MMM d, yyyy · h:mm a") : '—'}
            </p>
          </div>
          {consult.doctorId?.specialty && (
            <StatusBadge tone="muted">{consult.doctorId.specialty}</StatusBadge>
          )}
        </header>

        <div className="p-5 space-y-3">
          {consult.notes && (
            <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5">
                Doctor's notes
              </p>
              {consult.notes}
            </div>
          )}

          {consult.prescription && (
            <PrescriptionCard
              prescription={consult.prescription}
              printContext={{
                doctorName: consult.doctorId?.name,
                doctorSpecialty: consult.doctorId?.specialty,
                patientName,
                date: dt
                  ? format(dt, "EEE, MMM d, yyyy · h:mm a")
                  : '',
                notes: consult.notes,
              }}
            />
          )}
        </div>
      </article>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="space-y-6">
    <div className="h-40 rounded-3xl bg-muted/60 animate-pulse" />
    <div className="grid md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
      ))}
    </div>
    <div className="h-48 rounded-2xl bg-muted/60 animate-pulse" />
  </div>
)

const EmptyVisits = () => {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-6 w-6" />
      </span>
      <h4 className="mt-4 font-display text-lg tracking-tight">
        {t('records.empty_title')}
      </h4>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {t('records.empty_body')}
      </p>
    </div>
  )
}

export default RecordsPage
