import { google } from 'googleapis';

const CALENDAR_IMPERSONATE = 'admin@tradesaioperator.uk';

/** GoogleAuth configured for Calendar API via Domain-Wide Delegation. */
export function getCalendarAuth() {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
    clientOptions: { subject: CALENDAR_IMPERSONATE },
  });
}
