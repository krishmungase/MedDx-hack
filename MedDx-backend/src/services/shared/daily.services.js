import { ENV } from '../../config/index.js'
import { logger } from '../../logger/index.js'

/**
 * Thin wrapper around the Daily.co REST API.
 *
 * Why Daily over Jitsi (meet.jit.si):
 *   - No login wall on the room moderator (Jitsi started requiring auth in 2024)
 *   - Adaptive bitrate + automatic audio-only fallback when bandwidth drops
 *   - Predictable rooms via REST API instead of guessing room names
 *
 * If DAILY_API_KEY / DAILY_DOMAIN are missing, calls throw so the controller
 * can fall back to the Jitsi public room (best-effort) rather than 500'ing.
 */
class DailyService {
  constructor() {
    this.apiKey = ENV.DAILY_API_KEY
    // Accept either "meddx" or "meddx.daily.co" — strip the suffix so the
    // URL builder always produces a single ".daily.co" instead of stacking.
    const raw = (ENV.DAILY_DOMAIN || '').trim()
    this.domain = raw.replace(/\.daily\.co\/?$/i, '')
    this.isConfigured = Boolean(this.apiKey && this.domain)
    this.baseUrl = 'https://api.daily.co/v1'
  }

  // Build the full join URL for a room name on our Daily subdomain.
  roomUrl(name) {
    if (!this.domain) return null
    return `https://${this.domain}.daily.co/${name}`
  }

  // Idempotently create a room. Daily returns 409 if it already exists;
  // we treat that as success and just return the predictable URL.
  async ensureRoom({ name, expSec }) {
    if (!this.isConfigured) {
      throw new Error('Daily not configured (DAILY_API_KEY / DAILY_DOMAIN)')
    }
    const body = {
      name,
      privacy: 'public',
      properties: {
        exp: expSec,
        eject_at_room_exp: true,
        enable_prejoin_ui: false,
        enable_chat: true,
        enable_screenshare: true,
        max_participants: 2,
      },
    }
    const res = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (res.status === 409) {
      logger.info({ msg: 'Daily room already exists', data: { name } })
      return { url: this.roomUrl(name), name }
    }
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Daily ensureRoom failed: ${res.status} ${text}`)
    }
    const data = await res.json()
    return { url: data.url, name: data.name }
  }

  // A short-lived per-user join token with their display name + role.
  // is_owner=true gives the doctor full controls (eject, mute others).
  async createMeetingToken({ roomName, userName, isOwner = false, expSec }) {
    if (!this.isConfigured) {
      throw new Error('Daily not configured (DAILY_API_KEY / DAILY_DOMAIN)')
    }
    const res = await fetch(`${this.baseUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: isOwner,
          exp: expSec,
        },
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Daily createMeetingToken failed: ${res.status} ${text}`)
    }
    const data = await res.json()
    return data.token
  }
}

export default DailyService
