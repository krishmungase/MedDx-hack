import { Link } from 'react-router'
import {
  Activity,
  CalendarClock,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react'

import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'

const HomePage = () => {
  usePageTitle({ title: pageTitle.HOME_PAGE })
  const { isAuth, user } = useAuth()

  const primaryCtaTo = isAuth && user?.role ? `/${user.role}` : '/auth/sign-up'
  const primaryCtaLabel = isAuth ? 'Open your dashboard' : 'Get a consultation'

  return (
    <div className="bg-grain">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] h-[480px] w-[480px] rounded-full bg-sage/30 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] h-[420px] w-[420px] rounded-full bg-clinic/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-clinic/20 bg-clinic/5 px-3 py-1 text-xs text-clinic font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clinic opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-clinic" />
                </span>
                Specialists online now
              </div>

              <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-foreground">
                Specialist care,{' '}
                <span className="italic text-clinic">wherever</span> you are.
              </h1>

              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                MedDx connects rural patients to admin-verified specialist
                doctors over scheduled video visits — with AI-assisted triage in
                your language, and a real doctor approving every prescription.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link to={primaryCtaTo}>{primaryCtaLabel}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 text-base border-border bg-card/60"
                  asChild
                >
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-sage" />
                  Admin-verified doctors only
                </div>
                <div className="inline-flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-sage" />
                  First consultation free
                </div>
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sage" />
                  Hindi · Marathi · English
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 fade-up fade-up-delay-2">
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-y border-border/60 bg-card/40"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-clinic font-semibold">
              How it works
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">
              Three calm steps from{' '}
              <span className="italic">symptom to specialist.</span>
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <StepCard
              n="01"
              icon={<Sparkles className="h-5 w-5" />}
              title="Describe how you feel"
              body="Type or speak your symptoms in Hindi, Marathi, or English. Our AI assistant suggests urgency and the right specialty — never a diagnosis."
            />
            <StepCard
              n="02"
              icon={<CalendarClock className="h-5 w-5" />}
              title="Pick a slot that fits"
              body="See real availability from admin-approved specialists. Emergencies and first visits are free; routine ones are flat ₹199."
            />
            <StepCard
              n="03"
              icon={<Video className="h-5 w-5" />}
              title="Meet over secure video"
              body="Join a private video room. Your doctor reviews your history, writes notes, and approves a clean prescription you can read in your language."
            />
          </div>
        </div>
      </section>

      {/* ── Specialists strip ────────────────────────────────────────────── */}
      <section
        id="specialists"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.18em] text-clinic font-semibold">
              Specialists
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">
              The right doctor,
              <br />
              <span className="italic">routed by AI.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
              Triage shouldn't be a guessing game. We route you to the specialty
              that fits — and let urgent cases jump the queue automatically.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
            {SPECIALTIES.map((s) => (
              <SpecialtyChip key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust + final CTA ────────────────────────────────────────────── */}
      <section
        id="trust"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24"
      >
        <div className="relative overflow-hidden rounded-3xl bg-clinic-mesh px-8 py-14 md:p-16 text-clinic-foreground">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-sage font-semibold">
              A doctor approves every prescription
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
              Built on consent,{' '}
              <span className="italic">audited by design.</span>
            </h2>
            <p className="mt-5 text-clinic-foreground/80 leading-relaxed">
              We never let an AI diagnose or prescribe. Records are accessed
              only with consent, every view is logged, and your doctor is the
              one who signs off on care. That's the only way this works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-card text-foreground hover:bg-card/90 h-12 px-7"
                asChild
              >
                <Link to={primaryCtaTo}>{primaryCtaLabel}</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full h-12 px-7 text-clinic-foreground hover:bg-white/10"
                asChild
              >
                <Link to="/auth/sign-in">I already have an account</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block absolute -right-10 -bottom-10 opacity-20">
            <Stethoscope className="h-72 w-72" strokeWidth={1} />
          </div>
        </div>

        <footer className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} MedDx · Specialist care, wherever you
            are.
          </p>
          <p>Made for rural India.</p>
        </footer>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const HeroCard = () => (
  <div className="relative">
    <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-sage/30 via-cream to-clinic/15 blur-2xl" />
    <div className="rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/10 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Consultation
          </p>
          <p className="mt-1 font-display text-xl">Dr. Ananya Sharma</p>
          <p className="text-sm text-muted-foreground">Pulmonology · 12 yrs</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/20 px-2.5 py-1 text-[11px] font-medium text-sage-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Online
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-muted/60 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          AI Triage
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          "Fever 3 days, mild chest tightness." Suggested specialty:{' '}
          <span className="font-medium text-clinic">Pulmonology</span>. Urgency:{' '}
          <span className="font-medium text-clinic">Medium</span>.
        </p>

        <div className="mt-4 flex items-end gap-[3px] h-8">
          {[
            0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.4, 0.6, 0.95, 0.45, 0.8, 0.5, 0.7,
            0.4, 0.6,
          ].map((h, i) => (
            <span
              key={i}
              className="w-[5px] rounded-sm bg-clinic/70"
              style={{
                height: `${h * 100}%`,
                animation: 'vital-pulse 1.6s ease-in-out infinite',
                animationDelay: `${i * 0.08}s`,
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ['10:00', 'available'],
          ['10:30', 'available'],
          ['11:00', 'taken'],
        ].map(([t, s]) => (
          <div
            key={t}
            className={`rounded-xl border px-3 py-2 text-center text-sm ${
              s === 'taken'
                ? 'border-border bg-muted/60 text-muted-foreground line-through'
                : 'border-clinic/30 bg-clinic/5 text-foreground'
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-full bg-primary text-primary-foreground text-sm font-medium h-11 hover:bg-primary/90 transition-colors"
      >
        Confirm 10:00 — Free first visit
      </button>
    </div>
  </div>
)

const StepCard = ({ n, icon, title, body }) => (
  <div className="group relative rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
    <div className="flex items-start justify-between">
      <span className="font-mono text-xs text-muted-foreground/80 tracking-widest">
        {n}
      </span>
      <span className="rounded-full bg-clinic/10 p-2 text-clinic">{icon}</span>
    </div>
    <h3 className="mt-6 font-display text-xl tracking-tight">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
  </div>
)

const SpecialtyChip = ({ label, sub }) => (
  <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 hover:border-clinic/40 transition-colors">
    <div>
      <p className="font-display text-lg leading-tight">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
    <Activity className="h-4 w-4 text-clinic/60" />
  </div>
)

const SPECIALTIES = [
  { label: 'General Medicine', sub: 'Everyday concerns, fever, fatigue' },
  { label: 'Pulmonology', sub: 'Cough, breathing, chest tightness' },
  { label: 'Cardiology', sub: 'Heart, blood pressure, palpitations' },
  { label: 'Pediatrics', sub: 'Care for children and infants' },
  { label: 'Dermatology', sub: 'Skin, rashes, allergies' },
  { label: 'Gynecology', sub: 'Women’s health and care' },
]

export default HomePage
