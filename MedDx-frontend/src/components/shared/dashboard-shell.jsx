const RoleBadge = ({ role }) => {
  const tone =
    role === 'patient'
      ? 'bg-sage/15 text-sage-foreground border-sage/30'
      : role === 'doctor'
        ? 'bg-clinic/10 text-clinic border-clinic/25'
        : 'bg-amber-warm/15 border-amber-warm/35 text-foreground'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {role}
    </span>
  )
}

const DashboardShell = ({ role, eyebrow, title, italic, intro, children }) => {
  return (
    <div className="bg-grain min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 fade-up">
          <RoleBadge role={role} />
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </span>
        </div>

        <h1 className="mt-5 font-display text-4xl md:text-5xl tracking-tight leading-tight fade-up fade-up-delay-1">
          {title} {italic && <span className="italic">{italic}</span>}
        </h1>
        {intro && (
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed fade-up fade-up-delay-2">
            {intro}
          </p>
        )}

        <div className="mt-10 fade-up fade-up-delay-3">{children}</div>
      </div>
    </div>
  )
}

export { RoleBadge }
export default DashboardShell
