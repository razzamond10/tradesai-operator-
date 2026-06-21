import { NextRequest } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilioVerify';
import { appendReply } from '@/lib/sheets';

const TWIML_OK = '<Response></Response>';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!validateTwilioSignature(req, rawBody)) {
    console.warn('[twilio/sms/inbound] Rejected — invalid Twilio signature');
    return new Response('Forbidden', { status: 403 });
  }

  const params = Object.fromEntries(new URLSearchParams(rawBody));
  const { From = '', To = '', Body = '', MessageSid = '' } = params;

  // Write to Replies tab — 8 s serverless timeout, never retry-storm Twilio
  try {
    await Promise.race([
      appendReply({
        direction: 'in',
        from: From,
        to: To,
        body: Body,
        messageSid: MessageSid,
        status: 'received',
        linkedPhone: From,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('sheet write timeout')), 8000)
      ),
    ]);
  } catch (err) {
    console.error('[twilio/sms/inbound] sheet write error:', (err as Error).message);
  }

  return new Response(TWIML_OK, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
