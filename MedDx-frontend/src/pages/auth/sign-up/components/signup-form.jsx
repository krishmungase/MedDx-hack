import * as z from 'zod'
import { Link } from 'react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  UserRound,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { useRegister } from '@/apis'
import { Mark } from '@/components/shared/logo'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
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
  { label: 'Too short', bar: 'bg-destructive' },
  { label: 'Weak', bar: 'bg-destructive' },
  { label: 'Okay', bar: 'bg-amber-warm' },
  { label: 'Strong', bar: 'bg-sage' },
  { label: 'Excellent', bar: 'bg-emerald-500' },
]

const SignUpForm = () => {
  const { isLoading, register } = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const password = form.watch('password')
  const strength = scorePassword(password)

  const onSubmit = (data) => register({ data })

  return (
    <section className="relative flex items-center justify-center px-6 py-8 lg:p-10 bg-aurora overflow-hidden">
      <div className="relative w-full max-w-md fade-up">
        {/* Mobile brand */}
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mark className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            MedDx<span className="text-primary">.</span>
          </span>
        </div>

        {/* Heading */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sage-foreground">
            <Gift className="h-3 w-3" />
            First consult is free
          </span>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tight leading-[1.05]">
            Join MedDx in{' '}
            <span className="italic text-primary">30 seconds.</span>
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ananya Sharma"
                        autoComplete="name"
                        className="h-11 pl-11 rounded-xl bg-card border-border focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/40"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-11 pl-11 rounded-xl bg-card border-border focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/40"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className="h-11 pl-11 pr-11 rounded-xl bg-card border-border focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:border-primary/40"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {password && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex gap-1 flex-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength
                                ? STRENGTH[strength]?.bar
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground tabular-nums">
                        {STRENGTH[strength]?.label || ''}
                      </p>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="group w-full h-11 mt-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Already a member?{' '}
              <Link
                to="/auth/sign-in"
                className="font-bold text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </section>
  )
}

export default SignUpForm
