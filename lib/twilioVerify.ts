/**
 * lib/twilioVerify.ts
 * Twilio webhook signature verification.
 * Returns true only if X-Twilio-Signature matches the auth token + URL + body.
 */
import twilio from 'twilio';
import type { NextRequest } from 'next/server';

export function validateTwilioSignature(req: NextRequest, body: string): boolean {
  const sig = req.headers.get('x-twilio-signature') || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.error('[TWILIO_VERIFY] TWILIO_AUTH_TOKEN env var missing — refusing all requests');
    return false;
  }

  if (!sig) {
    console.warn('[TWILIO_VERIFY] No X-Twilio-Signature header on request');
    return false;
  }

  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const path = new URL(req.url).pathname + new URL(req.url).search;
  const fullUrl = `${proto}://${host}${path}`;

  const params = Object.fromEntries(new URLSearchParams(body));

  try {
    return twilio.validateRequest(authToken, sig, fullUrl, params);
  } catch (err) {
    console.error('[TWILIO_VERIFY] Validation threw:', err);
    return false;
  }
}
