import { ShieldCheck, Languages, Stethoscope } from 'lucide-react'

import { Mark } from '@/components/shared/logo'

const AuthAside = ({
  eyebrow = 'MedDx',
  title,
  italicWord,
  body,
  quote,
  quoteAuthor,
}) => {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-clinic-mesh text-clinic-foreground p-12 xl:p-16">
      <div className="relative z-10 flex items-center gap-2.5">
        <Mark className="h-9 w-9" />
        <span className="font-display text-xl font-semibold tracking-tight">
          {eyebrow}
          <span className="text-sage">.</span>
        </span>
      </div>

      <div className="relative z-10 max-w-md fade-up">
        <p className="text-xs uppercase tracking-[0.22em] text-sage font-semibold">
          Care, delivered with care
        </p>
        <h2 className="mt-4 font-display text-4xl xl:text-5xl leading-[1.05] tracking-tight">
          {title}{' '}
          {italicWord && <span className="italic">{italicWord}</span>}
        </h2>
        <p className="mt-5 text-clinic-foreground/75 leading-relaxed">{body}</p>

        <div className="mt-10 space-y-4">
          <Pill icon={<ShieldCheck className="h-4 w-4" />}>
            Every doctor admin-verified before they see a patient
          </Pill>
          <Pill icon={<Stethoscope className="h-4 w-4" />}>
            AI assists triage — a real doctor approves every prescription
          </Pill>
          <Pill icon={<Languages className="h-4 w-4" />}>
            Speak or type in Hindi · Marathi · English
          </Pill>
        </div>
      </div>

      {quote && (
        <figure className="relative z-10 max-w-md fade-up fade-up-delay-2">
          <blockquote className="font-display text-xl xl:text-2xl leading-snug text-clinic-foreground/95 italic">
            “{quote}”
          </blockquote>
          {quoteAuthor && (
            <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-sage">
              {quoteAuthor}
            </figcaption>
          )}
        </figure>
      )}

      {/* Decorative pulse-line at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px pulse-line z-10" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 opacity-10">
        <Stethoscope className="h-80 w-80" strokeWidth={1} />
      </div>
    </aside>
  )
}

const Pill = ({ icon, children }) => (
  <div className="flex items-start gap-3 text-sm text-clinic-foreground/85">
    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sage/25 text-sage">
      {icon}
    </span>
    <span className="leading-relaxed">{children}</span>
  </div>
)

export default AuthAside
