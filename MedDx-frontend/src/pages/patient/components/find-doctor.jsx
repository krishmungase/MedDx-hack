import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Stethoscope, UserSearch, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataPagination, StatusBadge } from '@/components'

import { useActiveDoctors } from '@/apis'

import BookDoctorDialog from './book-doctor-dialog'

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'DR'

const URGENCY_TONE = {
  low: 'sage',
  medium: 'amber',
  high: 'amber',
  emergency: 'destructive',
}

const PAGE_SIZE = 8

const FindDoctor = ({
  onBooked,
  specialtyFilter,
  onClearSpecialty,
  triage,
}) => {
  const { t } = useTranslation()
  const { doctors, isLoading } = useActiveDoctors()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (specialtyFilter) setQuery(specialtyFilter)
  }, [specialtyFilter])

  // Reset to page 1 whenever the search/filter changes.
  useEffect(() => {
    setPage(1)
  }, [query, specialtyFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q)
    )
  }, [doctors, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  )

  const countLabel = query
    ? t('doctors_page.match_count_q', {
        shown: filtered.length,
        total: doctors.length,
        q: query,
      })
    : t('doctors_page.match_count', {
        shown: filtered.length,
        total: doctors.length,
      })

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
        <div className="space-y-1">
          <h2 className="font-display text-xl tracking-tight">
            {t('doctors_page.card_title')}
          </h2>
          <p className="text-xs text-muted-foreground">{countLabel}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('doctors_page.search_placeholder')}
            className="h-10 pl-9 rounded-full bg-background"
            aria-label={t('doctors_page.search_placeholder')}
          />
        </div>
      </header>

      {triage && (
        <div className="px-6 py-3 border-b border-border/60 bg-primary/5 flex flex-wrap items-center gap-2 text-xs">
          <StatusBadge tone={URGENCY_TONE[triage.urgency] || 'muted'}>
            {t('triage.result_urgency', {
              level: t(`urgency.${triage.urgency}`),
            })}
          </StatusBadge>
          <span className="text-muted-foreground">
            {t('doctors_page.triage_suggestion_prefix')}
          </span>
          <span className="font-medium text-foreground">{triage.specialty}</span>
          {specialtyFilter && onClearSpecialty && (
            <button
              type="button"
              onClick={onClearSpecialty}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="h-3 w-3" />
              {t('common.show_all')}
            </button>
          )}
        </div>
      )}

      {!triage && specialtyFilter && onClearSpecialty && (
        <div className="px-6 py-2 border-b border-border/60 bg-muted/40 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t('doctors_page.filtered_by_specialty')}</span>
          <Badge variant="outline" className="rounded-full">
            {specialtyFilter}
          </Badge>
          <button
            type="button"
            onClick={onClearSpecialty}
            className="ml-auto inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            {t('common.clear')}
          </button>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty hasQuery={!!query} />
      ) : (
        <>
          <ul className="divide-y divide-border/60">
            {pageItems.map((d) => (
              <li
                key={d._id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                  {initialsOf(d.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base tracking-tight">
                    Dr {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.specialty || t('doctors_page.general_practitioner')}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setPicked(d)}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  {t('doctors_page.book_slot')}
                </Button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="border-t border-border/60 px-6 py-4">
              <DataPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
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
    </section>
  )
}

const Loading = () => (
  <ul className="divide-y divide-border/60">
    {[0, 1, 2].map((i) => (
      <li key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="h-12 w-12 rounded-full bg-muted/60 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-full bg-muted/60 animate-pulse" />
      </li>
    ))}
  </ul>
)

const Empty = ({ hasQuery }) => {
  const { t } = useTranslation()
  return (
    <div className="py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UserSearch className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        {hasQuery
          ? t('doctors_page.empty_no_match_title')
          : t('doctors_page.empty_no_doctors_title')}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {hasQuery
          ? t('doctors_page.empty_no_match_body')
          : t('doctors_page.empty_no_doctors_body')}
      </p>
    </div>
  )
}

export default FindDoctor
