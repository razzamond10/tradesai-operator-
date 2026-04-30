'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Prefs = { essential: true; functional: boolean; analytics: boolean };

const STORAGE_KEY = 'tao_cookie_consent';

function getStored(): { choice: 'accepted' | 'rejected'; prefs: Prefs } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ essential: true, functional: false, analytics: false });

  useEffect(() => {
    if (!getStored()) setVisible(true);
  }, []);

  function save(choice: 'accepted' | 'rejected', customPrefs?: Prefs) {
    const stored = { choice, prefs: customPrefs ?? prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setVisible(false);
    setShowCustomise(false);
  }

  function acceptAll() {
    save('accepted', { essential: true, functional: true, analytics: false });
  }

  function rejectNonEssential() {
    save('rejected', { essential: true, functional: false, analytics: false });
  }

  function saveCustom() {
    save(prefs.functional || prefs.analytics ? 'accepted' : 'rejected', prefs);
  }

  if (!visible) return null;

  const bannerStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
    background: 'rgba(10,5,25,0.97)', backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(0,212,255,0.2)',
    padding: '1rem 1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#ddd', fontSize: '0.85rem',
  };

  const btnBase: React.CSSProperties = {
    padding: '0.55rem 1.1rem', borderRadius: '6px', fontSize: '0.82rem',
    fontWeight: '600', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* Main banner */}
      <div style={bannerStyle}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, flex: 1, minWidth: '260px', lineHeight: 1.5 }}>
            We use essential cookies to keep you signed in. We don&apos;t use analytics cookies.{' '}
            <Link href="/cookies" style={{ color: '#00d4ff' }}>Cookie Policy</Link>
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexShrink: 0 }}>
            <button onClick={() => setShowCustomise(true)} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: '#aaa' }}>
              Customise
            </button>
            <button onClick={rejectNonEssential} style={{ ...btnBase, background: 'rgba(255,255,255,0.08)', color: '#ccc' }}>
              Reject Non-Essential
            </button>
            <button onClick={acceptAll} style={{ ...btnBase, background: 'linear-gradient(135deg,#00d4ff,#0099cc)', color: '#000' }}>
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Customise modal */}
      {showCustomise && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f0a20', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '12px', padding: '2rem', maxWidth: '480px', width: '100%', color: '#ddd', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <h2 style={{ color: '#00d4ff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Manage Cookie Preferences</h2>

            {/* Essential */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>Essential</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>Authentication token (tradesai_token). Always required for the portal to function.</p>
              </div>
              <span style={{ marginLeft: '1rem', padding: '0.25rem 0.65rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>Always on</span>
            </div>

            {/* Functional */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>Functional</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>Theme and preference cookies. No functional cookies are currently set.</p>
              </div>
              <label style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={e => setPrefs({ ...prefs, functional: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#00d4ff' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{prefs.functional ? 'On' : 'Off'}</span>
              </label>
            </div>

            {/* Analytics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>Analytics</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>We do not currently use analytics cookies. If this changes, you will be re-prompted.</p>
              </div>
              <span style={{ marginLeft: '1rem', padding: '0.25rem 0.65rem', background: 'rgba(100,100,100,0.2)', color: '#666', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>Not used</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCustomise(false)} style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' }}>
                Cancel
              </button>
              <button onClick={saveCustom} style={{ ...btnBase, background: 'linear-gradient(135deg,#00d4ff,#0099cc)', color: '#000' }}>
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
