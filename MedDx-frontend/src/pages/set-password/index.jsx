import { Link, useSearchParams } from 'react-router'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { usePageTitle } from '@/hooks'
import { useVerifySetupToken } from '@/apis'
import { AuthAside } from '@/components/auth'
import { Button } from '@/components/ui/button'

import SetPasswordForm from './components/set-password-form'

const SetPasswordPage = () => {
  usePageTitle({ title: 'Set your password' })
  const [params] = useSearchParams()
  const token = params.get('token')

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr] bg-grain">
      <AuthAside
        title="One step from"
        italicWord="seeing patients."
        body="Pick a password and you're in. Your admin has already verified your license."
      />
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md fade-up">
          <PanelContent token={token} />
        </div>
      </section>
    </div>
  )
}

const PanelContent = ({ token }) => {
  if (!token) return <InvalidToken reason="No setup token provided in the link." />

  const { invitee, isLoading, error } = useVerifySetupToken({ token })

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verifying your invitation…
      </div>
    )
  }

  if (error || !invitee) {
    const msg =
      error?.response?.data?.message ||
      'This link is invalid or has already been used.'
    return <InvalidToken reason={msg} />
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
          Doctor invitation
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight leading-tight">
          Welcome, {invitee.name?.split(' ')[0]}.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Choose a password to activate your{' '}
          <span className="font-medium text-foreground">
            {invitee.specialty || 'specialist'}
          </span>{' '}
          account on MedDx.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Signing in as{' '}
          <span className="font-mono text-xs">{invitee.email}</span>
        </p>
      </div>

      <SetPasswordForm token={token} />
    </>
  )
}

const InvalidToken = ({ reason }) => (
  <div className="space-y-6">
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0" />
      <div>
        <p className="font-display text-xl tracking-tight">
          We can't use this link.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
      </div>
    </div>
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>
        Setup links are valid for <span className="font-medium">24 hours</span>{' '}
        and can only be used once.
      </p>
      <p>Ask the admin who invited you to send a fresh invitation.</p>
    </div>
    <Button asChild variant="outline" className="rounded-full">
      <Link to="/auth/sign-in">Back to sign in</Link>
    </Button>
  </div>
)

export default SetPasswordPage
