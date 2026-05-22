import nodemailer from 'nodemailer'

import { logger } from '../../logger/index.js'
import { ENV } from '../../config/index.js'

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.MAIL_HOST,
      port: ENV.MAIL_PORT,
      secure: ENV.MAIL_SECURE || false,
      auth: {
        user: ENV.MAIL_USERNAME,
        pass: ENV.MAIL_PASSWORD,
      },
    })
  }

  async send({ to, subject, text, html, from }) {
    try {
      const mailOptions = {
        from: from ? `${from} <${ENV.MAIL_USERNAME}>` : ENV.MAIL_FROM,
        to,
        subject,
        text,
        html,
      }

      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      logger.error({ error: error?.message })
      throw new Error('Unable to send email at this time.')
    }
  }
}

export default NotificationService
