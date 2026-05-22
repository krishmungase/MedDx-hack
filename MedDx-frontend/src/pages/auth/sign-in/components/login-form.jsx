import * as z from 'zod'
import { Link } from 'react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
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

import { useLogin } from '@/apis'
import { Mark } from '@/components/shared/logo'

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

const LoginForm = () => {
  const { isLoading, login } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data) => login({ data })

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
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <HeartPulse className="h-3 w-3" />
            Welcome back
          </span>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tight leading-[1.05]">
            Sign in to{' '}
            <span className="italic text-primary">your care.</span>
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                  Sign in
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              New here?{' '}
              <Link
                to="/auth/sign-up"
                className="font-bold text-primary underline-offset-4 hover:underline"
              >
                Create a free account
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </section>
  )
}

export default LoginForm
