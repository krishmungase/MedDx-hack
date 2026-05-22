import { useCallback, useEffect, useState } from 'react'

// Same-origin proxy on our backend that re-serves Razorpay's official
// checkout.js. Loading the script from our own domain dodges ad-blockers
// and corporate DNS filters that target checkout.razorpay.com. If the
// proxy itself fails, we fall back to the upstream URL.
//
// We read VITE_BACKEND_URL directly (instead of via the appEnv barrel) so
// this module is decoupled from the env-config object's shape — if that
// barrel ever returns undefined during HMR, the loader still works.
const resolveBackendOrigin = () => {
  const raw =
    (typeof import.meta !== 'undefined' &&
      import.meta?.env?.VITE_BACKEND_URL) ||
    ''
  return String(raw).replace(/\/$/, '')
}
const PROXIED_SCRIPT_URL = `${resolveBackendOrigin()}/static/razorpay/checkout.js`
const UPSTREAM_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let loadingPromise = null

const injectScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })

const ensureScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.Razorpay) return Promise.resolve()
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    // Prefer the canonical upstream script. Modern ad-blockers usually leave
    // checkout.razorpay.com alone (it's a payment domain on most allowlists)
    // and only block their analytics subdomain.
    try {
      await injectScript(UPSTREAM_SCRIPT_URL)
      if (window.Razorpay) return
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(
        '[razorpay] upstream load failed, trying same-origin proxy',
        e?.message
      )
    }
    // Same-origin proxy fallback for environments that DO block razorpay.com.
    try {
      await injectScript(PROXIED_SCRIPT_URL)
      if (!window.Razorpay) {
        throw new Error('Razorpay global missing after script load')
      }
    } catch (e) {
      loadingPromise = null
      throw e
    }
  })()
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
        if (!keyId) {
          return reject(new Error('Razorpay key missing — backend not configured.'))
        }
        if (!order?.id) {
          return reject(new Error('Razorpay order id missing.'))
        }
        ensureScript()
          .then(() => {
            const options = {
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
                  reject(new Error('Payment cancelled.')),
              },
            }
            // eslint-disable-next-line no-console
            console.info('[razorpay] opening checkout', {
              key: keyId,
              order_id: order.id,
              amount: order.amount,
            })
            try {
              const rzp = new window.Razorpay(options)
              rzp.on('payment.failed', (response) => {
                // eslint-disable-next-line no-console
                console.error('[razorpay] payment.failed', response?.error)
                const e = response?.error || {}
                reject(
                  new Error(
                    e.description ||
                      e.reason ||
                      e.code ||
                      'Payment failed. Please try again.'
                  )
                )
              })
              rzp.open()
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('[razorpay] init/open threw', err)
              reject(
                new Error(
                  err?.message || 'Razorpay checkout failed to open.'
                )
              )
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[razorpay] script load failed', err)
            reject(err)
          })
      }),
    []
  )

  return { ready, loadError, openCheckout }
}

export default useRazorpay
