import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

import { useSubmitFeedback } from '@/apis'
import { errorToast, successToast } from '@/lib'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

import StarRating from './star-rating'

const RATING_LABEL_KEYS = {
  1: 'feedback.rating_1',
  2: 'feedback.rating_2',
  3: 'feedback.rating_3',
  4: 'feedback.rating_4',
  5: 'feedback.rating_5',
}
const RATING_LABEL_DEFAULTS = {
  1: 'Very poor',
  2: 'Poor',
  3: 'OK',
  4: 'Good',
  5: 'Excellent',
}

/**
 * Rating dialog opened from a completed appointment card. Submits 1–5 stars
 * + optional comment to /feedback. Closes itself on success.
 */
const FeedbackDialog = ({
  open,
  onOpenChange,
  appointment,
  onSubmitted,
}) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const { submit, isLoading } = useSubmitFeedback({
    onSuccess: (data) => {
      successToast({
        message: t('feedback.success', {
          defaultValue: 'Thanks — your feedback helps other villagers.',
        }),
      })
      onSubmitted?.(data?.feedback)
      onOpenChange?.(false)
    },
  })

  // Reset state when dialog closes.
  useEffect(() => {
    if (!open) {
      setRating(0)
      setComment('')
    }
  }, [open])

  const onConfirm = () => {
    if (!appointment?._id) return
    if (rating < 1) {
      errorToast({
        message: t('feedback.error_no_rating', {
          defaultValue: 'Please pick a star rating before submitting.',
        }),
      })
      return
    }
    submit(
      {
        data: {
          appointmentId: appointment._id,
          rating,
          comment: comment.trim() || undefined,
        },
      },
      {
        onError: (err) => {
          errorToast({
            message:
              err?.response?.data?.message ||
              t('feedback.error_generic', {
                defaultValue: 'Could not save feedback. Please try again.',
              }),
          })
        },
      },
    )
  }

  const doctorName = appointment?.doctorId?.name || ''
  const specialty = appointment?.doctorId?.specialty || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">
            <Sparkles className="h-3 w-3" />
            {t('feedback.eyebrow', { defaultValue: 'Rate your consultation' })}
          </div>
          <DialogTitle className="font-display text-2xl tracking-tight">
            {doctorName
              ? t('feedback.dialog_title_named', {
                  defaultValue: 'How was your visit with Dr {{name}}?',
                  name: doctorName,
                })
              : t('feedback.dialog_title', {
                  defaultValue: 'How was your visit?',
                })}
          </DialogTitle>
          {specialty && (
            <DialogDescription>{specialty}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Stars */}
          <div className="flex flex-col items-center gap-2">
            <StarRating
              value={rating}
              onChange={setRating}
              size="xl"
            />
            <p className="text-sm font-medium text-muted-foreground min-h-5">
              {rating > 0 &&
                t(RATING_LABEL_KEYS[rating], {
                  defaultValue: RATING_LABEL_DEFAULTS[rating],
                })}
            </p>
          </div>

          {/* Optional comment */}
          <div className="space-y-1.5">
            <label
              htmlFor="feedback-comment"
              className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold"
            >
              {t('feedback.comment_label', {
                defaultValue: 'Anything else? (optional)',
              })}
            </label>
            <Textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={t('feedback.comment_placeholder', {
                defaultValue:
                  'What went well, or what could be better?',
              })}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground/80 text-right tabular-nums">
              {comment.length}/1000
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('feedback.privacy_note', {
              defaultValue:
                'Your rating is shown to the doctor without your name. Admins see who left what.',
            })}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || rating < 1}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading
              ? t('feedback.submitting', { defaultValue: 'Submitting…' })
              : t('feedback.submit', { defaultValue: 'Submit feedback' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackDialog
