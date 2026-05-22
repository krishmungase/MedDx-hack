import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { format } from 'date-fns'
import { ArrowLeft, PhoneOff, Stethoscope, User } from 'lucide-react'

import { useAppointment, useVideoSession } from '@/apis'
import {
  useAuth,
  useDailyVideo,
  useJitsi,
  usePageTitle,
} from '@/hooks'
import { errorToast } from '@/lib'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PatientRecordPanel from './components/patient-record-panel'
import ConsultationNotesForm from './components/consultation-notes-form'

const VideoConsultPage = () => {
  usePageTitle({ title: 'Video consult · MedDx' })
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const stageRef = useRef(null)

  const { appointment, isLoading, error, refetch } = useAppointment({ id })
  const { session, isLoading: sessionLoading, error: sessionError } =
    useVideoSession({ id, enabled: !!appointment })

  const [activeTab, setActiveTab] = useState('history')

  const isDoctor = user?.role === 'doctor'
  const isPatient = user?.role === 'patient'

  const displayName = isDoctor
    ? `Dr ${user?.name || 'Doctor'}`
    : user?.name || 'Patient'

  const isDaily = session?.provider === 'daily'

  // Daily path — preferred.
  const dailyState = useDailyVideo({
    containerRef: stageRef,
    url: isDaily ? session?.url : null,
    token: isDaily ? session?.token : null,
    displayName,
    enabled: !!isDaily,
    onLeft: () => {
      if (isPatient) navigate('/patient', { replace: true })
    },
  })

  // Jitsi fallback (used only when Daily isn't configured server-side).
  const jitsiState = useJitsi({
    containerRef: stageRef,
    roomName: !isDaily && session ? session.roomName : null,
    displayName,
    email: user?.email,
    enabled: !isDaily && !!session,
    onLeft: () => {
      if (isPatient) navigate('/patient', { replace: true })
    },
  })

  const videoLoading = isDaily ? dailyState.loading : jitsiState.loading
  const videoError = isDaily ? dailyState.error : jitsiState.error
  const hangup = isDaily ? dailyState.hangup : jitsiState.hangup

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

  const peer = isDoctor ? appointment.patientId : appointment.doctorId
  const slotTime = appointment.datetime
    ? format(new Date(appointment.datetime), "EEE, MMM d · h:mm a")
    : '—'

  return (
    <div className="grid h-screen w-screen grid-cols-1 lg:grid-cols-[1fr_22rem] bg-background">
      {/* Left: video stage */}
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card/60 px-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() =>
              navigate(isDoctor ? '/doctor' : isPatient ? '/patient' : '/')
            }
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
              try {
                hangup()
              } catch {
                errorToast({ message: 'Could not hang up cleanly.' })
              }
            }}
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </Button>
        </header>

        <div className="relative flex-1 bg-black">
          {videoLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground bg-black/80">
              <Spinner />
              <span className="ml-2">Connecting to the room…</span>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-destructive bg-background/95 p-6 text-center">
              {videoError}
            </div>
          )}
          <div ref={stageRef} className="h-full w-full" />
        </div>
      </div>

      {/* Right: role-aware sidebar */}
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
            <TabsContent value="history" className="flex-1 overflow-hidden">
              <PatientRecordPanel
                patientId={peer?._id}
                patientName={peer?.name}
              />
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
            <pre className="rounded-xl border border-border/60 bg-muted/60 p-3 text-[11px] font-mono whitespace-pre-wrap wrap-break-word">
              {typeof appointment.prescription === 'string'
                ? appointment.prescription
                : JSON.stringify(appointment.prescription, null, 2)}
            </pre>
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
