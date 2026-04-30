'use client';

export default function ManageCookiesButton() {
  function handleClick() {
    localStorage.removeItem('tao_cookie_consent');
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'rgba(0,212,255,0.1)',
        border: '1px solid rgba(0,212,255,0.35)',
        color: '#00d4ff',
        padding: '0.6rem 1.25rem',
        borderRadius: '6px',
        fontSize: '0.88rem',
        fontWeight: '600',
        cursor: 'pointer',
        letterSpacing: '0.3px',
      }}
    >
      Manage Cookie Preferences
    </button>
  );
}
