import { useMemo, useState } from 'react'
import { Search, Stethoscope, UserSearch } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

const FindDoctor = ({ onBooked }) => {
  const { doctors, isLoading } = useActiveDoctors()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q)
    )
  }, [doctors, query])

  return (
    <section className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border/70">
        <div>
          <h2 className="font-display text-xl tracking-tight">Find a doctor</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doctors.length} specialist{doctors.length === 1 ? '' : 's'}{' '}
            available
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty"
            className="h-10 pl-9 rounded-full bg-background"
          />
        </div>
      </header>

      {isLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty hasQuery={!!query} />
      ) : (
        <ul className="divide-y divide-border/60">
          {filtered.map((d) => (
            <li
              key={d._id}
              className="flex flex-wrap items-center gap-4 px-6 py-4"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-clinic/10 text-clinic font-semibold shrink-0">
                {initialsOf(d.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base tracking-tight">
                  Dr {d.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.specialty || 'General practitioner'}
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setPicked(d)}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Book a slot
              </Button>
            </li>
          ))}
        </ul>
      )}

      <BookDoctorDialog
        doctor={picked}
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

const Empty = ({ hasQuery }) => (
  <div className="py-14 text-center">
    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <UserSearch className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-display text-lg tracking-tight">
      {hasQuery ? 'No matches' : 'No doctors yet'}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
      {hasQuery
        ? 'Try a different name or specialty.'
        : 'New specialists are onboarded by admins. Check back soon.'}
    </p>
  </div>
)

export default FindDoctor
