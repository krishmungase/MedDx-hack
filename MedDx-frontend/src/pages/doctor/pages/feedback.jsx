import { useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { MessageSquare, RefreshCw, Sparkles, Star } from 'lucide-react'

import { useDoctorFeedback } from '@/apis'
import { usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Button } from '@/components/ui/button'
import { DataPagination, StarRating } from '@/components'

const DoctorFeedbackPage = () => {
  usePageTitle({ title: pageTitle.DOCTOR_DASHBOARD })
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { items, total, limit, stats, isLoading, isFetching, refetch } =
    useDoctorFeedback({ page, limit: 10 })

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
          {t('feedback.doctor_eyebrow', { defaultValue: 'Doctor · Feedback' })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
          {t('feedback.doctor_title', {
            defaultValue: 'What patients are saying.',
          })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('feedback.doctor_subtitle', {
            defaultValue:
              'Anonymous ratings from completed consultations. Patient names are hidden.',
          })}
        </p>
      </div>

      {/* Hero — average rating */}
      <section className="fade-up fade-up-delay-1 relative overflow-hidden rounded-3xl bg-hero-mesh text-white shadow-xl shadow-primary/25">
        <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/75 font-semibold">
              <Star className="h-3 w-3 fill-white" />
              {t('feedback.avg_eyebrow', { defaultValue: 'Average rating' })}
            </div>
            <div className="flex items-end gap-4 flex-wrap">
              <p className="font-display text-6xl sm:text-7xl tracking-tight leading-none tabular-nums">
                {stats.total > 0 ? stats.avg.toFixed(1) : '—'}
              </p>
              <div className="pb-2 space-y-1">
                <StarRating
                  value={Math.round(stats.avg)}
                  size="md"
                  className="text-white"
                />
                <p className="text-xs text-white/70 tabular-nums">
                  {t('feedback.based_on', {
                    defaultValue: 'Based on {{n}} rating{{plural}}',
                    n: stats.total,
                    plural: stats.total === 1 ? '' : 's',
                  })}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => refetch?.()}
              disabled={isFetching}
              className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-md shadow-black/10"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              />
              {t('common.refresh', { defaultValue: 'Refresh' })}
            </Button>
          </div>

          {/* Histogram */}
          <aside className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 p-5 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-white/80" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 font-semibold">
                {t('feedback.distribution', {
                  defaultValue: 'Distribution',
                })}
              </p>
            </div>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = stats.histogram?.[n] || 0
              const pct = stats.total ? (count / stats.total) * 100 : 0
              return (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-white/80 tabular-nums">{n}</span>
                  <Star className="h-3 w-3 fill-white/80 text-white/80" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-300 to-white/80 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-white/75 tabular-nums">
                    {count}
                  </span>
                </div>
              )
            })}
          </aside>
        </div>
      </section>

      {/* Reviews list */}
      <section className="fade-up fade-up-delay-2 rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl tracking-tight leading-none">
                {t('feedback.reviews_title', {
                  defaultValue: 'Recent reviews',
                })}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t('feedback.reviews_count', {
                  defaultValue: '{{n}} review{{plural}}',
                  n: total,
                  plural: total === 1 ? '' : 's',
                })}
              </p>
            </div>
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
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t('feedback.empty_body', {
                defaultValue:
                  'After your next completed consultation, patient feedback will appear here.',
              })}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/60">
              {items.map((f) => (
                <ReviewRow key={f._id} feedback={f} />
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

const ReviewRow = ({ feedback }) => (
  <li className="px-6 py-4 space-y-2">
    <div className="flex items-center gap-3">
      <StarRating value={feedback.rating} size="sm" />
      <span className="text-xs text-muted-foreground font-mono tabular-nums">
        {format(new Date(feedback.createdAt), "MMM d, yyyy · h:mm a")}
        {feedback.appointmentId?.datetime && (
          <span className="ml-2 opacity-70">
            · visit {format(new Date(feedback.appointmentId.datetime), 'MMM d')}
          </span>
        )}
      </span>
    </div>
    {feedback.comment && (
      <p className="text-sm text-foreground leading-relaxed pl-1">
        "{feedback.comment}"
      </p>
    )}
  </li>
)

export default DoctorFeedbackPage
