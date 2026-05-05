'use client';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function ResetToast({ onToast }: { onToast: (msg: string) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get('reset') === '1') {
      onToast('Password reset successfully. Please sign in with your new password.');
    }
  }, [params, onToast]);
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Role-based redirect
      if (data.role === 'admin') router.push('/admin');
      else if (data.role === 'va') router.push('/va');
      else router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D0620 0%, #1A0A3C 50%, #0D0620 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: '1rem',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        borderRadius: '50%', top: '-100px', right: '-100px', pointerEvents: 'none', filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'fixed', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        borderRadius: '50%', bottom: '-80px', left: '-80px', pointerEvents: 'none', filter: 'blur(60px)',
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.jpg" alt="TradesAI Operator" style={{
            height: '56px', width: 'auto', borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(201,168,76,0.2)', marginBottom: '1rem',
          }} />
          <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.25rem', letterSpacing: '-0.5px' }}>
            Trades <span style={{ color: '#C9A84C' }}>Ai</span> Operator
          </h1>
          <p style={{ color: '#888', fontSize: '0.8rem', margin: 0, letterSpacing: '0.5px' }}>SIGN IN</p>
        </div>

        <Suspense fallback={null}>
          <ResetToast onToast={setToast} />
        </Suspense>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px',
                color: '#fff', fontSize: '0.95rem', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.25)')}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', color: '#ccc', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px',
                color: '#fff', fontSize: '0.95rem', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(201,168,76,0.25)')}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#C9A84C', width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <span style={{ color: '#888', fontSize: '0.8rem' }}>Remember me for 30 days</span>
            </label>
            <a href="/forgot-password" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>

          {toast && (
            <div style={{
              background: 'rgba(80,200,120,0.1)',
              border: '1px solid rgba(80,200,120,0.3)',
              borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1rem',
              color: '#6ee7a0', fontSize: '0.85rem',
            }}>
              {toast}
            </div>
          )}

          {error && (
            <div style={{
              background: error === 'paused' ? 'rgba(201,168,76,0.12)' : 'rgba(220,50,50,0.12)',
              border: error === 'paused' ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(220,50,50,0.3)',
              borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1rem',
              color: error === 'paused' ? '#C9A84C' : '#ff8080', fontSize: '0.85rem',
            }}>
              {error === 'paused'
                ? 'Your account is temporarily paused. Please contact support at admin@tradesaioperator.uk.'
                : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', background: loading ? '#7a6430' : 'linear-gradient(135deg, #C9A84C 0%, #a8853a 100%)',
              color: '#0D0620', border: 'none', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#555', fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: 0 }}>
          TradesAI Operator &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
