import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useSetPassword } from '@/apis'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(6, 'Please re-enter your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

const scorePassword = (p) => {
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9]/.test(p) || /[^a-zA-Z0-9]/.test(p)) s++
  return s
}
const STRENGTH = [
  { label: 'Too short', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Weak', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Okay', bar: 'bg-amber-warm', text: 'text-amber-warm' },
  { label: 'Strong', bar: 'bg-sage', text: 'text-sage-foreground' },
  { label: 'Excellent', bar: 'bg-emerald-500', text: 'text-emerald-600' },
]

const SetPasswordForm = ({ token }) => {
  const { isLoading, setPassword } = useSetPassword()
  const [show, setShow] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const password = form.watch('password')
  const confirm = form.watch('confirm')
  const strength = scorePassword(password)
  const matches = password && confirm && password === confirm

  const onSubmit = ({ password }) =>
    setPassword({ data: { token, password } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                Choose a password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="h-12 pl-11 pr-11 rounded-2xl bg-card border-border focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/40 transition-shadow"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>

              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength
                            ? STRENGTH[strength]?.bar || 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                      STRENGTH[strength]?.text || 'text-muted-foreground'
                    }`}
                  >
                    {STRENGTH[strength]?.label || ''}
                  </p>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm */}
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                Confirm password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="h-12 pl-11 pr-11 rounded-2xl bg-card border-border focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/40 transition-shadow"
                    {...field}
                  />
                  {matches && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sage/20 text-sage-foreground"
                      aria-label="Passwords match"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tip card */}
        <div className="rounded-2xl border border-border bg-card/60 p-3 flex items-start gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Pick something only you'd know — at least 10 characters with a mix
            of letters and a number works best.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="group w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold shadow-lg shadow-primary/25"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              Activate my doctor account
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
          By setting your password you agree to provide care via MedDx and
          consent to the platform's clinical safety policy.
        </p>
      </form>
    </Form>
  )
}

export default SetPasswordForm
