import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
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
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(6, 'Please re-enter your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

const SetPasswordForm = ({ token }) => {
  const { isLoading, setPassword } = useSetPassword()
  const [show, setShow] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const onSubmit = ({ password }) => setPassword({ data: { token, password } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                Choose a password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="h-12 rounded-xl bg-card border-border pr-11"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {show ? (
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

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                Confirm password
              </FormLabel>
              <FormControl>
                <Input
                  type={show ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  className="h-12 rounded-xl bg-card border-border"
                  {...field}
                />
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
              Set password and sign in
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
