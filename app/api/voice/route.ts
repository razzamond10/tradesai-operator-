/**
 * POST /api/voice
 * Twilio inbound call webhook.
 * Returns TwiML that greets the caller, gathers their intent, then records.
 *
 * Env vars needed:
 *   TWILIO_AUTH_TOKEN  – used to verify request signatures (optional but recommended)
 *   GOOGLE_SERVICE_ACCOUNT + MASTER_SHEET_ID – to look up client by Twilio number
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientByTwilioNumber } from '@/lib/sheets';

function xml(content: string) {
  return new NextResponse(content, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  // Parse form-encoded body Twilio sends
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const to = params['To'] || '';
  const from = params['From'] || '';
  const callSid = params['CallSid'] || '';
  const callerName = params['CallerName'] || '';
  const direction = params['Direction'] || '';

  console.log(`[VOICE] Inbound call: ${from} → ${to} | SID: ${callSid}`);

  // Look up which client owns this Twilio number
  let businessName = 'your business';
  let tradeType = '';
  let clientSheetId = '';

  try {
    const client = await getClientByTwilioNumber(to);
    if (client) {
      businessName = client.businessName || businessName;
      tradeType = client.tradeType || '';
      clientSheetId = client.sheetId || '';
      console.log(`[VOICE] Matched client: ${businessName} (${tradeType})`);
    } else {
      console.warn(`[VOICE] No client found for number: ${to}`);
    }
  } catch (err) {
    console.error('[VOICE] Error looking up client:', err);
  }

  const safeName = escXml(businessName);
  const gatherUrl = `/api/voice/gather?to=${encodeURIComponent(to)}&from=${encodeURIComponent(from)}&sid=${encodeURIComponent(callSid)}&sheet=${encodeURIComponent(clientSheetId)}`;
  const statusUrl = `/api/voice/status?to=${encodeURIComponent(to)}&from=${encodeURIComponent(from)}&sid=${encodeURIComponent(callSid)}&sheet=${encodeURIComponent(clientSheetId)}`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${gatherUrl}" method="POST" speechTimeout="3" speechModel="experimental_conversations" timeout="8" bargeIn="true">
    <Say voice="Polly.Emma-Neural" language="en-GB">
      Hello, thanks for calling ${safeName}.
      I'm your AI receptionist. Please tell me your name and how I can help you today.
    </Say>
  </Gather>
  <Say voice="Polly.Emma-Neural" language="en-GB">
    I'm sorry, I didn't quite catch that. Please call back and we'll be happy to help. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

  return xml(twiml);
}

// GET returns a simple status check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'TradesAI Voice Webhook' });
}
