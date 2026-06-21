import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { getRepliesByPhone } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrVA(req);
    const phone = new URL(req.url).searchParams.get('phone') || '';
    if (!phone) return Response.json({ error: 'phone required' }, { status: 400 });
    const replies = await getRepliesByPhone(phone);
    return Response.json({ replies });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/sms/thread]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
