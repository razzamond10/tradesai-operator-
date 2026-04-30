'use client';
import Link from 'next/link';

export default function Footer() {
  function reopenBanner() {
    localStorage.removeItem('tao_cookie_consent');
    window.location.reload();
  }

  return (
    <footer style={{
      borderTop: '1px solid rgba(100,180,255,0.12)',
      padding: '2rem',
      textAlign: 'center',
      color: '#555',
      fontSize: '0.8rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <Link href="/privacy" style={{ color: '#00d4ff', textDecoration: 'none' }}>Privacy Policy</Link>
        <span style={{ color: '#333' }}>|</span>
        <Link href="/terms" style={{ color: '#00d4ff', textDecoration: 'none' }}>Terms of Service</Link>
        <span style={{ color: '#333' }}>|</span>
        <Link href="/cookies" style={{ color: '#00d4ff', textDecoration: 'none' }}>Cookie Policy</Link>
        <span style={{ color: '#333' }}>|</span>
        <button
          onClick={reopenBanner}
          style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.8rem', padding: 0, fontFamily: 'inherit' }}
        >
          Manage Cookies
        </button>
      </div>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} TradesAI Operator Ltd — Companies House 17114582 — 5 Brayford Square, London E1 0SG
      </p>
    </footer>
  );
}
