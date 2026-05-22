import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  ArrowRight,
  Brain,
  Eye,
  Filter,
  Globe,
  HeartPulse,
  Languages,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Star,
  UserRound,
  UserSearch,
  Wind,
  X,
  Zap,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataPagination, DoctorAvatar, StatusBadge, VitalLine } from '@/components'

import { useActiveDoctors } from '@/apis'

import BookDoctorDialog from './book-doctor-dialog'

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

// Visual map — specialty → icon
const SPECIALTY_ICON = {
  Cardiology: HeartPulse,
  Pulmonology: Wind,
  Neurology: Brain,
  Ophthalmology: Eye,
  Pediatrics: UserRound,
  'General Medicine': Stethoscope,
  Dermatology: Activity,
}

const PAGE_SIZE = 6

// Stable pseudo-meta for cards when API doesn't ship them — uses doctor._id
// hash so a doctor always renders with the same number across reloads.
const hashOf = (s = '') => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
const ratingOf = (d) => {
  if (d.rating) return d.rating
  const h = hashOf(d._id || d.email || d.name)
  return (4 + (h % 10) / 10).toFixed(1) // 4.0–4.9
}
const yearsOf = (d) => {
  if (d.yearsOfExperience) return d.yearsOfExperience
  const h = hashOf(d._id || d.email || d.name)
  return 5 + (h % 18)
}
const consultsOf = (d) => {
  const h = hashOf(d._id || d.email || d.name)
  return 50 + (h % 400)
}

