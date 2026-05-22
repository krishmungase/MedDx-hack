import { Link, useSearchParams } from 'react-router'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Loader2,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { useVerifySetupToken } from '@/apis'
import { AuthAside } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Mark } from '@/components/shared/logo'

import SetPasswordForm from './components/set-password-form'

const SetPasswordPage = () => {
  usePageTitle({ title: 'Set your password' })
  const [params] = useSearchParams()
  const token = params.get('token')

  return (
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      <AuthAside
        title="One step from"
        italicWord="seeing patients."
        body="Pick a password and you're in. Your admin has already verified your license — we just need a sign-in credential."
        quote="I see patients I'd otherwise never reach. Every record I open is logged — that gives me confidence."
        quoteAuthor="Doctor · MedDx specialist"
      />
      <section className="relative flex items-center justify-center p-6 md:p-10 bg-aurora">
        <div
          className="pointer-events-none absolute top-10 right-10 hidden md:block opacity-[0.04]"
          aria-hidden
        >
          <Stethoscope className="h-72 w-72" strokeWidth={1} />
        </div>
        <div className="relative w-full max-w-md fade-up">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Mark className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              MedDx<span className="text-primary">.</span>
            </span>
          </div>

          <PanelContent token={token} />
        </div>
      </section>
    </div>
  )
}

const PanelContent = ({ token }) => {
  if (!token) {
    return <InvalidToken reason="No setup token provided in the link." />
  }

  const { invitee, isLoading, error } = useVerifySetupToken({ token })

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
        </span>
        <p className="mt-4 font-display text-lg tracking-tight">
          Verifying your invitation…
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes a second.
        </p>
      </div>
    )
  }

  if (error || !invitee) {
    const msg =
      error?.response?.data?.message ||
      'This link is invalid or has already been used.'
    return <InvalidToken reason={msg} />
  }

  const firstName = invitee.name?.split(' ')[0]

  return (
    <>
      {/* Doctor invitation banner */}
      <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <BadgeCheck className="h-3 w-3" />
        </span>
        <span className="text-xs font-bold text-primary">
          Doctor invitation · License verified
        </span>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
          Welcome, Dr {firstName}.{' '}
          <span className="italic text-primary">Let's set you up.</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Choose a password to activate your{' '}
          <span className="font-semibold text-foreground">
            {invitee.specialty || 'specialist'}
          </span>{' '}
          account on MedDx.
        </p>
      </div>

      {/* Invitee summary card */}
      <div className="mb-6 rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
        <SummaryRow icon={Mail} label="Sign-in email" value={invitee.email} mono />
        {invitee.specialty && (
          <SummaryRow icon={Stethoscope} label="Specialty" value={invitee.specialty} />
        )}
        <SummaryRow
          icon={CalendarClock}
          label="Link expires in"
          value="24 hours"
        />
      </div>

      <SetPasswordForm token={token} />
    </>
  )
}

const SummaryRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-center gap-3">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
        {label}
      </p>
      <p className={`text-sm leading-tight truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  </div>
)

const InvalidToken = ({ reason }) => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-white shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-xl tracking-tight">
            We can't use this link.
          </p>
          <p className="mt-1 text-sm text-destructive/90 leading-relaxed">
            {reason}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
        <ShieldCheck className="h-3 w-3" />
        What to do
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Setup links are valid for{' '}
        <span className="font-semibold text-foreground">24 hours</span> and can
        only be used once. Ask the admin who invited you to send a fresh
        invitation.
      </p>
    </div>

    <Button asChild variant="outline" className="w-full rounded-full h-11">
      <Link to="/auth/sign-in">
        Back to sign in
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  </div>
)

export default SetPasswordPage
