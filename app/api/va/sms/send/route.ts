import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig } from '@/lib/sheets';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, toPhone, message } = await req.json();
    if (!toPhone || !message) {
      return Response.json({ error: 'toPhone and message required' }, { status: 400 });
    }
    if (message.length > 1600) {
      return Response.json({ error: 'Message too long (max 1600 chars)' }, { status: 400 });
    }
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    if (!config.twilioNumber) {
      return Response.json({ error: 'Client has no Twilio number assigned' }, { status: 400 });
    }
    const vaName = session.email.split('@')[0];
    const prefixedMessage = `[Reply from ${vaName}] ${message}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      from: config.twilioNumber, to: toPhone, body: prefixedMessage,
    });
    await logVAAction({
      vaEmail: session.email, vaName, actionType: 'sms.send',
      clientId, targetType: 'sms', targetId: result.sid,
      beforeValue: '', afterValue: prefixedMessage, notes: `to=${toPhone}`,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true, sid: result.sid });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/sms/send]', err);
    return Response.json({ error: (err as Error).message || 'Internal error' }, { status: 500 });
  }
}
