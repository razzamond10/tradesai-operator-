'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const ALL_ACTIONS = [
  'login.success', 'login.failed', 'logout',
  'password.reset.requested', 'password.reset.completed', 'password.changed',
  'email.change.requested', 'email.change.verified',
  'account.paused', 'account.resumed', 'tier.changed',
  'gdpr.export', 'gdpr.delete',
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  'login.success':              { bg: '#ECFDF5', color: '#0A7455' },
  'login.failed':               { bg: '#FFF0F2', color: '#C01830' },
  'logout':                     { bg: '#F4F4F8', color: '#555' },
  'password.reset.requested':   { bg: '#EFF6FF', color: '#1D4ED8' },
  'password.reset.completed':   { bg: '#EFF6FF', color: '#1D4ED8' },
  'password.changed':           { bg: '#EFF6FF', color: '#1D4ED8' },
  'email.change.requested':     { bg: '#F5F3FF', color: '#6D28D9' },
  'email.change.verified':      { bg: '#F5F3FF', color: '#6D28D9' },
  'account.paused':             { bg: '#FFFBEB', color: '#B45309' },
  'account.resumed':            { bg: '#ECFDF5', color: '#0A7455' },
  'tier.changed':               { bg: '#EEF2FF', color: '#4338CA' },
  'gdpr.export':                { bg: '#FFF7ED', color: '#C2410C' },
  'gdpr.delete':                { bg: '#FFF0F2', color: '#C01830' },
};

interface AuditEvent {
  timestamp: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target: string;
  client_id: string;
  ip: string;
  user_agent: string;
  result: string;
  metadata: string;
}

const PAGE_SIZE = 50;

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}
function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTs(iso: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toTimeString().slice(0, 8);
  } catch { return iso; }
}

