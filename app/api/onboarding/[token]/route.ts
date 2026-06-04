import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/onboarding/tokens';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const result = await validateToken(params.token);
  return NextResponse.json(result);
}
