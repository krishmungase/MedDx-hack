import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  AlertOctagon,
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  Mic,
  Stethoscope,
} from 'lucide-react'

import { useAshaPatient } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PrescriptionCard from '@/components/shared/prescription-card'

const URGENCY_TONE = {
  low: 'bg-sage/15 text-sage-foreground border-sage/30',
  medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  high: 'bg-orange-600/15 text-orange-700 border-orange-600/30',
  emergency: 'bg-destructive/15 text-destructive border-destructive/30',
}

const PatientDetailPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { villager, record, appointments, isLoading } = useAshaPatient({ id })

  if (isLoading || !villager) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-3xl bg-muted/60 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/60 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/asha/patients')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('asha.detail.back')}
      </button>

      {/* Hero with villager profile */}
      <section className="fade-up rounded-3xl border border-border/70 bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-semibold">
              {villager.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-3xl tracking-tight">
                {villager.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {villager.age && (
                  <span>
                    {villager.age} {t('asha.detail.years')}
                  </span>
                )}
                {villager.gender && villager.gender !== 'prefer_not_to_say' && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{t(`triage.sex_${villager.gender}`)}</span>
                  </>
                )}
                {villager.village && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{villager.village}</span>
                  </>
                )}
                {villager.phone && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-mono">{villager.phone}</span>
                  </>
                )}
              </div>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] uppercase tracking-[0.12em]"
                >
                  {t('asha.detail.language', { lang: villager.language })}
                </Badge>
                {!villager.freeConsultationUsed && (
                  <Badge
                    variant="outline"
                    className="ml-2 rounded-full text-[10px] uppercase tracking-[0.12em] bg-sage/15 text-sage-foreground border-sage/30"
                  >
                    {t('asha.detail.free_available')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() =>
              navigate('/asha/consult/start', {
                state: { villager },
              })
            }
            className="rounded-full h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            <Mic className="h-4 w-4" />
            {t('asha.detail.start_consult')}
          </Button>
        </div>
      </section>

      {/* Appointments */}
      <section className="fade-up fade-up-delay-1 rounded-3xl border border-border/70 bg-card overflow-hidden">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg tracking-tight">
              {t('asha.detail.appointments')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {appointments.length} {t('asha.detail.bookings_on_file')}
            </p>
          </div>
        </header>
        {appointments.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t('asha.detail.no_appointments')}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {appointments.map((a) => (
              <li
                key={a._id}
                className="flex flex-wrap items-center gap-3 px-6 py-3"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clinic/10 text-clinic">
                  <Stethoscope className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    Dr {a.doctorId?.name || '—'}
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      · {a.doctorId?.specialty || ''}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                    {format(new Date(a.datetime), "EEE, MMM d · h:mm a")}
                  </p>
                </div>
                {a.triageUrgency && (
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] uppercase tracking-[0.12em] ${URGENCY_TONE[a.triageUrgency] || ''}`}
                  >
                    {a.triageUrgency === 'emergency' && (
                      <AlertOctagon className="h-3 w-3" />
                    )}
                    {a.triageUrgency}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] uppercase tracking-[0.12em] bg-muted text-muted-foreground"
                >
                  {a.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate(`/video/${a._id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Medical record consultations */}
      {record?.consultations?.length > 0 && (
        <section className="fade-up fade-up-delay-2 space-y-3">
          <h2 className="font-display text-lg tracking-tight">
            {t('asha.detail.past_consults')}
          </h2>
          <ul className="space-y-3">
            {record.consultations
              .slice()
              .reverse()
              .map((c, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border/70 bg-card p-4 space-y-3"
                >
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
                        patientName: villager.name,
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
        </section>
      )}
    </div>
  )
}

export default PatientDetailPage
