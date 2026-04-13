/**
 * POST /api/voice/follow-up
 * Handles the second speech gather ("Is there anything else?").
 * Wraps up the call gracefully and logs final interaction.
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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || params['From'] || '';
  const callSid = searchParams.get('sid') || params['CallSid'] || '';
  const sheetId = searchParams.get('sheet') || '';

  const speechResult = params['SpeechResult'] || '';

  let additionalNote = '';
  if (speechResult && speechResult.toLowerCase() !== 'no' && speechResult.length > 2) {
    additionalNote = `Follow-up: "${speechResult}"`;

    // Log additional note to Sheets
    if (sheetId) {
      logInteraction(sheetId, {
        timestamp: new Date().toISOString(),
        callerName: 'Caller',
        phone: from,
        intent: 'Follow-up',
        outcome: 'Additional info provided',
        notes: additionalNote + ` | SID: ${callSid}`,
      }).catch((err) => console.error('[FOLLOW-UP] Sheet log failed:', err));
    }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Emma-Neural" language="en-GB">
    ${additionalNote ? escXml("Great, I've made a note of that.") : ''}
    Thanks so much for calling. We'll be in touch shortly. Have a wonderful day. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

  return xml(twiml);
}
