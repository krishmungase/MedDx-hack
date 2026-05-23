import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { MessageSquare, RefreshCw, Star, Trophy, Users } from 'lucide-react'

import { useAdminFeedback, useFeedbackLeaderboard } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataPagination, DoctorAvatar, StarRating } from '@/components'

const AdminFeedbackPage = () => {
  usePageTitle({ title: pageTitle.ADMIN_DASHBOARD })
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [doctorFilter, setDoctorFilter] = useState('all')

  const { items, total, limit, isLoading, isFetching, refetch } =
    useAdminFeedback({
      page,
      limit: 20,
      doctorId: doctorFilter === 'all' ? null : doctorFilter,
    })

  const { items: leaderboard } = useFeedbackLeaderboard({ limit: 20 })

  const overall = useMemo(() => {
    if (!leaderboard.length) return { avg: 0, total: 0 }
    const t = leaderboard.reduce((acc, r) => acc + r.total, 0)
    const weighted = leaderboard.reduce(
      (acc, r) => acc + r.avg * r.total,
      0,
    )
    return { avg: t ? weighted / t : 0, total: t }
  }, [leaderboard])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('feedback.admin_eyebrow', { defaultValue: 'Admin · Feedback' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('feedback.admin_title', {
            defaultValue: 'Patient feedback across MedDx.',
          })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('feedback.admin_subtitle', {
            defaultValue:
              'Every rating left by a patient, plus per-doctor averages.',
          })}
        </p>
      </div>

      {/* Platform avg + leaderboard */}
      <section className="fade-up fade-up-delay-1 grid lg:grid-cols-[1fr_1.4fr] gap-4">
        <div className="rounded-3xl bg-hero-mesh text-white p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-primary/25">
          <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <Star className="h-3 w-3 fill-white" />
              {t('feedback.platform_avg', {
                defaultValue: 'Platform average',
              })}
            </div>
            <p className="font-display text-6xl sm:text-7xl tracking-tight leading-none tabular-nums">
              {overall.total > 0 ? overall.avg.toFixed(1) : '—'}
            </p>
            <StarRating
              value={Math.round(overall.avg)}
              size="md"
              className="text-white"
            />
            <p className="text-xs text-white/70">
              {t('feedback.based_on', {
                defaultValue: 'Based on {{n}} rating{{plural}}',
                n: overall.total,
                plural: overall.total === 1 ? '' : 's',
              })}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                {t('feedback.top_doctors', {
                  defaultValue: 'Top-rated doctors',
                })}
              </p>
              <h3 className="font-display text-base tracking-tight">
                {t('feedback.top_doctors_hint', {
                  defaultValue: 'Sorted by average rating',
                })}
              </h3>
            </div>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {t('feedback.empty_leaderboard', {
                defaultValue: 'No ratings yet.',
              })}
            </p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {leaderboard.map((row, i) => (
                <li
                  key={String(row.doctorId)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => {
                    setDoctorFilter(String(row.doctorId))
                    setPage(1)
                  }}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <DoctorAvatar name={row.name} size="sm" showRing={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      Dr {row.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {row.specialty || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-3.5 w-3.5 fill-amber-warm text-amber-warm" />
                      <span className="text-sm font-semibold tabular-nums">
                        {row.avg.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {row.total} review{row.total === 1 ? '' : 's'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* All reviews list with doctor filter */}
      <section className="fade-up fade-up-delay-2 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight leading-none">
                {t('feedback.all_reviews', { defaultValue: 'All reviews' })}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {total} entr{total === 1 ? 'y' : 'ies'}
                {doctorFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorFilter('all')
                      setPage(1)
                    }}
                    className="ml-2 text-primary hover:underline"
                  >
                    {t('feedback.clear_filter', {
                      defaultValue: '· clear filter',
                    })}
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={doctorFilter}
              onValueChange={(v) => {
                setDoctorFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-56">
                <Users className="h-3.5 w-3.5" />
                <SelectValue
                  placeholder={t('feedback.filter_placeholder', {
                    defaultValue: 'Filter by doctor',
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('feedback.filter_all', { defaultValue: 'All doctors' })}
                </SelectItem>
                {leaderboard.map((row) => (
                  <SelectItem key={String(row.doctorId)} value={String(row.doctorId)}>
                    Dr {row.name} · {row.avg.toFixed(1)}★
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch?.()}
              disabled={isFetching}
              className="rounded-full"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              />
              {t('common.refresh', { defaultValue: 'Refresh' })}
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="px-6 py-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg tracking-tight">
              {t('feedback.empty_title', {
                defaultValue: 'No feedback yet',
              })}
            </h3>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {items.map((f) => (
                <AdminReviewRow key={f._id} feedback={f} />
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
      </section>
    </div>
  )
}

const AdminReviewRow = ({ feedback }) => (
  <li className="px-6 py-4 space-y-2">
    <div className="flex flex-wrap items-center gap-3">
      <DoctorAvatar
        name={feedback.doctorId?.name}
        size="sm"
        showRing={false}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          Dr {feedback.doctorId?.name || '—'}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            · {feedback.doctorId?.specialty || ''}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          {feedback.patientId?.name || 'Patient'}
          {feedback.patientId?.email && (
            <span className="text-muted-foreground/70 ml-1">
              · {feedback.patientId.email}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StarRating value={feedback.rating} size="sm" />
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {format(new Date(feedback.createdAt), "MMM d, yyyy")}
        </span>
      </div>
    </div>
    {feedback.comment && (
      <p className="text-sm text-foreground leading-relaxed pl-11">
        "{feedback.comment}"
      </p>
    )}
  </li>
)

export default AdminFeedbackPage
