import { useCallback, useEffect, useState } from 'react'

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loadingPromise = null
const ensureScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.Razorpay) return Promise.resolve()
  if (loadingPromise) return loadingPromise
  loadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_URL
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loadingPromise = null
      reject(new Error('Failed to load Razorpay checkout'))
    }
    document.head.appendChild(s)
  })
  return loadingPromise
}

/**
 * Loads Razorpay's checkout.js on demand and exposes an `openCheckout`
 * helper that resolves with `{razorpay_order_id, razorpay_payment_id,
 * razorpay_signature}` on success or rejects on dismissal/error.
 */
const useRazorpay = () => {
  const [ready, setReady] = useState(Boolean(typeof window !== 'undefined' && window.Razorpay))
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    ensureScript()
      .then(() => setReady(true))
      .catch((e) => setLoadError(e.message))
  }, [])

  const openCheckout = useCallback(
    ({
      keyId,
      order,
      name = 'MedDx',
      description = 'Video consult',
      prefill,
      theme = { color: '#0a3a47' },
    }) =>
      new Promise((resolve, reject) => {
        ensureScript()
          .then(() => {
            const rzp = new window.Razorpay({
              key: keyId,
              order_id: order.id,
              amount: order.amount,
              currency: order.currency,
              name,
              description,
              prefill,
              theme,
              handler: (response) => resolve(response),
              modal: {
                ondismiss: () =>
                  reject(new Error('Payment was cancelled.')),
              },
            })
            rzp.on('payment.failed', (response) => {
              reject(
                new Error(
                  response?.error?.description ||
                    'Payment failed. Please try again.'
                )
              )
            })
            rzp.open()
          })
          .catch(reject)
      }),
    []
  )

  return { ready, loadError, openCheckout }
}

export default useRazorpay
