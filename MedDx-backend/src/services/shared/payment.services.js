import crypto from 'crypto'
import Razorpay from 'razorpay'

import { ENV } from '../../config/index.js'
import { logger } from '../../logger/index.js'
import { CURRENCY } from '../../constants/pricing.js'

/**
 * Razorpay payments — TEST mode for the hackathon. We keep all amounts
 * in paise (no float drift), use server-side signature verification, and
 * never trust the client for "this payment succeeded".
 */
class PaymentService {
  constructor() {
    this.keyId = ENV.RAZORPAY_KEY_ID
    this.keySecret = ENV.RAZORPAY_KEY_SECRET
    this.isConfigured = Boolean(this.keyId && this.keySecret)
    this.client = this.isConfigured
      ? new Razorpay({ key_id: this.keyId, key_secret: this.keySecret })
      : null
  }

  // Creates a Razorpay order. We pass slotId + patientId in `notes` so the
  // webhook (and post-verify lookup) can stitch the payment back to its
  // intended booking even if the client lies on /verify.
  //
  // Razorpay's `receipt` field has a 40-char limit. A Mongo ObjectId alone is
  // 24 chars, so we shorten to "md_<last-12-of-id>_<base36-epoch>" which fits
  // comfortably and still gives a unique-per-attempt receipt.
  async createOrder({ amountPaise, slotId, patientId }) {
    if (!this.isConfigured) {
      throw new Error('Razorpay not configured — set RAZORPAY_KEY_ID/SECRET')
    }
    const idTail = String(slotId).slice(-12)
    const stamp = Date.now().toString(36)
    const receipt = `md_${idTail}_${stamp}` // ≤ 28 chars
    try {
      const order = await this.client.orders.create({
        amount: amountPaise,
        currency: CURRENCY,
        receipt,
        notes: { slotId: String(slotId), patientId: String(patientId) },
      })
      logger.info({
        msg: 'Razorpay order created',
        data: { orderId: order.id, slotId, amount: amountPaise },
      })
      return order
    } catch (err) {
      // Razorpay's SDK wraps errors in `err.error.description` rather than
      // `err.message`. Surface both so the controller log isn't empty.
      const detail =
        err?.error?.description ||
        err?.error?.reason ||
        err?.statusCode ||
        err?.message ||
        'unknown'
      logger.error({
        msg: 'Razorpay order create failed',
        data: { slotId, amount: amountPaise, receipt, detail },
      })
      const wrapped = new Error(`Razorpay: ${detail}`)
      wrapped.cause = err
      throw wrapped
    }
  }

  // Razorpay's standard signature verification, copied verbatim from their docs:
  // HMAC-SHA256(orderId + "|" + paymentId, keySecret) === provided signature.
  verifySignature({ orderId, paymentId, signature }) {
    if (!this.isConfigured) return false
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    return expected === signature
  }

  // Fetch an order so we can trust its notes/amount/status, not the client.
  async fetchOrder(orderId) {
    if (!this.isConfigured) throw new Error('Razorpay not configured')
    return await this.client.orders.fetch(orderId)
  }
}

export default PaymentService
