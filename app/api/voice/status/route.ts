/**
 * POST /api/voice/status
 * Twilio StatusCallback — called when a call ends.
 * Logs final call details to Google Sheets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logInteraction } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to') || params['To'] || '';
  const from = searchParams.get('from') || params['From'] || '';
  const callSid = searchParams.get('sid') || params['CallSid'] || '';
  const sheetId = searchParams.get('sheet') || '';

  const callStatus = params['CallStatus'] || '';
  const callDuration = params['CallDuration'] || '0';
  const direction = params['Direction'] || '';

  console.log(`[STATUS] Call ended: ${from} → ${to} | Status: ${callStatus} | Duration: ${callDuration}s`);

  // Only log completed calls (not no-answer, busy, etc.)
  if (sheetId && (callStatus === 'completed' || callStatus === 'in-progress')) {
    try {
      await logInteraction(sheetId, {
        timestamp: new Date().toISOString(),
        callerName: 'Caller',
        phone: from,
        intent: 'Inbound call',
        outcome: callStatus === 'completed' ? 'Completed' : callStatus,
        notes: `Duration: ${callDuration}s | Direction: ${direction} | SID: ${callSid}`,
      });
      console.log('[STATUS] Logged to Sheets');
    } catch (err) {
      console.error('[STATUS] Sheet log failed:', err);
    }
  }

  return new NextResponse('', { status: 204 });
}
