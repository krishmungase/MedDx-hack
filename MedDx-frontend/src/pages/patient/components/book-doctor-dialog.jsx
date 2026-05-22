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
// Backend remains the source of truth — this is just so the patient isn't
// surprised when Razorpay either opens or doesn't.
const computePricing = ({ user, triage, t }) => {
  const isEmergency = triage?.urgency === 'emergency'
  const firstFree = !user?.freeConsultationUsed
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
  const pricing = useMemo(
    () => computePricing({ user, triage, t }),
    [user, triage, t]
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

  const finishBooking = (appointment) => {
    successToast({ message: t('book_dialog.confirm_booking') })
    onBooked?.(appointment)
    onOpenChange(false)
    setSelected(null)
  }

  const onConfirm = async () => {
    if (!selected) return

    const bookPayload = {
      slotId: selected._id,
      ...(triage?.summary ? { triageSummary: triage.summary } : {}),
      ...(triage?.urgency ? { triageUrgency: triage.urgency } : {}),
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
      return finishBooking(response.appointment)
    }

    // Paid path: open Razorpay checkout, then verify.
    setIsPaying(true)
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
        },
      })
    } catch (err) {
      setIsPaying(false)
      return errorToast({
        message: err?.message || 'Payment was cancelled.',
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
        },
      })
      finishBooking(verified.appointment)
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

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-card/50">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground max-w-[55%]">
              {selected
                ? t('book_dialog.selected', {
                    when: format(
                      new Date(selected.datetime),
                      "EEE, MMM d 'at' h:mm a"
                    ),
                  })
                : pricing.note}
            </p>
            <div className="flex items-center gap-2">
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
