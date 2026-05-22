/**
 * Tiny RFC-5545 iCalendar builder.
 *
 * Just enough to attach a calendar invite to a booking-confirmation email
 * with two reminders (10 min + 5 min before the slot). Gmail auto-detects
 * text/calendar method=REQUEST and offers "Add to Google Calendar"; other
 * clients accept the same .ics attachment.
 */
class IcsService {
  constructor({ appName = 'MedDx', organizerEmail } = {}) {
    this.appName = appName
    this.organizerEmail = organizerEmail
  }

  // YYYYMMDDTHHMMSSZ in UTC.
  formatDate(date) {
    const d = new Date(date)
    return d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  // RFC 5545 §3.3.11 — backslash-escape ; , \ and newline.
  escape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n')
  }

  buildInvite({
    uid,
    start,
    end,
    summary,
    description,
    location,
    attendee,
    reminders = [10, 5],
  }) {
    const now = this.formatDate(new Date())
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${this.appName}//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}@meddx`,
      `DTSTAMP:${now}`,
      `DTSTART:${this.formatDate(start)}`,
      `DTEND:${this.formatDate(end)}`,
      `SUMMARY:${this.escape(summary)}`,
      `DESCRIPTION:${this.escape(description)}`,
      `LOCATION:${this.escape(location)}`,
      this.organizerEmail
        ? `ORGANIZER;CN=${this.escape(this.appName)}:MAILTO:${this.organizerEmail}`
        : null,
      attendee?.email
        ? `ATTENDEE;CN=${this.escape(attendee.name || '')};RSVP=TRUE:MAILTO:${attendee.email}`
        : null,
      'STATUS:CONFIRMED',
      ...reminders.flatMap((m) => [
        'BEGIN:VALARM',
        `TRIGGER:-PT${m}M`,
        'ACTION:DISPLAY',
        `DESCRIPTION:${this.escape(`${this.appName} consult in ${m} minutes`)}`,
        'END:VALARM',
      ]),
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean)

    return lines.join('\r\n')
  }
}

export default IcsService
