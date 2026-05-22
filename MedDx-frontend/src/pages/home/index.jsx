import { Link } from 'react-router'
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Eye,
  HeartPulse,
  Languages,
  Lock,
  MessageCircle,
  Pill,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  Video,
  Wind,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import { DoctorAvatar, Footer, VitalLine } from '@/components'

const HomePage = () => {
  usePageTitle({ title: pageTitle.HOME_PAGE })
  const { isAuth, user } = useAuth()

  const primaryCtaTo = isAuth && user?.role ? `/${user.role}` : '/auth/sign-up'
  const primaryCtaLabel = isAuth ? 'Open your dashboard' : 'Start free consultation'

  return (
    <div className="bg-aurora">
      <Hero primaryCtaTo={primaryCtaTo} primaryCtaLabel={primaryCtaLabel} />
      <TrustStrip />
      <HowItWorks />
      <Specialties />
      <ConsultationDemo />
      <Testimonials />
      <FinalCTA primaryCtaTo={primaryCtaTo} primaryCtaLabel={primaryCtaLabel} />
      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// HERO — animated waveform, floating vitals card, online doctor count
// ─────────────────────────────────────────────────────────────────────────

const Hero = ({ primaryCtaTo, primaryCtaLabel }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 pointer-events-none bg-medi-grid opacity-40" aria-hidden />
    <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
      <div className="absolute top-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl float-bob-slow" />
      <div className="absolute bottom-[-18%] left-[-10%] h-[480px] w-[480px] rounded-full bg-sage/25 blur-3xl float-bob" />
      <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-purple-300/20 blur-3xl" />
    </div>

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        {/* Left — pitch */}
        <div className="lg:col-span-7 fade-up">
          {/* Live online badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-card/80 backdrop-blur-md px-4 py-1.5 shadow-sm">
            <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-foreground">
              15 specialists online right now
            </span>
            <span className="text-xs text-muted-foreground">· avg wait 4 min</span>
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-foreground">
            See a specialist{' '}
            <span className="relative inline-block">
              <span className="relative z-10">today</span>
              <svg
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 w-full h-3 text-sage/70"
                aria-hidden
              >
                <path
                  d="M 2 6 Q 50 0, 100 6 T 198 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            ,
            <br />
            <span className="italic font-normal text-primary">not next week.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg text-muted-foreground leading-relaxed">
            MedDx connects rural India to{' '}
            <span className="text-foreground font-medium">admin-verified specialists</span>{' '}
            over secure video consults — with AI-assisted triage in your language and
            a real doctor approving every prescription.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full h-12 px-7 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30 group"
            >
              <Link to={primaryCtaTo}>
                <Stethoscope className="h-4 w-4" />
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full h-12 px-6 text-base hover:bg-foreground/5"
            >
              <a href="#how-it-works">
                <ChevronRight className="h-4 w-4" />
                See how it works
              </a>
            </Button>
          </div>

          {/* Stat strip */}
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
            <StatPair value="₹0" label="First visit" />
            <Divider />
            <StatPair value="4 min" label="Avg wait" />
            <Divider />
            <StatPair value="3" label="Languages" />
          </div>

          {/* Trust strip */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <Stat icon={ShieldCheck} text="Admin-verified doctors" />
            <Stat icon={Lock} text="End-to-end encrypted" />
            <Stat icon={Languages} text="Hindi · Marathi · English" />
          </div>
        </div>

        {/* Right — floating consultation card stack */}
        <div className="lg:col-span-5 fade-up fade-up-delay-2 relative">
          <HeroVisual />
        </div>
      </div>
    </div>

    {/* Bottom-most: an ECG strip spanning full width */}
    <div className="relative h-12 -mt-6" aria-hidden>
      <div className="absolute inset-0 opacity-40">
        <VitalLine className="text-primary" color="oklch(0.58 0.17 258)" />
      </div>
    </div>
  </section>
)

const StatPair = ({ value, label }) => (
  <div>
    <p className="font-display text-2xl md:text-3xl tabular-nums tracking-tight">
      {value}
    </p>
    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
      {label}
    </p>
  </div>
)
const Divider = () => <span className="h-12 w-px bg-border my-auto" aria-hidden />
const Stat = ({ icon: Icon, text }) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon className="h-3.5 w-3.5 text-sage" />
    {text}
  </span>
)

// ─────────────────────────────────────────────────────────────────────────
// HERO VISUAL — stacked floating cards (live consultation mock + vitals)
// ─────────────────────────────────────────────────────────────────────────

const HeroVisual = () => (
  <div className="relative">
    {/* Decorative glow halo behind cards */}
    <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-linear-to-br from-primary/30 via-sage/15 to-purple-300/20 blur-3xl" />

    {/* Main consultation card */}
    <div className="relative rounded-[2rem] bg-card border border-border/70 shadow-2xl shadow-primary/15 overflow-hidden">
      {/* Top accent: gradient ribbon */}
      <div className="h-1.5 bg-linear-to-r from-emerald-400 via-primary to-purple-500" />

      <div className="p-6 space-y-5">
        {/* Live tag + meeting timer */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-500/30">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            LIVE CONSULT
          </span>
          <p className="text-[10px] font-mono tabular-nums text-muted-foreground">
            00:08:24
          </p>
        </div>

        {/* Doctor profile */}
        <div className="flex items-start gap-3">
          <DoctorAvatar name="Ananya Sharma" size="lg" tone="primary" online />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg tracking-tight leading-tight">
              Dr Ananya Sharma
            </p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Wind className="h-3 w-3 text-primary" />
              Pulmonology · 12 yrs
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-warm">
              <Star className="h-3 w-3 fill-amber-warm" />
              <Star className="h-3 w-3 fill-amber-warm" />
              <Star className="h-3 w-3 fill-amber-warm" />
              <Star className="h-3 w-3 fill-amber-warm" />
              <Star className="h-3 w-3 fill-amber-warm" />
              <span className="ml-1 font-semibold text-foreground">4.9</span>
              <span className="text-muted-foreground">· 248 consults</span>
            </div>
          </div>
        </div>

        {/* AI triage block */}
        <div className="rounded-2xl bg-linear-to-br from-primary/8 to-sage/8 border border-primary/15 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">
              AI Triage · Pre-call summary
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            "Fever 3 days, mild chest tightness, mild cough."
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <MiniTag tone="primary">Pulmonology</MiniTag>
            <MiniTag tone="amber">Medium urgency</MiniTag>
            <MiniTag tone="muted">No emergency markers</MiniTag>
          </div>
        </div>

        {/* ECG bar — animated */}
        <div className="relative h-12 rounded-xl bg-muted/40 overflow-hidden">
          <svg
            viewBox="0 0 400 48"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full ecg-trace"
            aria-hidden
          >
            <path
              d="M0 24 L60 24 L70 24 L80 8 L90 40 L100 6 L110 42 L120 24 L180 24 L200 24 L210 14 L222 36 L230 24 L290 24 L310 24 L320 12 L332 38 L340 24 L400 24"
              fill="none"
              stroke="oklch(0.65 0.17 165)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Action button */}
        <Button className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
          <Video className="h-3.5 w-3.5" />
          Continue consultation
        </Button>
      </div>
    </div>

    {/* Floating prescription card — top right */}
    <div className="absolute -right-6 -top-6 w-44 rotate-3 rounded-2xl border border-border/60 bg-card shadow-xl shadow-primary/10 p-3 hidden md:block float-bob">
      <div className="flex items-center gap-1.5">
        <Pill className="h-3 w-3 text-sage-foreground" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
          Prescription · Approved
        </p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-tight">Azithromycin 500mg</p>
      <p className="text-[10px] text-muted-foreground">1× daily · 5 days</p>
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sage/15 px-1.5 py-0.5 text-[9px] font-bold text-sage-foreground">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Signed
      </div>
    </div>

    {/* Floating "next appointment" card — bottom left */}
    <div className="absolute -left-8 -bottom-4 w-48 -rotate-2 rounded-2xl border border-border/60 bg-card shadow-xl shadow-primary/10 p-3 hidden md:block float-bob-slow">
      <div className="flex items-center gap-1.5">
        <CalendarClock className="h-3 w-3 text-primary" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
          Next appointment
        </p>
      </div>
      <p className="mt-2 text-sm font-semibold leading-tight">Tomorrow · 10:30 AM</p>
      <p className="text-[10px] text-muted-foreground">Dr Krishna · Cardiology</p>
      <div className="mt-2 flex items-center gap-1 -space-x-2">
        <DoctorAvatar name="Krishna M" size="sm" showRing={false} />
      </div>
    </div>
  </div>
)

const TONE_MINI = {
  primary: 'bg-primary/10 text-primary',
  sage: 'bg-sage/15 text-sage-foreground',
  amber: 'bg-amber-warm/15 text-amber-warm',
  muted: 'bg-muted text-muted-foreground',
}
const MiniTag = ({ tone, children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${TONE_MINI[tone]}`}
  >
    {children}
  </span>
)

// ─────────────────────────────────────────────────────────────────────────
// TRUST STRIP — partners / credentials / numbers
// ─────────────────────────────────────────────────────────────────────────

const TrustStrip = () => (
  <section className="border-y border-border/50 bg-card/40 backdrop-blur-sm">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-center text-[11px] uppercase tracking-[0.22em] font-semibold text-muted-foreground">
        Built with safety standards trusted by India's healthcare
      </p>
      <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
        <TrustItem icon={ShieldCheck} value="DPDPA" label="Compliant" />
        <TrustItem icon={Lock} value="AES-256" label="Encrypted" />
        <TrustItem icon={CheckCircle2} value="100%" label="Doctor-approved" />
        <TrustItem icon={Eye} value="Audited" label="Every access logged" />
      </div>
    </div>
  </section>
)

const TrustItem = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 justify-center md:justify-start">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sage/15 text-sage-foreground">
      <Icon className="h-4 w-4" />
    </span>
    <div>
      <p className="font-display text-base font-bold tracking-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
        {label}
      </p>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — 3 numbered steps in a horizontal flow
// ─────────────────────────────────────────────────────────────────────────

const HowItWorks = () => (
  <section id="how-it-works" className="relative">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          <Activity className="h-3 w-3" />
          How it works
        </span>
        <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight">
          Three calm steps from{' '}
          <span className="italic text-primary">symptom to specialist.</span>
        </h2>
      </div>

      <div className="mt-16 relative">
        {/* connecting line */}
        <div
          className="absolute left-0 right-0 top-12 hidden md:block h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />

        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            n="01"
            icon={MessageCircle}
            title="Describe how you feel"
            body="Type or speak your symptoms in Hindi, Marathi, or English. Our AI suggests urgency and the right specialty — never a diagnosis."
            tone="primary"
          />
          <StepCard
            n="02"
            icon={CalendarClock}
            title="Pick a slot that fits"
            body="See real availability from admin-approved specialists. Emergencies and first visits are free; routine ones are flat ₹199."
            tone="sage"
          />
          <StepCard
            n="03"
            icon={Video}
            title="Meet over secure video"
            body="Join a private video room. Your doctor reviews your history, writes notes, and approves a clean prescription in your language."
            tone="amber"
          />
        </div>
      </div>
    </div>
  </section>
)

const TONE_STEP = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  sage: 'bg-sage/15 text-sage-foreground ring-sage/30',
  amber: 'bg-amber-warm/15 text-amber-warm ring-amber-warm/30',
}

const StepCard = ({ n, icon: Icon, title, body, tone }) => (
  <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
    <div
      className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/8 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
      aria-hidden
    />
    <div className="relative">
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-4 ${TONE_STEP[tone]}`}
          aria-hidden
        >
          <Icon className="h-6 w-6" />
        </span>
        <span className="font-mono text-xs text-muted-foreground/60 tracking-widest">
          STEP {n}
        </span>
      </div>
      <h3 className="mt-7 font-display text-2xl tracking-tight leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  </article>
)

// ─────────────────────────────────────────────────────────────────────────
// SPECIALTIES — bento layout with icons
// ─────────────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  { icon: HeartPulse, label: 'Cardiology', sub: 'Heart · BP · palpitations', tone: 'destructive' },
  { icon: Wind, label: 'Pulmonology', sub: 'Cough · breathing · chest', tone: 'primary' },
  { icon: Brain, label: 'Neurology', sub: 'Headache · vertigo · nerves', tone: 'primary' },
  { icon: UserRound, label: 'Pediatrics', sub: 'Infants · children', tone: 'sage' },
  { icon: Activity, label: 'Dermatology', sub: 'Skin · rashes · allergies', tone: 'amber' },
  { icon: Stethoscope, label: 'General', sub: 'Everyday concerns', tone: 'muted' },
]

const TONE_SPECIALTY = {
  primary: 'from-primary/15 to-transparent border-primary/20 text-primary',
  sage: 'from-sage/20 to-transparent border-sage/30 text-sage-foreground',
  amber: 'from-amber-warm/15 to-transparent border-amber-warm/30 text-amber-warm',
  destructive: 'from-destructive/10 to-transparent border-destructive/20 text-destructive',
  muted: 'from-muted to-transparent border-border text-muted-foreground',
}

const Specialties = () => (
  <section id="specialists" className="relative">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <Stethoscope className="h-3 w-3" />
            Specialties
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight">
            The right doctor,{' '}
            <span className="italic text-primary">routed by AI.</span>
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
            Triage shouldn't be a guessing game. We route you to the specialty
            that fits — and let urgent cases jump the queue automatically.
          </p>

          {/* Featured doctor mini-card */}
          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <DoctorAvatar name="Krishna Mungase" size="md" online tone="primary" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm tracking-tight">
                  Dr Krishna Mungase
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Neurology · 14 yrs · ⭐ 4.9
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                Book
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIALTIES.map((s, i) => (
            <SpecialtyCard key={s.label} {...s} delay={i} />
          ))}
        </div>
      </div>
    </div>
  </section>
)

const SpecialtyCard = ({ icon: Icon, label, sub, tone, delay }) => (
  <article
    className={`group relative overflow-hidden rounded-2xl border bg-linear-to-br p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 fade-up`}
    style={{ animationDelay: `${0.05 * delay}s` }}
  >
    <div
      className={`absolute inset-0 -z-10 bg-linear-to-br ${TONE_SPECIALTY[tone]?.split(' ').slice(0, 2).join(' ')}`}
      aria-hidden
    />
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${TONE_SPECIALTY[tone]} bg-card`}
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight leading-tight">{label}</h3>
    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sub}</p>
  </article>
)

// ─────────────────────────────────────────────────────────────────────────
// CONSULTATION DEMO — side-by-side: video frame mock + ai assistant
// ─────────────────────────────────────────────────────────────────────────

const ConsultationDemo = () => (
  <section className="relative">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sage-foreground">
            <Video className="h-3 w-3" />
            What a consult looks like
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            A real doctor,{' '}
            <span className="italic text-primary">over secure video.</span>
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
            Your doctor sees your AI-generated triage notes before the call,
            asks you questions, and writes the prescription right there — you
            get a copy in your language as soon as the call ends.
          </p>
          <ul className="mt-8 space-y-3">
            <Bullet>End-to-end encrypted video room — no recording without consent</Bullet>
            <Bullet>Doctor can review your past visits + lab reports</Bullet>
            <Bullet>Prescription printed-ready, shared instantly</Bullet>
            <Bullet>You always own your records</Bullet>
          </ul>
        </div>

        {/* Mock video frame */}
        <div className="relative">
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-hero-mesh shadow-2xl shadow-primary/30 ring-1 ring-border/40">
            <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden />

            {/* Live tag */}
            <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white ring-2 ring-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC · 08:24
            </div>

            {/* Doctor in main frame (illustrated) */}
            <div className="absolute inset-x-0 bottom-0 top-16 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="inline-flex">
                  <DoctorAvatar name="Ananya Sharma" size="xl" tone="primary" showRing={false} className="!h-32 !w-32 !text-4xl" />
                </div>
                <p className="mt-4 font-display text-2xl tracking-tight">
                  Dr Ananya Sharma
                </p>
                <p className="text-sm text-white/70">Pulmonology</p>
              </div>
            </div>

            {/* Mini patient cam */}
            <div className="absolute bottom-5 right-5 h-24 w-32 rounded-xl bg-card/95 ring-2 ring-white/30 backdrop-blur-md p-2 flex flex-col items-center justify-center">
              <DoctorAvatar name="You" size="sm" tone="sage" showRing={false} />
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-foreground font-bold">
                You
              </p>
            </div>

            {/* Control bar */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-2 ring-1 ring-white/20">
              <ControlBtn>
                <Video className="h-3.5 w-3.5" />
              </ControlBtn>
              <ControlBtn>
                <MessageCircle className="h-3.5 w-3.5" />
              </ControlBtn>
              <button
                aria-label="End"
                className="inline-flex h-8 w-10 items-center justify-center rounded-full bg-rose-500 text-white"
              >
                <Video className="h-3 w-3 rotate-135" />
              </button>
            </div>
          </div>

          {/* Floating prescription preview */}
          <div className="absolute -right-4 -bottom-6 w-52 rotate-2 rounded-2xl bg-card border border-border/60 shadow-xl shadow-primary/15 p-3 hidden md:block">
            <div className="flex items-center gap-1.5 text-primary">
              <Pill className="h-3 w-3" />
              <p className="text-[9px] uppercase tracking-[0.18em] font-bold">
                Generated · 2 sec ago
              </p>
            </div>
            <p className="mt-2 text-sm font-bold">Treatment plan ready</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              3 medications · 2 lifestyle tips · follow-up in 7 days
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const Bullet = ({ children }) => (
  <li className="flex items-start gap-3 text-sm text-foreground">
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sage/20 text-sage-foreground shrink-0">
      <CheckCircle2 className="h-3 w-3" />
    </span>
    <span className="leading-relaxed">{children}</span>
  </li>
)

const ControlBtn = ({ children }) => (
  <button
    type="button"
    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
  >
    {children}
  </button>
)

// ─────────────────────────────────────────────────────────────────────────
// TESTIMONIALS — patient + doctor quote cards
// ─────────────────────────────────────────────────────────────────────────

const Testimonials = () => (
  <section id="trust" className="relative">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-warm/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-warm">
          <Star className="h-3 w-3 fill-amber-warm" />
          Real stories
        </span>
        <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
          Care without{' '}
          <span className="italic text-primary">the bus ride.</span>
        </h2>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-5">
        <Testimonial
          quote="The doctor saw me from the village clinic. No bus, no full day lost. Just care."
          name="Priya Joshi"
          place="Vidarbha, Maharashtra"
          role="Patient"
          tone="primary"
        />
        <Testimonial
          quote="MedDx routed me to the right specialist on the first try. Notes came back the same day, in my language."
          name="Rakesh Patil"
          place="Nashik, Maharashtra"
          role="Patient"
          tone="sage"
          featured
        />
        <Testimonial
          quote="I see patients I'd otherwise never reach. Every record I open is logged — that gives me confidence."
          name="Dr Anjali Desai"
          place="Pune"
          role="Psychiatry · MedDx specialist"
          tone="amber"
        />
      </div>
    </div>
  </section>
)

const TONE_QUOTE = {
  primary: 'border-primary/20 from-primary/8',
  sage: 'border-sage/30 from-sage/15',
  amber: 'border-amber-warm/30 from-amber-warm/10',
}

const Testimonial = ({ quote, name, place, role, tone, featured }) => (
  <figure
    className={`group relative overflow-hidden rounded-3xl border bg-linear-to-br to-card p-7 transition-all ${
      featured ? 'shadow-xl shadow-primary/15 md:-translate-y-2' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10'
    } ${TONE_QUOTE[tone]}`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="absolute right-4 top-4 h-10 w-10 text-foreground/[0.06]"
      aria-hidden
    >
      <path d="M7 7h4v4H7v4l-3 3v-7c0-2.21 1.79-4 4-4zm10 0h4v4h-4v4l-3 3v-7c0-2.21 1.79-4 4-4z" />
    </svg>
    <blockquote className="relative font-display text-lg leading-snug text-foreground">
      "{quote}"
    </blockquote>
    <figcaption className="mt-6 flex items-center gap-3">
      <DoctorAvatar name={name} size="sm" tone={role.startsWith('Patient') ? 'sage' : 'primary'} showRing={false} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {role} · {place}
        </p>
      </div>
    </figcaption>
  </figure>
)

// ─────────────────────────────────────────────────────────────────────────
// FINAL CTA — big gradient slab
// ─────────────────────────────────────────────────────────────────────────

const FinalCTA = ({ primaryCtaTo, primaryCtaLabel }) => (
  <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
    <div className="mx-auto max-w-7xl">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-hero-mesh text-white shadow-2xl shadow-primary/30">
        <div className="absolute inset-0 bg-dot-grid opacity-40" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-24 opacity-50" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl" aria-hidden />

        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center p-10 md:p-14 lg:p-16">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
              <Sparkles className="h-3 w-3" />
              Built on consent · Audited by design
            </span>
            <h2 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight">
              Your first visit is{' '}
              <span className="italic text-emerald-200">on us.</span>
            </h2>
            <p className="mt-5 text-white/85 leading-relaxed max-w-md">
              No card. No bus ride. Just a calm conversation with a verified
              specialist — and a prescription in your language, signed by a
              real doctor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90 font-bold shadow-lg shadow-black/20"
              >
                <Link to={primaryCtaTo}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full h-12 px-6 text-white hover:bg-white/10"
              >
                <Link to="/auth/sign-in">I already have an account</Link>
              </Button>
            </div>
          </div>

          {/* Right — list of guarantees in glass */}
          <aside className="rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 p-6 space-y-4">
            <Guarantee icon={ShieldCheck}>
              Doctor approves every prescription — never the AI
            </Guarantee>
            <Guarantee icon={Lock}>
              Records accessed only with consent
            </Guarantee>
            <Guarantee icon={Eye}>
              Every record view logged forever
            </Guarantee>
            <Guarantee icon={Languages}>
              Hindi · Marathi · English — speak or type
            </Guarantee>
          </aside>
        </div>
      </div>
    </div>
  </section>
)

const Guarantee = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-3 text-sm text-white/90">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shrink-0 ring-1 ring-white/20">
      <Icon className="h-4 w-4 text-white" />
    </span>
    <p className="leading-relaxed pt-1.5">{children}</p>
  </div>
)

export default HomePage
