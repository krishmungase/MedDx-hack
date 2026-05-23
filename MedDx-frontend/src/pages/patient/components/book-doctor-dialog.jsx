import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, isSameDay, isToday, isTomorrow } from 'date-fns'
import { CalendarX, Clock, IndianRupee, Stethoscope } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  useBookAppointment,
  useDoctorSlots,
  useVerifyPayment,
} from '@/apis'
import { useAuth, useRazorpay } from '@/hooks'
import { errorToast, successToast } from '@/lib'

const CONSULT_RUPEES = 199

const dayHeading = (date, t) => {
  if (isToday(date)) return t('book_dialog.day_today')
  if (isTomorrow(date)) return t('book_dialog.day_tomorrow')
  return format(date, 'EEE, MMM d')
}

// Decide the price label for the chip + button before we even hit the server.
// The "subject" of the booking is either the patient (self-booking) or the
// villager (ASHA-assisted) — pricing tracks their freebie flag.
const computePricing = ({ subject, triage, t }) => {
  const isEmergency = triage?.urgency === 'emergency'
  const firstFree = !subject?.freeConsultationUsed
  if (isEmergency) {
    return {
      kind: 'free',
      label: t('book_dialog.free_emergency'),
      note: t('book_dialog.free_emergency_note'),
    }
  }
  if (firstFree) {
    return {
      kind: 'free',
      label: t('book_dialog.free_first'),
      note: t('book_dialog.free_first_note'),
    }
  }
  return {
    kind: 'paid',
    label: `₹${CONSULT_RUPEES}`,
    note: t('book_dialog.paid_note'),
  }
}

