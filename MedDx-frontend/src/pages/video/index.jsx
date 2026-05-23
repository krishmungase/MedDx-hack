import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { format } from 'date-fns'
import { ArrowLeft, PhoneOff, Stethoscope, User } from 'lucide-react'

import { useAppointment, useVideoSession } from '@/apis'
import { useAuth, useJitsi, usePageTitle } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PatientRecordPanel from './components/patient-record-panel'
import ConsultationNotesForm from './components/consultation-notes-form'
import TriageSummaryCard from './components/triage-summary-card'
import PrescriptionCard from '@/components/shared/prescription-card'

const buildDailyUrl = ({ url, token, displayName }) => {
  if (!url) return null
  const u = new URL(url)
  if (token) u.searchParams.set('t', token)
  if (displayName) u.searchParams.set('userName', displayName)
  return u.toString()
}

const VideoConsultPage = () => {
  usePageTitle({ title: 'Video consult · MedDx' })
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const jitsiContainerRef = useRef(null)

  const { appointment, isLoading, error, refetch } = useAppointment({ id })
  const {
    session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useVideoSession({ id, enabled: !!appointment })

  const [activeTab, setActiveTab] = useState('history')

  const isDoctor = user?.role === 'doctor'
  const isPatient = user?.role === 'patient'

  const displayName = isDoctor
    ? `Dr ${user?.name || 'Doctor'}`
    : user?.name || 'Patient'

  const isDaily = session?.provider === 'daily'

  // Daily: just a plain iframe URL (no SDK = no singleton problems).
  const dailyIframeSrc = useMemo(
    () =>
      isDaily
        ? buildDailyUrl({
            url: session?.url,
            token: session?.token,
            displayName,
          })
        : null,
    [isDaily, session?.url, session?.token, displayName]
  )

  // Jitsi fallback uses the SDK loader.
  const jitsiState = useJitsi({
    containerRef: jitsiContainerRef,
    roomName: !isDaily && session ? session.roomName : null,
    displayName,
    email: user?.email,
    enabled: !isDaily && !!session,
    onLeft: () => {
      if (isPatient) navigate('/patient', { replace: true })
    },
  })

  const goBack = () =>
    navigate(isDoctor ? '/doctor' : isPatient ? '/patient' : '/')

  if (isLoading || (appointment && sessionLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <ErrorState
        title="Couldn't open this consultation"
        message={
          error?.response?.data?.message ||
          "We couldn't load the appointment. It may have been cancelled or you don't have access."
        }
        onRetry={() => refetch?.()}
      />
    )
  }

  if (sessionError || !session) {
    return (
      <ErrorState
        title="Video session unavailable"
        message={
          sessionError?.response?.data?.message ||
          "We couldn't start the video room. Check your network and try again."
        }
        onRetry={() => refetch?.()}
      />
    )
  }

  // For doctors, "peer" is the patient or village patient (the actual
  // subject of the consult). For patients, it's the doctor. For ASHAs,
  // we still surface the doctor on their side too.
  const villager = appointment.villagePatientId || null
  const asha = appointment.bookedByAshaId || null
  const peer = isDoctor
    ? villager
      ? { name: villager.name, specialty: villager.village }
      : appointment.patientId
    : appointment.doctorId
  const slotTime = appointment.datetime
    ? format(new Date(appointment.datetime), "EEE, MMM d · h:mm a")
    : '—'

  return (
    <div className="grid h-screen w-screen grid-cols-1 lg:grid-cols-[1fr_22rem] bg-background">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card/60 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="hidden sm:flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              {isDoctor ? (
                <>
                  <User className="h-3.5 w-3.5" />
                  {peer?.name || 'Patient'}
                  {asha && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] font-semibold">
                      ASHA · {asha.name}
                      {asha.village ? `, ${asha.village}` : ''}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Stethoscope className="h-3.5 w-3.5" />
                  Dr {peer?.name || 'Doctor'}
                  {peer?.specialty ? ` · ${peer.specialty}` : ''}
                </>
              )}
            </span>
            <span className="opacity-40">|</span>
            <span className="font-mono tabular-nums text-xs text-muted-foreground">
              {slotTime}
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5 ${
                isDaily
                  ? 'bg-sage/15 text-sage-foreground border border-sage/30'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
              title={
                isDaily
                  ? 'Powered by Daily.co — adaptive bitrate'
                  : 'Jitsi fallback (configure Daily for low-bandwidth mode)'
              }
            >
              {isDaily ? 'daily' : 'jitsi'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10"
            onClick={() => {
              // For Daily we just navigate away — the iframe unloads and Daily
              // tears down on its own. For Jitsi we send the hangup command.
              if (!isDaily) {
                try {
                  jitsiState.hangup()
                } catch {
                  // noop
                }
              }
              goBack()
            }}
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </Button>
        </header>

        <div className="relative flex-1 bg-black">
          {isDaily ? (
            dailyIframeSrc && (
              <iframe
                key={dailyIframeSrc}
                title="MedDx video consult"
                src={dailyIframeSrc}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="h-full w-full border-0"
              />
            )
          ) : (
            <>
              {jitsiState.loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground bg-black/80">
                  <Spinner />
                  <span className="ml-2">Connecting to the room…</span>
                </div>
              )}
              {jitsiState.error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-destructive bg-background/95 p-6 text-center">
                  {jitsiState.error}
                </div>
              )}
              <div ref={jitsiContainerRef} className="h-full w-full" />
            </>
          )}
        </div>
      </div>

      <aside className="hidden lg:flex h-full min-h-0 flex-col border-l border-border/60 bg-card">
        {isDoctor ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-col"
          >
            <TabsList className="m-3 mb-0 rounded-full grid grid-cols-2 bg-muted/60">
              <TabsTrigger value="history" className="rounded-full text-xs">
                History
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-full text-xs">
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="history"
              className="flex-1 overflow-hidden flex flex-col"
            >
              {villager && (
                <div className="m-3 mt-2 rounded-2xl border border-primary/30 bg-primary/5 p-3 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary font-bold flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3" />
                    ASHA-assisted consult
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">{villager.name}</span>
                    {villager.age && (
                      <span className="text-muted-foreground">
                        {' '}
                        · {villager.age}
                      </span>
                    )}
                    {villager.gender &&
                      villager.gender !== 'prefer_not_to_say' && (
                        <span className="text-muted-foreground">
                          {' '}
                          · {villager.gender}
                        </span>
                      )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {villager.village ? `${villager.village} · ` : ''}
                    Language: {villager.language || 'en'}
                  </p>
                  {asha && (
                    <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-1.5 mt-1">
                      Facilitated by{' '}
                      <span className="font-medium text-foreground">
                        {asha.name}
                      </span>
                      {asha.village ? `, ${asha.village}` : ''}
                      {asha.ashaIdNumber ? ` · ${asha.ashaIdNumber}` : ''}
                    </p>
                  )}
                </div>
              )}
              <TriageSummaryCard appointment={appointment} />
              <div className="flex-1 overflow-hidden">
                {villager ? (
                  // Village-patient records aren't owned by a User — record
                  // history for them lives on the appointment's medical
                  // record entries which the doctor sees via the existing
                  // consultation notes path. Show the spoken triage transcript
                  // here as the primary in-call context.
                  <div className="p-4 text-xs text-muted-foreground leading-relaxed">
                    {appointment.triageSummary ? (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold mb-1.5">
                          Spoken triage transcript
                        </p>
                        <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm">
                          {appointment.triageSummary}
                        </div>
                      </>
                    ) : (
                      <p>
                        No triage transcript on file. The ASHA may have booked
                        directly without running symptom check.
                      </p>
                    )}
                  </div>
                ) : (
                  <PatientRecordPanel
                    patientId={peer?._id}
                    patientName={peer?.name}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="notes" className="flex-1 overflow-hidden">
              <ConsultationNotesForm
                appointment={appointment}
                onSubmitted={() => {
                  refetch?.()
                  setActiveTab('notes')
                }}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <PatientSidePanel appointment={appointment} peer={peer} />
        )}
      </aside>
    </div>
  )
}

const ErrorState = ({ title, message, onRetry }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
    <div className="text-center max-w-sm">
      <h1 className="font-display text-2xl tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5 rounded-full" onClick={onRetry}>
        Try again
      </Button>
    </div>
  </div>
)

const PatientSidePanel = ({ appointment, peer }) => (
  <div className="overflow-y-auto h-full">
    <header className="px-4 py-3 border-b border-border/60 sticky top-0 bg-card z-10">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
        Your consultation
      </p>
      <p className="font-display text-base tracking-tight mt-0.5">
        Dr {peer?.name || 'Doctor'}
      </p>
      <p className="text-xs text-muted-foreground">
        {peer?.specialty || 'General'}
      </p>
    </header>

    <div className="p-4 space-y-4">
      <Row
        label="When"
        value={format(new Date(appointment.datetime), "EEE, MMM d · h:mm a")}
      />
      <Row label="Status" value={appointment.status} />
      <Row label="Mode" value={appointment.mode || 'video'} />
      <Row label="Payment" value={appointment.paymentStatus || 'free'} />

      {appointment.status === 'completed' && (
        <div className="space-y-2 mt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Doctor's notes
          </p>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {appointment.doctorNotes || 'No notes were added.'}
          </div>
          {appointment.prescription && (
            <div className="pt-2">
              <PrescriptionCard
                prescription={appointment.prescription}
                compact
                printContext={{
                  doctorName: peer?.name,
                  doctorSpecialty: peer?.specialty,
                  patientName: appointment.patientId?.name,
                  date: appointment.datetime
                    ? format(
                        new Date(appointment.datetime),
                        "EEE, MMM d, yyyy · h:mm a"
                      )
                    : '',
                  notes: appointment.doctorNotes,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {label}
    </span>
    <span className="font-mono tabular-nums">{value}</span>
  </div>
)

export default VideoConsultPage