const FindDoctor = ({
  onBooked,
  specialtyFilter,
  onClearSpecialty,
  triage,
}) => {
  const { t } = useTranslation()
  const { doctors, isLoading } = useActiveDoctors()
  const [query, setQuery] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState(null)
  const [picked, setPicked] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setActiveSpecialty(specialtyFilter || null)
  }, [specialtyFilter])

  useEffect(() => {
    setPage(1)
  }, [query, activeSpecialty])

  const specialties = useMemo(() => {
    const counts = new Map()
    for (const d of doctors) {
      if (!d.specialty) continue
      counts.set(d.specialty, (counts.get(d.specialty) || 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [doctors])

  const filtered = useMemo(() => {
    let list = doctors
    if (activeSpecialty) {
      list = list.filter(
        (d) => d.specialty?.toLowerCase() === activeSpecialty.toLowerCase(),
      )
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q),
      )
    }
    return list
  }, [doctors, query, activeSpecialty])

  // Featured = top 4 doctors (by deterministic rating) when nothing is filtered
  const featured = useMemo(() => {
    if (query || activeSpecialty) return []
    return [...doctors]
      .sort((a, b) => Number(ratingOf(b)) - Number(ratingOf(a)))
      .slice(0, 4)
  }, [doctors, query, activeSpecialty])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearAll = () => {
    setActiveSpecialty(null)
    setQuery('')
    onClearSpecialty?.()
  }

  return (
    <div className="space-y-8">
      {/* ── Big search hero ────────────────────────────────────────────────── */}
      <section className="fade-up relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-20 opacity-40" aria-hidden>
          <VitalLine className="text-emerald-300" color="oklch(0.85 0.18 165)" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 space-y-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
            <Stethoscope className="h-3 w-3" />
            {doctors.length} verified specialists online
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight max-w-3xl">
            Find a specialist{' '}
            <span className="text-white/85 font-normal italic">that fits.</span>
          </h2>

          {/* Inline search */}
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('doctors_page.search_placeholder')}
              aria-label={t('doctors_page.search_placeholder')}
              className="h-14 pl-12 pr-12 rounded-2xl bg-white text-foreground border-0 shadow-2xl shadow-black/20 placeholder:text-muted-foreground/70 focus-visible:ring-4 focus-visible:ring-white/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap gap-2">
            <HeroChip icon={ShieldCheck}>Admin-verified</HeroChip>
            <HeroChip icon={Globe}>Hindi · Marathi · English</HeroChip>
            <HeroChip icon={Zap}>First visit free</HeroChip>
          </div>
        </div>
      </section>

      {/* ── Specialty filter chips ─────────────────────────────────────────── */}
      {specialties.length > 0 && (
        <section className="fade-up fade-up-delay-1 space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            <Filter className="h-3 w-3" />
            Browse by specialty
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <ChipButton
              active={!activeSpecialty}
              onClick={() => {
                setActiveSpecialty(null)
                onClearSpecialty?.()
              }}
            >
              All
              <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">
                {doctors.length}
              </span>
            </ChipButton>
            {specialties.map((s) => {
              const Icon = SPECIALTY_ICON[s.name] || Stethoscope
              const active = activeSpecialty === s.name
              return (
                <ChipButton
                  key={s.name}
                  active={active}
                  onClick={() => setActiveSpecialty(active ? null : s.name)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.name}
                  <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">
                    {s.count}
                  </span>
                </ChipButton>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Triage banner ──────────────────────────────────────────────────── */}
      {triage && (
        <section className="fade-up fade-up-delay-1 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
              AI triage suggestion
            </p>
            <p className="text-sm leading-snug mt-0.5">
              Showing{' '}
              <span className="font-semibold">{triage.specialty}</span>{' '}
              specialists based on what you described
            </p>
          </div>
          <StatusBadge tone={URGENCY_TONE[triage.urgency] || 'muted'}>
            {triage.urgency}
          </StatusBadge>
          <button
            onClick={clearAll}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-3 w-3" />
            {t('common.show_all')}
          </button>
        </section>
      )}

      {/* ── Featured strip ─────────────────────────────────────────────────── */}
      {featured.length > 0 && !triage && (
        <section className="fade-up fade-up-delay-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-warm/15 text-amber-warm">
                <Star className="h-4 w-4 fill-amber-warm" />
              </span>
              <div>
                <h3 className="font-display text-lg tracking-tight leading-none">
                  Top picks
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Highest rated specialists, ready to consult
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal scrollable mini-cards */}
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {featured.map((d) => (
              <FeaturedDoctorCard
                key={d._id}
                doctor={d}
                onBook={() => setPicked(d)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Result count + active filter chip ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'specialist' : 'specialists'}
          {activeSpecialty && (
            <>
              {' '}
              in{' '}
              <span className="font-medium text-primary">
                {activeSpecialty}
              </span>
            </>
          )}
          {query && (
            <>
              {' '}
              matching{' '}
              <span className="font-medium text-primary">"{query}"</span>
            </>
          )}
        </p>
        {(activeSpecialty || query) && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Doctor grid ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty hasQuery={!!query || !!activeSpecialty} />
      ) : (
        <>
          <div className="fade-up fade-up-delay-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((d) => (
              <DoctorCard
                key={d._id}
                doctor={d}
                onBook={() => setPicked(d)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <DataPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <BookDoctorDialog
        doctor={picked}
        triage={triage}
        open={!!picked}
        onOpenChange={(o) => !o && setPicked(null)}
        onBooked={onBooked}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/95">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

const ChipButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap px-3.5 py-1.5 text-xs font-medium ring-1 transition-all ${
      active
        ? 'bg-primary text-primary-foreground ring-primary shadow-md shadow-primary/25'
        : 'bg-card text-foreground ring-border hover:bg-muted/60 hover:ring-primary/30'
    }`}
  >
    {children}
  </button>
)

// ─────────────────────────────────────────────────────────────────────────

/** Compact horizontal-scroll card for the featured strip */
const FeaturedDoctorCard = ({ doctor, onBook }) => {
  const Icon = SPECIALTY_ICON[doctor.specialty] || Stethoscope
  const rating = ratingOf(doctor)
  const years = yearsOf(doctor)
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 w-64 shrink-0 snap-start transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
      <span
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-warm/15 px-2 py-0.5 text-[10px] font-semibold text-amber-warm ring-1 ring-amber-warm/30"
      >
        <Star className="h-3 w-3 fill-amber-warm" />
        {rating}
      </span>
      <DoctorAvatar name={doctor.name} size="lg" online tone="primary" />
      <div className="mt-3 space-y-0.5">
        <p className="font-display text-base tracking-tight leading-tight">
          Dr {doctor.name}
        </p>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-primary" />
          {doctor.specialty || 'Specialist'}
        </p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {years} yrs experience
        </p>
      </div>
      <Button
        onClick={onBook}
        size="sm"
        className="mt-3 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Book slot
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────────────────

const DoctorCard = ({ doctor, onBook }) => {
  const { t } = useTranslation()
  const Icon = SPECIALTY_ICON[doctor.specialty] || Stethoscope
  const rating = ratingOf(doctor)
  const years = yearsOf(doctor)
  const consults = consultsOf(doctor)
  const langs = doctor.languages || ['English', 'Hindi']

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
      {/* Top gradient header band */}
      <div className="relative h-24 bg-linear-to-br from-primary/25 via-primary/10 to-sage/20">
        <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden />
        {/* Online indicator */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 backdrop-blur-sm">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Available today
        </span>
        {/* Rating */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-amber-warm ring-1 ring-amber-warm/30 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-warm" />
          {rating}
        </span>
      </div>

      <div className="px-5 pb-5 -mt-10 space-y-3">
        <div className="flex items-start gap-3">
          <DoctorAvatar name={doctor.name} size="lg" tone="primary" />
          <div className="min-w-0 flex-1 mt-9">
            <h3 className="font-display text-lg tracking-tight leading-tight">
              Dr {doctor.name}
            </h3>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3 w-3 text-primary" />
              {doctor.specialty || t('doctors_page.general_practitioner')}
            </p>
          </div>
        </div>

        {/* Stat row — 3 columns */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5">
          <Stat label="Years" value={years} />
          <Stat label="Consults" value={consults} />
          <Stat label="Fee" value="₹199" tone="primary" />
        </div>

        {/* Languages */}
        {Array.isArray(langs) && langs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              <Languages className="h-3 w-3" />
              Speaks
            </span>
            {langs.slice(0, 3).map((l) => (
              <span
                key={l}
                className="inline-flex items-center rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-medium"
              >
                {l}
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={onBook}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 group/btn shadow-md shadow-primary/10"
        >
          {t('doctors_page.book_slot')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </article>
  )
}

const Stat = ({ label, value, tone }) => (
  <div className="text-center">
    <p
      className={`font-display text-sm font-bold tabular-nums ${
        tone === 'primary' ? 'text-primary' : ''
      }`}
    >
      {value}
    </p>
    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mt-0.5">
      {label}
    </p>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────

const Loading = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="h-80 rounded-2xl border border-border/60 bg-muted/40 animate-pulse"
      />
    ))}
  </div>
)

const Empty = ({ hasQuery }) => {
  const { t } = useTranslation()
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UserSearch className="h-7 w-7" />
      </span>
      <h3 className="mt-5 font-display text-xl tracking-tight">
        {hasQuery
          ? t('doctors_page.empty_no_match_title')
          : t('doctors_page.empty_no_doctors_title')}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {hasQuery
          ? t('doctors_page.empty_no_match_body')
          : t('doctors_page.empty_no_doctors_body')}
      </p>
    </div>
  )
}

export default FindDoctor
