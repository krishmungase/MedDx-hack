import * as z from 'zod'
import { Link } from 'react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
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

const SignUpForm = () => {
  const { isLoading, register } = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = (data) => register({ data })

  return (
    <section className="flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md fade-up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-clinic font-semibold">
            Patient sign up
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight leading-tight">
            Create your account.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Doctors are registered by an admin and cannot self-register.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ananya Sharma"
                      className="h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-ring/40"
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
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-ring/40"
                      {...field}
                    />
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
                  <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        className="h-12 rounded-xl bg-card border-border pr-11 focus-visible:ring-2 focus-visible:ring-ring/40"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              className="group w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  Create patient account
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/auth/sign-in"
                className="font-medium text-clinic underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-6 text-center text-[11px] text-muted-foreground leading-relaxed">
              By creating an account you agree to share consented medical
              records with your treating doctor. First consultation is free.
            </p>
          </form>
        </Form>
      </div>
    </section>
  )
}

export default SignUpForm
