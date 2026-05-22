const DashboardShell = ({ role, eyebrow, title, italic, intro, children }) => {
  return (
    <div className="bg-grain min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 fade-up">
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

export default DashboardShell
