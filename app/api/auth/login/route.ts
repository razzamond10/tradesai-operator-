import { NextRequest, NextResponse } from 'next/server';
import { validateUser, signJWT } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await validateUser(email.toLowerCase().trim(), password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJWT(user);

    const response = NextResponse.json({ ok: true, role: user.role, name: user.name });
    response.cookies.set('tradesai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