const BookDoctorDialog = ({
  doctor,
  open,
  onOpenChange,
  onBooked,
  triage,
  villagePatient,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const { slots, isLoading } = useDoctorSlots({
    doctorId: doctor?._id,
    enabled: !!doctor && open,
  })

  const { openCheckout } = useRazorpay()

  const { bookAppointmentAsync, isLoading: isBooking } = useBookAppointment()
  const { verifyPaymentAsync, isLoading: isVerifying } = useVerifyPayment()
  const [isPaying, setIsPaying] = useState(false)

  const busy = isBooking || isVerifying || isPaying
  // ASHA-assisted bookings track the villager's freebie state; otherwise
  // we use the logged-in patient's own.
  const subject = villagePatient || user
  const pricing = useMemo(
    () => computePricing({ subject, triage, t }),
    [subject, triage, t]
  )

  // Group future + available slots by day.
  const groups = useMemo(() => {
    const now = Date.now()
    const future = (slots || [])
      .filter((s) => new Date(s.datetime).getTime() > now)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    const acc = []
    future.forEach((s) => {
      const d = new Date(s.datetime)
      const last = acc[acc.length - 1]
      if (last && isSameDay(new Date(last.date), d)) last.slots.push(s)
      else acc.push({ date: d, slots: [s] })
    })
    return acc
  }, [slots])

  const finishBooking = (appointment, demoBypass = false) => {
    successToast({
      message: demoBypass
        ? 'Appointment confirmed (demo payment).'
        : 'Appointment confirmed.',
    })
    onBooked?.(appointment)
    onOpenChange(false)
    setSelected(null)
  }

  // Re-attempt the booking with the demoSkipPayment flag. Backend honors it
  // only when NODE_ENV !== 'production'. Used as a fallback when Razorpay's
  // CDN is blocked by browser extensions / DNS so the demo still works.
  const tryDemoBypass = async () => {
    setIsPaying(true)
    try {
      const demoResponse = await bookAppointmentAsync({
        data: {
          slotId: selected._id,
          demoSkipPayment: true,
          ...(triage?.summary ? { triageSummary: triage.summary } : {}),
          ...(triage?.urgency ? { triageUrgency: triage.urgency } : {}),
          ...(villagePatient
            ? { villagePatientId: villagePatient._id }
            : {}),
        },
      })
      if (demoResponse?.appointment) {
        finishBooking(demoResponse.appointment, true)
      } else {
        errorToast({ message: 'Demo bypass failed.' })
      }
    } catch (err) {
      errorToast({
        message:
          err?.response?.data?.message ||
          'Demo bypass not available — payments are configured for production.',
      })
    } finally {
      setIsPaying(false)
    }
  }

  const onConfirm = async () => {
    if (!selected) return

    const bookPayload = {
      slotId: selected._id,
      ...(triage?.summary ? { triageSummary: triage.summary } : {}),
      ...(triage?.urgency ? { triageUrgency: triage.urgency } : {}),
      ...(villagePatient ? { villagePatientId: villagePatient._id } : {}),
    }

    let response
    try {
      response = await bookAppointmentAsync({ data: bookPayload })
    } catch (err) {
      return errorToast({
        message:
          err?.response?.data?.message ||
          'Could not book — please try again.',
      })
    }

    // Free / emergency path: backend already confirmed.
    if (!response.paymentRequired) {
      return finishBooking(response.appointment, !!response.demoBypass)
    }

    // Paid path: close OUR dialog first — Radix Dialog is `aria-modal=true`
    // and traps focus / inerts everything outside the portal. That makes
    // Razorpay's checkout iframe render but be completely un-clickable. By
    // dismissing the dialog before .open(), Razorpay owns the page and
    // receives clicks/typing normally.
    setIsPaying(true)
    onOpenChange(false)
    // Microtask gap so Radix has a tick to remove its inert/aria-hidden
    // attributes before we splash Razorpay's iframe in.
    await new Promise((r) => setTimeout(r, 50))

    let payResult
    try {
      payResult = await openCheckout({
        keyId: response.keyId,
        order: response.order,
        name: 'MedDx',
        description: `Consult with Dr ${doctor.name}`,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '9999999999',
        },
      })
    } catch (err) {
      setIsPaying(false)
      const msg = err?.message || ''
      // eslint-disable-next-line no-console
      console.warn('[razorpay] checkout did not complete:', msg)
      // Only fall back to demo when Razorpay's script genuinely couldn't
      // load — ad-blockers, DNS rules, etc. User-dismissed modals and
      // payment-failed events surface as their own messages and shouldn't
      // silently book.
      if (/failed to load|script|razorpay global missing/i.test(msg)) {
        return tryDemoBypass()
      }
      return errorToast({
        message: msg || 'Payment cancelled.',
      })
    }

    try {
      const verified = await verifyPaymentAsync({
        data: {
          slotId: response.slotId,
          razorpay_order_id: payResult.razorpay_order_id,
          razorpay_payment_id: payResult.razorpay_payment_id,
          razorpay_signature: payResult.razorpay_signature,
          ...(triage?.summary ? { triageSummary: triage.summary } : {}),
          ...(triage?.urgency ? { triageUrgency: triage.urgency } : {}),
          ...(villagePatient
            ? { villagePatientId: villagePatient._id }
            : {}),
        },
      })
      successToast({ message: 'Appointment confirmed.' })
      onBooked?.(verified.appointment)
      setSelected(null)
    } catch (err) {
      errorToast({
        message:
          err?.response?.data?.message ||
          'Payment received but we could not confirm the booking. Contact support.',
      })
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!busy) onOpenChange(o)
        if (!o) setSelected(null)
      }}
    >
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clinic/10 text-clinic shrink-0">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-xl tracking-tight">
                {t('book_dialog.title', { name: doctor?.name || '' })}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                {t('book_dialog.description', {
                  specialty: doctor?.specialty || '',
                })}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={`rounded-full text-[10px] uppercase tracking-[0.14em] shrink-0 ${
                pricing.kind === 'free'
                  ? 'bg-sage/15 text-sage-foreground border-sage/30'
                  : 'bg-clinic/10 text-clinic border-clinic/25'
              }`}
            >
              {pricing.kind === 'paid' && (
                <IndianRupee className="h-3 w-3 -mr-1" />
              )}
              {pricing.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-4 border-t border-border/60">
          {isLoading ? (
            <Loading />
          ) : groups.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <div key={g.date.toISOString()}>
                  <div className="flex items-baseline gap-3 mb-2.5">
                    <p className="font-display text-base tracking-tight">
                      {dayHeading(g.date, t)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {format(g.date, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {g.slots.map((s) => {
                      const time = format(new Date(s.datetime), 'h:mm a')
                      const isSel = selected?._id === s._id
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => setSelected(s)}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-mono tabular-nums transition-colors ${
                            isSel
                              ? 'border-clinic bg-clinic/10 text-clinic font-semibold'
                              : 'border-border bg-card hover:border-clinic/40 hover:bg-clinic/5'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 opacity-70" />
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-card/50 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-muted-foreground sm:max-w-[55%]">
            {selected
              ? t('book_dialog.selected', {
                  when: format(
                    new Date(selected.datetime),
                    "EEE, MMM d 'at' h:mm a"
                  ),
                })
              : pricing.note}
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                disabled={busy}
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5"
              disabled={!selected || busy}
              onClick={onConfirm}
            >
              {busy ? <Spinner /> : null}
              {pricing.kind === 'paid'
                ? t('book_dialog.pay_and_book', { amount: CONSULT_RUPEES })
                : t('book_dialog.confirm_booking')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Loading = () => (
  <div className="space-y-4">
    {[0, 1].map((i) => (
      <div key={i}>
        <div className="h-4 w-32 rounded bg-muted/70 animate-pulse mb-2" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <div
              key={j}
              className="h-10 rounded-xl bg-muted/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const Empty = () => {
  const { t } = useTranslation()
  return (
    <div className="py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarX className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        {t('book_dialog.no_slots_title')}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {t('book_dialog.no_slots_body')}
      </p>
    </div>
  )
}

export default BookDoctorDialog
