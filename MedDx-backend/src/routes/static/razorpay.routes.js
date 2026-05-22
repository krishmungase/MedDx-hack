import express from 'express'

import { logger } from '../../logger/index.js'

/**
 * Proxies Razorpay's checkout.js through our own origin so browser
 * extensions / DNS blocklists targeting `checkout.razorpay.com` can't
 * stop the modal from loading on the demo machine.
 *
 * The upstream is fetched once on first request and cached in-memory for
 * an hour. Razorpay rev's the script occasionally; a process restart picks
 * up the new build.
 */
const razorpayStaticRoutes = express.Router()

const UPSTREAM = 'https://checkout.razorpay.com/v1/checkout.js'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1h

let cache = null // { fetchedAt: Date, body: Buffer, etag?: string }

const fetchUpstream = async () => {
  const res = await fetch(UPSTREAM, { redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`Razorpay checkout.js fetch failed: ${res.status}`)
  }
  const ab = await res.arrayBuffer()
  return {
    fetchedAt: Date.now(),
    body: Buffer.from(ab),
    etag: res.headers.get('etag') || null,
  }
}

razorpayStaticRoutes.get('/checkout.js', async (req, res) => {
  try {
    if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
      cache = await fetchUpstream()
      logger.info({
        msg: 'Razorpay checkout.js cached',
        data: { bytes: cache.body.length },
      })
    }
    res.set({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Proxy-Source': 'razorpay-checkout',
      ...(cache.etag ? { ETag: cache.etag } : {}),
    })
    res.send(cache.body)
  } catch (err) {
    logger.error({
      msg: 'Razorpay checkout.js proxy failed',
      error: err?.message,
    })
    res.status(502).send('// upstream fetch failed\n')
  }
})

export default razorpayStaticRoutes
