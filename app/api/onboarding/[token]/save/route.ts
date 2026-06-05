import { NextRequest, NextResponse } from 'next/server';
import { saveOnboardingProgress } from '@/lib/sheets';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  // 1. Parse body — fail-open on bad JSON or wrong shape.
  let currentStep: number;
  let answers: Record<string, unknown>;
  try {
    const body = await req.json();
    // Clamp step to valid range; NaN → reject below.
    currentStep = typeof body.currentStep === 'number'
      ? Math.max(1, Math.min(5, Math.round(body.currentStep)))
      : NaN;
    answers =
      body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers)
        ? (body.answers as Record<string, unknown>)
        : {};
    if (isNaN(currentStep)) return NextResponse.json({ ok: false });
  } catch {
    return NextResponse.json({ ok: false });
  }

  // 2. Race the sheet write against 8 s (Vercel Hobby 10 s limit).
  //    saveOnboardingProgress reads only col A to find the token row —
  //    if the row is missing it returns { ok: false, reason: 'not_found' }
  //    without writing, which serves as the existence guard.
  //    No setImmediate (Rule 94/117).
  try {
    const result = await Promise.race<{ ok: boolean; reason?: string }>([
      saveOnboardingProgress(params.token, currentStep, answers),
      new Promise<{ ok: boolean }>((resolve) =>
        setTimeout(() => resolve({ ok: false }), 8000)
      ),
    ]);
    return NextResponse.json({ ok: result.ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
