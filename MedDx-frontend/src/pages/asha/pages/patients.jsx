import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  ChevronRight,
  MapPin,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react'

import { useAshaPatients } from '@/apis'
import { useAuth, usePageTitle } from '@/hooks'
import { pageTitle } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import AddVillagerDialog from '../components/add-villager-dialog'

const PatientsPage = () => {
  usePageTitle({ title: pageTitle.ASHA_DASHBOARD })
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { villagers, isLoading } = useAshaPatients({ search: query })

  return (
    <div className="space-y-6">
      <div className="fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-semibold">
            {t('asha.eyebrow', { defaultValue: 'ASHA' })}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
            {t('asha.roster.title')}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {t('asha.roster.subtitle')}
          </p>
        </div>
        <AddVillagerDialog defaultVillage={user?.village} />
      </div>

      <section className="fade-up fade-up-delay-1 rounded-3xl border border-border/70 bg-card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-display tracking-tight">
                {villagers.length} {t('asha.roster.count')}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('asha.roster.search')}
              className="h-10 pl-9 rounded-full bg-background"
            />
          </div>
        </header>

        {isLoading ? (
          <Loading />
        ) : villagers.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border/60">
            {villagers.map((v) => (
              <li
                key={v._id}
                className="flex flex-wrap items-center gap-4 px-6 py-4"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage-foreground font-semibold text-base shrink-0">
                  {v.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base tracking-tight truncate">
                    {v.name}{' '}
                    {v.age && (
                      <span className="text-sm text-muted-foreground font-normal">
                        · {v.age}{' '}
                        {v.gender !== 'prefer_not_to_say' ? v.gender : ''}
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {v.village && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {v.village}
                      </span>
                    )}
                    {v.lastVisit && (
                      <span className="font-mono tabular-nums">
                        {t('asha.roster.last_visit')}:{' '}
                        {format(new Date(v.lastVisit), 'MMM d, yyyy')}
                      </span>
                    )}
                    {!v.lastVisit && (
                      <span>{t('asha.roster.no_visit')}</span>
                    )}
                  </div>
                </div>
                {v.urgent > 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] uppercase tracking-[0.12em] bg-destructive/15 text-destructive border-destructive/30"
                  >
                    {v.urgent} {t('asha.roster.urgent')}
                  </Badge>
                )}
                {v.pending > 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] uppercase tracking-[0.12em]"
                  >
                    {v.pending} {t('asha.roster.pending')}
                  </Badge>
                )}
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate(`/asha/patients/${v._id}`)}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  {t('asha.roster.open')}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
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
      </li>
    ))}
  </ul>
)

const Empty = () => {
  const { t } = useTranslation()
  return (
    <div className="py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        {t('asha.roster.empty_title')}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {t('asha.roster.empty_body')}
      </p>
    </div>
  )
}

export default PatientsPage
