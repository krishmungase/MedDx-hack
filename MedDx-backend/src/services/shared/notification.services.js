import nodemailer from 'nodemailer'

import { logger } from '../../logger/index.js'
import { ENV } from '../../config/index.js'

class NotificationService {
  constructor() {
    this.isConfigured = Boolean(ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD)
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: ENV.GMAIL_USER,
          pass: ENV.GMAIL_APP_PASSWORD,
        },
      })
    } else {
      this.transporter = null
    }
  }

  async send({ to, subject, text, html, from }) {
    if (!this.isConfigured) {
      logger.warn({
        msg: 'Email not configured (missing GMAIL_USER / GMAIL_APP_PASSWORD); skipping send',
      })
      return { sent: false }
    }
    try {
      const mailOptions = {
        from: from
          ? `${from} <${ENV.GMAIL_USER}>`
          : `"${ENV.APP_NAME || 'MedDx'}" <${ENV.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      }

      await this.transporter.sendMail(mailOptions)
      return { sent: true }
    } catch (error) {
      logger.error({ error: error?.message })
      throw new Error('Unable to send email at this time.')
    }
  }
}

export default NotificationService
