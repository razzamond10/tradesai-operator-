/**
 * POST /api/voice/gather
 * Handles the speech gathered from the caller.
 * Detects intent (booking, emergency, quote, general), responds,
 * and logs the interaction to Google Sheets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logInteraction } from '@/lib/sheets';

function xml(content: string) {
  return new NextResponse(content, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function detectIntent(speech: string): { intent: string; response: string; outcome: string } {
  const s = speech.toLowerCase();

  if (/emergency|urgent|flood|gas leak|burst|fire|dangerous|no hot water|no heat/.test(s)) {
    return {
      intent: 'Emergency',
      response: `This sounds urgent. I'm alerting the team right now. Someone will call you back within the next 15 minutes. Please ensure you're safe — if there's immediate danger, call 999.`,
      outcome: 'Emergency logged',
    };
  }

  if (/book|appointment|schedule|slot|visit|come out|send someone/.test(s)) {
    return {
      intent: 'Booking Request',
      response: `Great, I've noted your booking request. Our team will call you back shortly to confirm a time that works for you. You'll receive a confirmation once it's booked.`,
      outcome: 'Booking enquiry',
    };
  }

  if (/quote|estimate|how much|price|cost|charge/.test(s)) {
    return {
      intent: 'Quote Request',
      response: `Thank you for your enquiry. I've passed your details to the team and they'll get back to you with a quote as soon as possible — usually within the hour.`,
      outcome: 'Quote requested',
    };
  }

  if (/review|feedback|complaint|unhappy|problem with/.test(s)) {
    return {
      intent: 'Feedback',
      response: `Thank you for your feedback. I've logged this and a manager will follow up with you directly. We take all feedback seriously.`,
      outcome: 'Feedback received',
    };
  }

  if (/cancel|reschedule|move|change|postpone/.test(s)) {
    return {
      intent: 'Reschedule/Cancel',
      response: `I've noted your request to reschedule. The team will call you back to arrange a new time. Apologies for any inconvenience.`,
      outcome: 'Reschedule request',
    };
  }

  return {
    intent: 'General Enquiry',
    response: `Thank you for calling. I've taken a note of your enquiry and the team will call you back shortly. Is there anything else you'd like me to pass on?`,
    outcome: 'General call',
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to') || params['To'] || '';
  const from = searchParams.get('from') || params['From'] || '';
  const callSid = searchParams.get('sid') || params['CallSid'] || '';
  const sheetId = searchParams.get('sheet') || '';

  const speechResult = params['SpeechResult'] || '';
  const confidence = params['Confidence'] || '0';

  console.log(`[GATHER] Speech: "${speechResult}" (confidence: ${confidence})`);
  console.log(`[GATHER] Call: ${from} → ${to} | SID: ${callSid}`);

  const { intent, response, outcome } = detectIntent(speechResult);

  // Log to Sheets asynchronously — don't block TwiML response
  if (sheetId) {
    logInteraction(sheetId, {
      timestamp: new Date().toISOString(),
      callerName: 'Caller',
      phone: from,
      intent,
      outcome,
      notes: `Speech: "${speechResult}" | Confidence: ${confidence} | SID: ${callSid}`,
    }).catch((err) => console.error('[GATHER] Sheet log failed:', err));
  }

  const safeResponse = escXml(response);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Emma-Neural" language="en-GB">${safeResponse}</Say>
  <Gather input="speech" action="/api/voice/follow-up?to=${encodeURIComponent(to)}&amp;from=${encodeURIComponent(from)}&amp;sid=${encodeURIComponent(callSid)}&amp;sheet=${encodeURIComponent(sheetId)}" method="POST" speechTimeout="3" timeout="8">
    <Say voice="Polly.Emma-Neural" language="en-GB">Is there anything else I can help you with?</Say>
  </Gather>
  <Say voice="Polly.Emma-Neural" language="en-GB">Thanks for calling. Have a great day. Goodbye.</Say>
  <Hangup/>
</Response>`;

  return xml(twiml);
}
