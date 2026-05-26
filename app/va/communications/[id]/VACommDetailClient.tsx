'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  clientId: string;
}

interface RawInteraction {
  businessName?: string;
  timestamp?: string;
  callerName?: string;
  phone?: string;
  intent?: string;
  outcome?: string;
  notes?: string;
  conversationId?: string;
}

interface InteractionDetail extends RawInteraction {
  clientName: string;
  clientId: string;
}

function ReadOnlyBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', background: '#EDE8FF', border: '1px solid rgba(61,31,168,0.15)' }}>
      <span style={{ fontSize: '13px' }}>👁</span>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#3D1FA8' }}>VA View — Read-only. You can view all client dashboards but cannot modify data or billing.</div>
      <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(61,31,168,0.12)', color: '#3D1FA8' }}>READ-ONLY</span>
    </div>
  );
}

function outcomeBadge(o: string) {
  const l = (o || '').toLowerCase();
  if (l === 'booked') return { bg: 'var(--a3b)', color: 'var(--a3)' };
  if (l === 'hot lead') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  if (l === 'no answer' || l === 'voicemail') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

export default function VACommDetailClient({ user, id }: { user: JWTPayload; id: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<InteractionDetail | null>(null);
  const [toast, setToast] = useState('');

  const conversationId = decodeURIComponent(id);

  useEffect(() => {
    if (!conversationId) {
      setError('Invalid conversation ID');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const cr = await fetch('/api/clients');
        const cd = await cr.json();
        if (cd.error) { setError(cd.error); setLoading(false); return; }
        const clients: ClientConfig[] = cd.clients || [];

        let found: InteractionDetail | null = null;
        for (const c of clients) {
          try {
            const dr = await fetch(`/api/clients/${encodeURIComponent(c.clientId)}/data`);
            const dd = await dr.json();
            const interactions: RawInteraction[] = dd.interactions || [];
            const match = interactions.find(r => (r.conversationId || '') === conversationId);
            if (match) {
              found = {
                ...match,
                clientId: c.clientId,
                clientName: dd.config?.businessName || c.businessName || 'Unknown client',
              };
              break;
            }
          } catch {
            // skip clients that fail to load
          }
        }

        if (!found) {
          setError('Interaction not found');
          setLoading(false);
          return;
        }

        setRecord(found);
      } catch {
        setError('Failed to load interaction');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const ob = record ? outcomeBadge(record.outcome || '') : null;
  const ts = record?.timestamp || '';

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal / Communications" page="Interaction Detail" sub={record ? `${record.clientName} — ${record.callerName || 'Unknown caller'}` : 'Loading...'} />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        <div style={{ marginBottom: '16px' }}>
          <Link href="/va/communications" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--a1)', textDecoration: 'none' }}>
            ← Back to all communications
          </Link>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            Loading interaction details...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && !error && record && (
          <>
            {/* Header card */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '3px', background: ob?.color || 'var(--a1)' }} />
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: 'var(--ink)', marginBottom: '4px' }}>
                    {record.callerName || 'Unknown caller'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {record.clientName} <span style={{ color: 'var(--faint)', margin: '0 6px' }}>•</span> {ts ? `${ts.slice(0,10)} ${ts.slice(11,16)}` : '—'}
                  </div>
                </div>
                {ob && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: ob.bg, color: ob.color }}>{record.outcome || '—'}</span>}
              </div>
            </div>

            {/* Details grid */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Details</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Caller name" value={record.callerName || '—'} />
                <Field label="Phone" value={record.phone || '—'} tel={record.phone} />
                <Field label="Intent" value={record.intent || '—'} />
                <Field label="Outcome" value={record.outcome || '—'} />
                <Field label="Timestamp" value={ts || '—'} mono />
                <Field label="Client" value={record.clientName} />
                <Field label="Conversation ID" value={record.conversationId || '—'} mono />
              </div>
              {record.notes && (
                <div style={{ padding: '0 18px 16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '4px' }}>Notes</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', wordBreak: 'break-word' }}>{record.notes}</div>
                </div>
              )}
            </div>

            {/* Internal notes placeholder */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Internal notes</div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'var(--slate)', color: 'var(--muted)', border: '1px solid var(--divider)' }}>PHASE 4</span>
              </div>
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>
                Notes timeline will load here in Phase 4.
              </div>
            </div>

            {/* Action buttons — Phase 4 wiring */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* TODO Phase 4: POST /api/va/interaction/{id}/note with { clientId: record.clientId, conversationId, note } */}
              <ActionButton label="Add note" onClick={() => showToast('Wiring in Phase 4 — note composer coming')} primary />
              {/* TODO Phase 4: follow-up workflow */}
              <ActionButton label="Follow-up" onClick={() => showToast('Wiring in Phase 4 — follow-up endpoint coming')} />
            </div>
          </>
        )}

        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '10px 16px', background: 'var(--ink)', color: '#fff', borderRadius: '8px', fontSize: '11px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
            {toast}
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </PortalShell>
  );
}

function Field({ label, value, mono, tel }: { label: string; value: string; mono?: boolean; tel?: string }) {
  return (
    <div>
      <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      {tel ? (
        <a href={`tel:${tel}`} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--a1)', textDecoration: 'none', fontFamily: '"IBM Plex Mono",monospace' }}>{value}</a>
      ) : (
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', fontFamily: mono ? '"IBM Plex Mono",monospace' : 'inherit', wordBreak: 'break-word' }}>{value}</div>
      )}
    </div>
  );
}

function ActionButton({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 700,
        border: primary ? 'none' : '1px solid var(--divider)',
        cursor: 'pointer',
        background: primary ? 'var(--a1)' : '#fff',
        color: primary ? '#fff' : 'var(--ink)',
        fontFamily: '"Inter",sans-serif',
      }}
    >
      {label}
    </button>
  );
}
