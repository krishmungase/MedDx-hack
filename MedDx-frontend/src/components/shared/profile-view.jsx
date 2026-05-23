import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'

import { useChangePassword, useUpdateProfile } from '@/apis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DoctorAvatar, StatusBadge, VitalLine } from '@/components'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
]

const STATUS_TONE = {
  active: 'sage',
  pending_setup: 'amber',
  suspended: 'destructive',
}

/**
 * ProfileView — composable profile layout used by patient/doctor/admin.
 *
 * `roleAccent.eyebrow` should be passed pre-translated by the parent
 * (e.g. t('profile.patient_eyebrow')). Everything else in this view reads
 * directly from the active i18n bundle.
 */
const ProfileView = ({
  profile,
  isLoading,
  isFetching,
  refetch,
  roleAccent = { eyebrow: 'Account', tone: 'primary' },
  showSpecialty = false,
  extraSection = null,
}) => {
  if (isLoading || !profile) return <ProfileSkeleton />

  return (
    <div className="space-y-6">
      <ProfileHero
        profile={profile}
        roleAccent={roleAccent}
        isFetching={isFetching}
        onRefresh={refetch}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <AboutCard profile={profile} showSpecialty={showSpecialty} />
        <MetaCard profile={profile} />
      </div>

      {extraSection}

      <SecurityCard />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Hero — gradient panel with avatar + name + role badges
// ─────────────────────────────────────────────────────────────────────────

const ProfileHero = ({ profile, roleAccent, isFetching, onRefresh }) => {
  const { t } = useTranslation()
  const memberSince = profile.createdAt
    ? format(new Date(profile.createdAt), 'MMM yyyy')
    : null

  return (
    <section className="fade-up relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
      <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-16 opacity-40" aria-hidden>
        <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
      </div>

      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
            <Sparkles className="h-3 w-3" />
            {roleAccent.eyebrow}
          </div>

          <div className="flex items-end gap-5">
            <div className="relative">
              <DoctorAvatar
                name={profile.name}
                size="xl"
                showRing={false}
                className="bg-white/15 backdrop-blur-md rounded-full"
              />
              <span
                className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-white ring-4 ring-card"
                aria-label="Active account"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                {profile.name}
              </h2>
              <p className="mt-2 text-sm text-white/75 truncate">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Pill icon={UserRound}>
              {t(`role.${profile.role}`, { defaultValue: profile.role })}
            </Pill>
            {profile.specialty && (
              <Pill icon={ShieldCheck}>{profile.specialty}</Pill>
            )}
            {memberSince && (
              <Pill icon={Calendar}>
                {t('profile.joined_short', { date: memberSince })}
              </Pill>
            )}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
              {t('profile.account_status')}
            </p>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-white/25 transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`}
              />
              {t('profile.refresh')}
            </button>
          </div>
          <div className="rounded-xl bg-white/10 p-3 space-y-2">
            <Row
              label={t('profile.status')}
              value={
                <StatusBadge tone={STATUS_TONE[profile.accountStatus] || 'muted'}>
                  {t(`account_status.${profile.accountStatus}`, {
                    defaultValue: profile.accountStatus,
                  })}
                </StatusBadge>
              }
            />
            <Row
              label={t('profile.language')}
              value={languageLabel(profile.language)}
            />
            {profile.licenseNumber && (
              <Row
                label={t('profile.license')}
                value={profile.licenseNumber}
                mono
              />
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

const Pill = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/95">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

const Row = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between gap-3">
    <p className="text-[10px] uppercase tracking-[0.14em] text-white/55 font-bold">
      {label}
    </p>
    <p className={`text-sm font-medium text-white ${mono ? 'font-mono text-xs' : ''}`}>
      {value}
    </p>
  </div>
)

const languageLabel = (code) => {
  const found = LANGUAGES.find((l) => l.value === code)
  return found ? found.label.split(' ')[0] : code || '—'
}

// ─────────────────────────────────────────────────────────────────────────
// About / Editable card
// ─────────────────────────────────────────────────────────────────────────

const aboutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.string().min(2),
  specialty: z.string().optional(),
})

const AboutCard = ({ profile, showSpecialty }) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const { isLoading, updateProfile } = useUpdateProfile()

  const form = useForm({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      name: profile.name || '',
      language: profile.language || 'en',
      specialty: profile.specialty || '',
    },
  })

  // Reset when profile changes from server (e.g. via refetch)
  useEffect(() => {
    if (!editing) {
      form.reset({
        name: profile.name || '',
        language: profile.language || 'en',
        specialty: profile.specialty || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, editing])

  const onSubmit = (values) => {
    const data = { name: values.name, language: values.language }
    if (showSpecialty && values.specialty) data.specialty = values.specialty
    updateProfile(
      { data },
      {
        onSuccess: () => setEditing(false),
      }
    )
  }

  const cancel = () => {
    form.reset({
      name: profile.name || '',
      language: profile.language || 'en',
      specialty: profile.specialty || '',
    })
    setEditing(false)
  }

  return (
    <Card
      eyebrow={t('profile.about_eyebrow')}
      title={t('profile.about_title')}
      icon={UserRound}
      action={
        editing ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setEditing(true)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {t('profile.edit')}
          </Button>
        )
      }
    >
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                    {t('profile.full_name')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        autoComplete="name"
                        placeholder={t('profile.full_name_placeholder')}
                        className="h-11 pl-11 rounded-xl bg-background"
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
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                    {t('profile.preferred_language')}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background data-[size=default]:h-11">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showSpecialty && (
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                      {t('profile.specialty')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('profile.specialty_placeholder')}
                        className="h-11 rounded-xl bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={cancel}
                disabled={isLoading}
              >
                <X className="h-3.5 w-3.5" />
                {t('profile.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <Save className="h-3.5 w-3.5" />}
                {t('profile.save_changes')}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <DetailRow
            icon={UserRound}
            label={t('profile.full_name')}
            value={profile.name}
          />
          <DetailRow
            icon={Mail}
            label={t('profile.email')}
            value={profile.email}
            mono
          />
          <DetailRow
            icon={Globe}
            label={t('profile.language')}
            value={languageLabel(profile.language)}
          />
          {showSpecialty && (
            <DetailRow
              icon={ShieldCheck}
              label={t('profile.specialty')}
              value={profile.specialty || '—'}
            />
          )}
        </dl>
      )}
    </Card>
  )
}

const DetailRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="space-y-1">
    <dt className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
      <Icon className="h-3 w-3" />
      {label}
    </dt>
    <dd className={`text-sm font-medium ${mono ? 'font-mono' : ''} break-words`}>
      {value || '—'}
    </dd>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// Meta / read-only metadata card (account dates + role)
// ─────────────────────────────────────────────────────────────────────────

const MetaCard = ({ profile }) => {
  const { t } = useTranslation()
  const created = profile.createdAt
    ? format(new Date(profile.createdAt), 'MMM d, yyyy')
    : '—'
  const updated = profile.updatedAt
    ? format(new Date(profile.updatedAt), "MMM d, yyyy · h:mm a")
    : '—'

  return (
    <Card
      eyebrow={t('profile.meta_eyebrow')}
      title={t('profile.meta_title')}
      icon={Calendar}
    >
      <ul className="space-y-3">
        <MetaItem label={t('profile.account_id')} value={profile._id} mono />
        <MetaItem
          label={t('profile.role')}
          value={t(`role.${profile.role}`, { defaultValue: profile.role })}
        />
        <MetaItem
          label={t('profile.status')}
          value={
            <StatusBadge tone={STATUS_TONE[profile.accountStatus] || 'muted'}>
              {t(`account_status.${profile.accountStatus}`, {
                defaultValue: profile.accountStatus,
              })}
            </StatusBadge>
          }
        />
        <MetaItem label={t('profile.member_since')} value={created} />
        <MetaItem label={t('profile.last_updated')} value={updated} />
      </ul>
    </Card>
  )
}

const MetaItem = ({ label, value, mono = false }) => (
  <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2">
    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
      {label}
    </p>
    <p
      className={`text-xs font-medium text-right ${
        mono ? 'font-mono break-all max-w-[180px]' : ''
      }`}
    >
      {value}
    </p>
  </li>
)

// ─────────────────────────────────────────────────────────────────────────
// Security card — change password
// ─────────────────────────────────────────────────────────────────────────

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirm: z.string().min(6, 'Re-enter your new password'),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

const SecurityCard = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const form = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  const { isLoading, changePassword } = useChangePassword({
    onSuccess: () => {
      form.reset()
      setOpen(false)
    },
  })

  const onSubmit = (values) =>
    changePassword({
      data: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
    })

  return (
    <Card
      eyebrow={t('profile.security_eyebrow')}
      title={t('profile.security_title')}
      icon={ShieldCheck}
      action={
        !open ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <KeyRound className="h-3.5 w-3.5" />
            {t('profile.change_password')}
          </Button>
        ) : null
      }
    >
      {!open ? (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sage/15 text-sage-foreground shrink-0">
            <Lock className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {t('profile.password_set_title')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {t('profile.password_set_hint')}
            </p>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                    {t('profile.current_password')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      show={showCurrent}
                      onToggle={() => setShowCurrent((p) => !p)}
                      placeholder={t('profile.current_password_placeholder')}
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                    {t('profile.new_password')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      show={showNew}
                      onToggle={() => setShowNew((p) => !p)}
                      placeholder={t('profile.new_password_placeholder')}
                      autoComplete="new-password"
                      {...field}
                    />
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
                  <FormLabel className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-bold">
                    {t('profile.confirm_password')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      show={showNew}
                      onToggle={() => setShowNew((p) => !p)}
                      placeholder={t('profile.confirm_password_placeholder')}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
                disabled={isLoading}
              >
                <X className="h-3.5 w-3.5" />
                {t('profile.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <KeyRound className="h-3.5 w-3.5" />}
                {t('profile.update_password')}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Card>
  )
}

const PasswordInput = ({ show, onToggle, ...props }) => (
  <div className="relative">
    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type={show ? 'text' : 'password'}
      className="h-11 pl-11 pr-11 rounded-xl bg-background"
      {...props}
    />
    <button
      type="button"
      aria-label={show ? 'Hide password' : 'Show password'}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// Generic card wrapper
// ─────────────────────────────────────────────────────────────────────────

const Card = ({ eyebrow, title, icon: Icon, action, children }) => (
  <section className="fade-up fade-up-delay-1 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
            {eyebrow}
          </p>
          <h3 className="font-display text-lg tracking-tight leading-none">
            {title}
          </h3>
        </div>
      </div>
      {action}
    </header>
    <div className="p-6">{children}</div>
  </section>
)

// ─────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="h-56 rounded-3xl bg-muted/60 animate-pulse" />
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="h-72 rounded-3xl bg-muted/60 animate-pulse" />
      <div className="h-72 rounded-3xl bg-muted/60 animate-pulse" />
    </div>
    <div className="h-32 rounded-3xl bg-muted/60 animate-pulse" />
  </div>
)

export default ProfileView
