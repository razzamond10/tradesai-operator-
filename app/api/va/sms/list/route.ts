import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { getAllReplies, getClientConfigs } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrVA(req);

    const [replies, clients] = await Promise.all([
      getAllReplies(),
      getClientConfigs(),
    ]);

    // Build a lookup: normalised Twilio number → client config
    function normPhone(raw: string): string {
      const digits = (raw || '').replace(/\D/g, '');
      return digits.slice(-10);
    }
    const twilioMap = new Map<string, { businessName: string; clientId: string }>();
    clients.forEach((c) => {
      if (c.twilioNumber) {
        twilioMap.set(normPhone(c.twilioNumber), {
          businessName: c.businessName,
          clientId: c.clientId,
        });
      }
    });

    const items = replies.map((r) => {
      // Match reply's `to` (the Twilio number the client owns) against client configs
      const match = twilioMap.get(normPhone(r.to));
      return {
        callerName: r.direction === 'in' ? r.from : r.to,
        phoneNumber: r.linkedPhone || r.from,
        channel: 'sms' as const,
        intent: r.body,
        outcome: r.status || '—',
        timestamp: r.timestamp,
        clientName: match?.businessName ?? (r.linkedPhone || r.from),
        clientId: match?.clientId ?? (r.linkedPhone || r.from),
        conversationId: r.messageSid,
        summary: r.body,
      };
    });

    return Response.json({ items });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/sms/list]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
