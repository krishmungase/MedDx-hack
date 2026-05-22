import {
  CheckCircle2,
  HeartPulse,
  Languages,
  Lock,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import { Mark } from '@/components/shared/logo'
import { VitalLine } from '@/components'

/**
 * AuthAside — compact healthcare-themed visual panel.
 * Sits next to the auth form. Designed to fit viewport without scroll —
 * keep content tight.
 */
const AuthAside = ({
  eyebrow = 'MedDx',
  title,
  italicWord,
  body,
  quote,
  quoteAuthor,
}) => {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-hero-mesh text-white p-10 xl:p-12">
      {/* Decorations */}
      <div className="absolute inset-0 bg-dot-grid opacity-40" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-24 opacity-40" aria-hidden>
        <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
      </div>
      <div
        className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl"
        aria-hidden
      />

      {/* Brand + live pill */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md">
            <Mark className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            {eyebrow}
            <span className="text-emerald-300">.</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/20 px-3 py-1">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-300" />
          </span>
          <span className="text-[11px] font-semibold text-white">
            15 doctors online
          </span>
        </div>
      </div>

      {/* Center — headline */}
      <div className="relative z-10 max-w-md fade-up">
        <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 font-bold">
          Care, delivered with care
        </p>
        <h2 className="mt-3 font-display text-4xl xl:text-5xl leading-[1.05] tracking-tight">
          {title}{' '}
          {italicWord && (
            <span className="italic text-emerald-200">{italicWord}</span>
          )}
        </h2>
        <p className="mt-4 text-sm text-white/80 leading-relaxed">{body}</p>

        {/* Compact trust strip */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Pill icon={ShieldCheck}>Admin-verified</Pill>
          <Pill icon={Lock}>End-to-end encrypted</Pill>
          <Pill icon={Stethoscope}>Doctor-approved</Pill>
          <Pill icon={Languages}>Hindi · Marathi · English</Pill>
        </div>
      </div>

      {/* Bottom — quote (compact) */}
      {quote ? (
        <figure className="relative z-10 max-w-md fade-up fade-up-delay-1 rounded-2xl bg-white/8 backdrop-blur-md ring-1 ring-white/15 p-4">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute right-3 top-3 h-6 w-6 text-white/10"
            aria-hidden
          >
            <path d="M7 7h4v4H7v4l-3 3v-7c0-2.21 1.79-4 4-4zm10 0h4v4h-4v4l-3 3v-7c0-2.21 1.79-4 4-4z" />
          </svg>
          <blockquote className="font-display text-sm xl:text-base leading-snug text-white">
            "{quote}"
          </blockquote>
          {quoteAuthor && (
            <figcaption className="mt-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300 font-bold">
              {quoteAuthor}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="relative z-10 flex items-center gap-2 text-[11px] text-white/65 font-medium">
          <HeartPulse className="h-3.5 w-3.5 text-emerald-300" />
          Specialist care, wherever you are.
        </div>
      )}
    </aside>
  )
}

const Pill = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 rounded-xl bg-white/8 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1.5">
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200 shrink-0">
      <Icon className="h-3 w-3" />
    </span>
    <span className="text-[11px] font-semibold text-white truncate">
      {children}
    </span>
  </div>
)

export default AuthAside