function downloadCSV(events: AuditEvent[]) {
  const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Client ID', 'IP', 'Result', 'Metadata'];
  const rows = events.map(e => [
    e.timestamp, e.actor_email, e.actor_role, e.action, e.target,
    e.client_id, e.ip, e.result, e.metadata,
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditViewerClient({ adminName }: { adminName: string }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [selectedRow, setSelectedRow] = useState<AuditEvent | null>(null);

  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const fetchEvents = useCallback(async (params: { actor: string; action: string; from: string; to: string }) => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (params.actor)  qs.set('actor', params.actor);
      if (params.action) qs.set('action', params.action);
      if (params.from)   qs.set('from', params.from);
      if (params.to)     qs.set('to', params.to);
      qs.set('limit', '500');
      const res = await fetch(`/api/admin/audit?${qs}`);
      if (!res.ok) throw new Error('Failed to load audit log');
      const data = await res.json();
      setEvents(data.events || []);
      setPage(0);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents({ actor, action, from, to });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    fetchEvents({ actor, action, from, to });
  }

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pageEvents = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const initials = adminName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F8', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(90deg,#1A0A3C 0%,#26145A 100%)',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        borderBottom: '2px solid #C9A84C',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.jpg" alt="logo" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px' }} />
            <div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>TradesAI Operator</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>← Portfolio</div>
            </div>
          </Link>
        </div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 800, color: '#C9A84C', letterSpacing: '.5px' }}>
          🛡 AUDIT LOG
        </div>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#C9A84C,#E8C96A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 800, color: '#1A0A3C',
          fontFamily: '"Inter Tight",sans-serif',
        }}>{initials}</div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 28px 48px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: '#1A0A3C', marginBottom: '3px' }}>
            Audit Log
          </div>
          <div style={{ fontSize: '12px', color: '#7468A0' }}>
            Tamper-evident trail of all security-sensitive events
          </div>
        </div>

        {/* Filter bar */}
        <form onSubmit={handleApply} style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #D8D0F0',
          boxShadow: '0 2px 8px rgba(26,10,60,0.06)', padding: '16px 20px',
          marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
        }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px' }}>Actor email</label>
            <input
              type="text"
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="filter by email…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #D8D0F0', fontSize: '12px', outline: 'none', background: '#FAFAFC', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px' }}>Action</label>
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #D8D0F0', fontSize: '12px', outline: 'none', background: '#FAFAFC', boxSizing: 'border-box' }}
            >
              <option value="">All actions</option>
              {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 1 140px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px' }}>From</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #D8D0F0', fontSize: '12px', outline: 'none', background: '#FAFAFC', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '0 1 140px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px' }}>To</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #D8D0F0', fontSize: '12px', outline: 'none', background: '#FAFAFC', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={{ padding: '7px 18px', background: '#3D1FA8', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => downloadCSV(events)}
              disabled={events.length === 0}
              style={{ padding: '7px 18px', background: events.length === 0 ? '#D8D0F0' : '#0A7455', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: events.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Export CSV
            </button>
          </div>
        </form>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7468A0', fontSize: '13px' }}>Loading audit events…</div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#C01830', fontSize: '13px' }}>{error}</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9A90C0', fontSize: '13px' }}>No events match your filters.</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F7F5FF', borderBottom: '2px solid #D8D0F0' }}>
                      {['Timestamp', 'Actor', 'Action', 'Target', 'IP', 'Result'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageEvents.map((ev, i) => {
                      const actionColor = ACTION_COLORS[ev.action] || { bg: '#F4F4F8', color: '#555' };
                      return (
                        <tr
                          key={i}
                          onClick={() => setSelectedRow(ev)}
                          style={{ borderBottom: '1px solid #EAEAF4', cursor: 'pointer', transition: 'background .1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F7F5FF')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <td style={{ padding: '10px 14px', fontFamily: '"IBM Plex Mono",monospace', color: '#1A0A3C', whiteSpace: 'nowrap' }}>{fmtTs(ev.timestamp)}</td>
                          <td style={{ padding: '10px 14px', color: '#3D1FA8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.actor_email}</td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: actionColor.bg, color: actionColor.color }}>
                              {ev.action}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#555', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.target}</td>
                          <td style={{ padding: '10px 14px', fontFamily: '"IBM Plex Mono",monospace', color: '#888', whiteSpace: 'nowrap' }}>{ev.ip}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                              fontSize: '10px', fontWeight: 700,
                              background: ev.result === 'success' ? '#ECFDF5' : '#FFF0F2',
                              color: ev.result === 'success' ? '#0A7455' : '#C01830',
                            }}>
                              {ev.result}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #EAEAF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#7468A0' }}>
                    Page {page + 1} of {totalPages} ({events.length} events)
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #D8D0F0', background: page === 0 ? '#F4F4F8' : '#fff', color: page === 0 ? '#B0A8D0' : '#3D1FA8', fontSize: '11px', fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #D8D0F0', background: page >= totalPages - 1 ? '#F4F4F8' : '#fff', color: page >= totalPages - 1 ? '#B0A8D0' : '#3D1FA8', fontSize: '11px', fontWeight: 600, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Row count when loaded */}
        {!loading && !error && events.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#9A90C0', textAlign: 'right' }}>
            Showing {Math.min(PAGE_SIZE, pageEvents.length)} of {events.length} events · click any row to view full details
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedRow && (
        <div
          onClick={() => setSelectedRow(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,4,35,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '14px', border: '1px solid #D8D0F0',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EAEAF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 800, color: '#1A0A3C' }}>Event Detail</div>
                <div style={{ fontSize: '11px', color: '#7468A0', marginTop: '2px', fontFamily: '"IBM Plex Mono",monospace' }}>{fmtTs(selectedRow.timestamp)}</div>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9A90C0', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {[
                ['Actor',    selectedRow.actor_email],
                ['Role',     selectedRow.actor_role],
                ['Action',   selectedRow.action],
                ['Target',   selectedRow.target],
                ['Client ID', selectedRow.client_id || '—'],
                ['IP',       selectedRow.ip],
                ['Result',   selectedRow.result],
                ['User Agent', selectedRow.user_agent],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '12px' }}>
                  <span style={{ minWidth: '90px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '.4px', paddingTop: '1px' }}>{k}</span>
                  <span style={{ color: '#1A0A3C', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
              {selectedRow.metadata && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '8px' }}>Metadata</div>
                  <pre style={{
                    background: '#F7F5FF', border: '1px solid #D8D0F0', borderRadius: '8px',
                    padding: '12px', fontSize: '11px', fontFamily: '"IBM Plex Mono",monospace',
                    color: '#1A0A3C', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {(() => { try { return JSON.stringify(JSON.parse(selectedRow.metadata), null, 2); } catch { return selectedRow.metadata; } })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
