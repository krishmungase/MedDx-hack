import Mailgen from 'mailgen'

import { ENV } from '../../config/index.js'

class MailgenService {
  constructor() {
    this.mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: ENV.APP_NAME,
        link: ENV.FRONTEND_URL,
        logo: ENV.APP_LOGO,
      },
    })
  }

  generateEmail(params) {
    const { name, intro, actionText, actionLink, actionInstructions, outro } =
      params

    const emailBody = {
      body: {
        name: name || '',
        intro: intro || '',
        action:
          actionText && actionLink
            ? {
                instructions: actionInstructions || '',
                button: {
                  color: '#007BFF',
                  text: actionText,
                  link: actionLink,
                },
              }
            : null,
        outro: outro || '',
      },
    }

    return {
      emailHTML: this.mailGenerator.generate(emailBody),
      emailText: this.mailGenerator.generatePlaintext(emailBody),
    }
  }

  verificationEmailHTML({ name, link }) {
    return this.generateEmail({
      name,
      intro: `Welcome to ${ENV.APP_NAME}! We're excited to have you on board.`,
      actionInstructions: `To get started with ${ENV.APP_NAME}, please verify your email address by clicking the button below.`,
      actionText: 'Verify Email',
      actionLink: link,
      outro: `Have questions? Reply to this email and we'll be happy to help.`,
    })
  }

  resetPasswordEmailHTML({ name, link }) {
    return this.generateEmail({
      name,
      intro: `You requested to reset your ${ENV.APP_NAME} password.`,
      actionInstructions: `Click the button below to set a new password. This link expires in 1 hour.`,
      actionText: 'Reset Password',
      actionLink: link,
      outro: `If you didn't make this request, please ignore this email.`,
    })
  }

  contactEmailHTML({ contact }) {
    const { firstName, lastName, email, message, interestArea } = contact

    const emailContent = {
      body: {
        intro: `📬 New contact form submission received via ${ENV.APP_NAME}.`,
        table: {
          data: [
            {
              'First Name': firstName || 'N/A',
              'Last Name': lastName || 'N/A',
              Email: email || 'N/A',
              'Interest Area': interestArea || 'N/A',
              Message: message || 'No message provided',
            },
          ],
          columns: {
            customWidth: {
              'First Name': '10%',
              'Last Name': '10%',
              Email: '20%',
              'Interest Area': '20%',
              Message: '40%',
            },
            customAlignment: {
              'First Name': 'left',
              'Last Name': 'left',
              Email: 'left',
              'Interest Area': 'left',
              Message: 'left',
            },
          },
        },
        outro: `Follow up directly with the user if needed. This is an automated notification.`,
      },
    }

    return {
      emailHTML: this.mailGenerator.generate(emailContent),
      emailText: this.mailGenerator.generatePlaintext(emailContent),
    }
  }
}

export default MailgenService
