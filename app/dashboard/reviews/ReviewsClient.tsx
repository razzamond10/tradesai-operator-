'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

const POS_KEYWORDS = ['great','excellent','happy','good','pleased','satisfied','thanks','helpful','brilliant','amazing','fantastic','perfect','love','recommend','quick','professional','friendly','polite','clean'];
const NEG_KEYWORDS = ['bad','terrible','awful','unhappy','disappointed','slow','rude','overcharge','problem','issue','complaint','worst','never again','poor'];

function scoreSentiment(notes: string): { score: number; label: string; color: string; stars: number } {
  const n = (notes || '').toLowerCase();
  const pos = POS_KEYWORDS.filter(k => n.includes(k)).length;
  const neg = NEG_KEYWORDS.filter(k => n.includes(k)).length;
  if (neg > 0) return { score: Math.max(1, 2 - neg), label: 'Negative', color: 'var(--a4)', stars: Math.max(1, 2 - neg) };
  if (pos >= 3) return { score: 5, label: 'Excellent', color: '#047857', stars: 5 };
  if (pos >= 2) return { score: 4, label: 'Positive', color: 'var(--a3)', stars: 4 };
  if (pos >= 1) return { score: 3, label: 'Good', color: 'var(--a2)', stars: 3 };
  return { score: 3, label: 'Neutral', color: 'var(--muted)', stars: 3 };
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ fontSize: '12px', letterSpacing: '1px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < n ? '#C9A84C' : '#D8D0F0' }}>★</span>
      ))}
    </span>
  );
}

export default function ReviewsClient({ user }: { user: JWTPayload }) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setInteractions(d.interactions || []))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  // Only interactions that have notes
  const reviews = interactions
    .filter((it) => (it.notes || '').trim().length > 5)
    .map((it) => ({ ...it, sentiment: scoreSentiment(it.notes) }))
    .reverse();

  const positive = reviews.filter(r => r.sentiment.stars >= 4).length;
  const neutral  = reviews.filter(r => r.sentiment.stars === 3).length;
  const negative = reviews.filter(r => r.sentiment.stars <= 2).length;
  const avgStars = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.sentiment.stars, 0) / reviews.length).toFixed(1)
    : '0.0';

  const filtered = reviews.filter(r => {
    if (filter === 'positive') return r.sentiment.stars >= 4;
    if (filter === 'neutral')  return r.sentiment.stars === 3;
    if (filter === 'negative') return r.sentiment.stars <= 2;
    return true;
  });

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Reviews & Ratings" sub="Customer sentiment from interaction notes" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a2)', icon: '⭐', label: 'Avg Rating', val: loading ? '—' : `${avgStars} ★`, sub: 'from interaction notes' },
            { stripe: 'var(--a3)', icon: '😊', label: 'Positive', val: loading ? '—' : positive, sub: '4-5 stars' },
            { stripe: 'var(--muted)', icon: '😐', label: 'Neutral', val: loading ? '—' : neutral, sub: '3 stars' },
            { stripe: 'var(--a4)', icon: '😞', label: 'Negative', val: loading ? '—' : negative, sub: '1-2 stars' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: k.stripe }} />
              <div style={{ padding: '13px 14px' }}>
                <div style={{ fontSize: '16px', marginBottom: '6px' }}>{k.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '3px' }}>{k.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating distribution */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '14px 18px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '52px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>{avgStars}</div>
            <div style={{ marginTop: '4px' }}><Stars n={Math.round(parseFloat(avgStars))} /></div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{reviews.length} reviews</div>
          </div>
          <div>
            {[5,4,3,2,1].map((star) => {
              const count = reviews.filter(r => r.sentiment.stars === star).length;
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', minWidth: '30px', textAlign: 'right' }}>{star} ★</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--slate)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: star >= 4 ? '#C9A84C' : star === 3 ? 'var(--muted)' : 'var(--a4)', width: `${pct}%`, transition: 'width .8s ease' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink)', minWidth: '28px' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {(['all','positive','neutral','negative'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--a1)' : 'var(--slate)',
              color: filter === f ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>
              {f === 'all' ? `All (${reviews.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${f === 'positive' ? positive : f === 'neutral' ? neutral : negative})`}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading reviews…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', color: 'var(--muted)', fontSize: '12px' }}>
            No interaction notes available yet. Reviews are extracted from AI call notes.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((r, i) => {
              const { stars, label, color } = r.sentiment;
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '14px 16px',
                  border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)',
                  borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{r.callerName || 'Unknown'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <Stars n={stars} />
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: `${color}18`, color }}>{label}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{(r.timestamp || '').slice(0, 10)}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faint)', marginTop: '2px' }}>{r.intent || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink)', lineHeight: 1.6, background: 'var(--slate)', padding: '8px 10px', borderRadius: '6px' }}>
                    {r.notes}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
