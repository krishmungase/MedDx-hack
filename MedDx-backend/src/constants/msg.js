const MSG = {
  DB_CONNECTED: 'Database connected successfully',
  LLM: {
    CALL_LLM_ERROR: 'LLM call failed.',
  },
  ASSISTANT: {
    GENERATE_RESPONSE: 'Assistant generated a response.',
  },
  AUTH: {
    SELF: 'Self',
    USER_REGISTERED: 'User registered successfully.',
    USER_VERIFIED: 'User verified successfully.',
    USER_LOGGED_IN: 'User logged in successfully.',
    FORGOT_PASSWORD: 'Forgot password request initiated.',
    RESET_PASSWORD: 'Password reset successfully.',
    USER_UPDATED_FULL_NAME: 'User full name updated.',
    USER_UPDATED_AVATAR: 'User avatar updated.',
    DOCTOR_INVITED: 'Doctor invited; awaiting password setup.',
    DOCTOR_ACTIVATED: 'Doctor account activated via set-password link.',
  },
  ADMIN: {
    DOCTOR_SUSPENDED: 'Doctor suspended by admin.',
    DOCTOR_REMOVED: 'Doctor removed by admin.',
  },
  MAILER: {
    NOT_CONFIGURED:
      'Gmail not configured (missing GMAIL_USER / GMAIL_APP_PASSWORD). Returning link instead.',
    SEND_FAILED: 'Failed to send email; returning link as fallback.',
  },
}

export default MSG
