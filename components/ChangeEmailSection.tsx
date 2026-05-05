'use client';
import { useState } from 'react';

export default function ChangeEmailSection({ currentEmail }: { currentEmail: string }) {
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Please enter a new email address.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (trimmed === currentEmail.toLowerCase()) {
      setMessage({ type: 'error', text: 'New email must be different from your current email.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: trimmed }),
      });

      if (res.status === 429) {
        setMessage({ type: 'error', text: 'Too many change requests. Please wait an hour.' });
        return;
      }
      if (res.status === 409) {
        setMessage({ type: 'error', text: 'That email is already taken.' });
        return;
      }
      if (!res.ok) {
        setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        return;
      }

      setMessage({
        type: 'success',
        text: `Verification link sent to ${trimmed}. Click the link to confirm the change. You'll be logged out automatically.`,
      });
      setShowForm(false);
      setNewEmail('');
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#3D1FA8', fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
        Email Address
      </h3>

      {message && (
        <div style={{
          background: message.type === 'success' ? '#F0FFF6' : '#FFF0F2',
          border: `1px solid ${message.type === 'success' ? '#A0D8B4' : '#F5C0C8'}`,
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          marginBottom: '1rem',
          color: message.type === 'success' ? '#1A6E3C' : '#C01830',
          fontSize: '0.875rem',
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        padding: '1rem 1.25rem',
        background: '#FAFAFC',
        border: '1px solid #D8D0F0',
        borderRadius: '10px',
        marginBottom: '0.75rem',
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>{currentEmail}</p>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => { setShowForm(true); setMessage(null); }}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'transparent',
            border: '1px solid #D8D0F0',
            borderRadius: '8px',
            color: '#3D1FA8',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Change email
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#555',
              marginBottom: '0.4rem',
            }}>
              NEW EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              autoFocus
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                background: '#FAFAFC',
                border: '1px solid #D8D0F0',
                borderRadius: '8px',
                color: '#111',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3D1FA8')}
              onBlur={(e) => (e.target.style.borderColor = '#D8D0F0')}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.55rem 1.25rem',
                background: loading ? '#9b8ec4' : '#3D1FA8',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending…' : 'Send verification'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewEmail(''); setMessage(null); }}
              disabled={loading}
              style={{
                padding: '0.55rem 1.25rem',
                background: 'transparent',
                border: '1px solid #D8D0F0',
                borderRadius: '8px',
                color: '#555',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
