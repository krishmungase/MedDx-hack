import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Copy, Mail, UserPlus } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { successToast } from '@/lib'
import { useRegisterDoctor } from '@/apis'

const schema = z.object({
  name: z.string().min(2, 'Please enter the doctor’s full name'),
  email: z.email('Please enter a valid email'),
  specialty: z.string().min(2, 'Please enter a specialty'),
  licenseNumber: z.string().min(2, 'Please enter a license number'),
})

const RegisterDoctorDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState(null) // {emailed, link?, doctor}

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      specialty: '',
      licenseNumber: '',
    },
  })

  const { isLoading, registerDoctor } = useRegisterDoctor({
    onResult: (payload) => {
      setResult(payload)
      form.reset()
    },
  })

  const onSubmit = (data) => registerDoctor({ data })

  const onOpenChange = (next) => {
    setOpen(next)
    if (!next) setTimeout(() => setResult(null), 250)
  }

  const defaultTrigger = (
    <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5">
      <UserPlus className="h-4 w-4" />
      Register doctor
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-lg p-0 bg-background gap-0 overflow-hidden">
        <DialogHeader className="px-7 pt-7 pb-3 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-clinic font-semibold">
            Onboard a specialist
          </p>
          <DialogTitle className="font-display text-2xl tracking-tight">
            Register a doctor
          </DialogTitle>
          <DialogDescription className="text-sm">
            We'll create a{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
              pending_setup
            </code>{' '}
            account and email a 24-hour password-setup link. If Gmail isn't
            configured, the link will appear here for you to share manually.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <ResultPanel result={result} onClose={() => onOpenChange(false)} />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-7 pt-4 pb-7 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                        Full name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dr. Ananya Sharma"
                          className="h-11 rounded-xl bg-card border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ananya.sharma@hospital.in"
                          className="h-11 rounded-xl bg-card border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                        Specialty
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pulmonology"
                          className="h-11 rounded-xl bg-card border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                        License number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MH-12345"
                          className="h-11 rounded-xl bg-card border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full h-11"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                >
                  {isLoading ? <Spinner /> : <UserPlus className="h-4 w-4" />}
                  Send invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

const ResultPanel = ({ result, onClose }) => {
  const { emailed, link, doctor } = result

  return (
    <div className="px-7 pb-7 pt-2 space-y-5 fade-up">
      <div className="rounded-2xl border border-sage/30 bg-sage/10 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-sage shrink-0" />
          <div>
            <p className="font-display text-lg leading-tight">
              {doctor?.name} added
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {doctor?.email} · {doctor?.specialty}
            </p>
          </div>
        </div>
      </div>

      {emailed ? (
        <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-4 text-sm">
          <Mail className="h-4 w-4 mt-0.5 text-clinic shrink-0" />
          <p className="text-muted-foreground">
            The set-password link has been emailed to{' '}
            <span className="font-medium text-foreground">{doctor?.email}</span>
            . They'll choose a password and be signed in instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            Email not configured — share this manually
          </p>
          <LinkBox link={link} />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This one-time link expires in 24 hours. Configuring{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
              GMAIL_USER
            </code>{' '}
            and{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
              GMAIL_APP_PASSWORD
            </code>{' '}
            on the backend will switch this to email delivery automatically.
          </p>
        </div>
      )}

      <Button
        onClick={onClose}
        variant="outline"
        className="w-full rounded-full h-11"
      >
        Done
      </Button>
    </div>
  )
}

const LinkBox = ({ link }) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      successToast({ message: 'Link copied' })
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-2 overflow-hidden">
      <code
        className="block flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-mono text-foreground"
        title={link}
      >
        {link}
      </code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full shrink-0"
        onClick={onCopy}
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </Button>
    </div>
  )
}

export default RegisterDoctorDialog
