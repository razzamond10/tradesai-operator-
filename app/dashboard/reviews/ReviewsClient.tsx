'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import type { JWTPayload } from '@/lib/auth';

export default function ReviewsClient({ user }: { user: JWTPayload }) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setInteractions(d.interactions || []))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  // Simulate review sentiment from interaction notes
  const positiveKeywords = ['great', 'excellent', 'happy', 'good', 'pleased', 'satisfied', 'thanks', 'helpful'];
  const reviews = interactions
    .filter((it) => it.notes && it.notes.trim().length > 0)
    .map((it) => {
      const notes = (it.notes || '').toLowerCase();
      const positive = positiveKeywords.some((k) => notes.includes(k));
      return { ...it, sentiment: positive ? 'positive' : 'neutral' };
    });

  const avgRating = reviews.length > 0
    ? ((reviews.filter((r) => r.sentiment === 'positive').length / reviews.length) * 5).toFixed(1)
    : 'N/A';

  return (
    <PortalShell role={user.role} name={user.name} clientId={user.clientId}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem' }}>Reviews & Feedback</h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>Customer sentiment from interaction notes</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Avg Rating', value: avgRating === 'N/A' ? avgRating : `${avgRating} ★`, sub: 'Estimated from notes' },
          { label: 'Total Reviews', value: reviews.length, sub: 'With notes' },
          { label: 'Positive', value: reviews.filter((r) => r.sentiment === 'positive').length, sub: 'Happy customers' },
        ].map((card) => (
          <div key={card.label} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{card.label}</p>
            <p style={{ color: '#1A0A3C', fontSize: '1.8rem', fontWeight: '800', margin: '0', lineHeight: 1 }}>{card.value}</p>
            <p style={{ color: '#aaa', fontSize: '0.75rem', margin: '0.35rem 0 0' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Interaction Notes</h3>
        {loading ? (
          <p style={{ color: '#aaa' }}>Loading…</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: '#aaa' }}>No interaction notes available yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.slice(0, 20).map((r, i) => (
              <div key={i} style={{
                padding: '1rem 1.25rem', borderRadius: '12px',
                background: r.sentiment === 'positive' ? 'rgba(22,163,74,0.04)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${r.sentiment === 'positive' ? 'rgba(22,163,74,0.15)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#1A0A3C', fontSize: '0.875rem' }}>{r.callerName || 'Unknown'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{fmt(r.timestamp)}</span>
                </div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', lineHeight: '1.5' }}>{r.notes}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  {r.sentiment === 'positive'
                    ? <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>★★★★★ Positive</span>
                    : <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: '600' }}>★★★☆☆ Neutral</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function fmt(ts: string) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ts.slice(0, 10); }
}
