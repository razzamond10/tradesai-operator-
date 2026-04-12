import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ user: null });

  const user = await verifyJWT(token);
  return NextResponse.json({ user });
}
