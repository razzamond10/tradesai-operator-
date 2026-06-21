'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientTime } from '@/lib/hooks/useClientTime';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  clientId: string;
}

interface RawInteraction {
  callerName?: string;
  intent?: string;
  outcome?: string;
  timestamp?: string;
  channel?: string;
  phoneNumber?: string;
  summary?: string;
  conversationId?: string;
}

interface ThreadReply {
  timestamp: string;
  direction: 'in' | 'out';
  from: string;
  to: string;
  body: string;
  messageSid: string;
  status: string;
  linkedPhone: string;
}

interface AggInteraction extends RawInteraction {
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

function channelBadge(ch: string) {
  const l = (ch || '').toLowerCase();
  if (l === 'sms') return { bg: 'var(--a3b)', color: 'var(--a3)', icon: '📱' };
  if (l === 'email') return { bg: 'var(--a2b)', color: 'var(--a6)', icon: '📧' };
  if (l.includes('call') || l.includes('voice')) return { bg: 'var(--a1b)', color: 'var(--a1)', icon: '📞' };
  return { bg: 'var(--slate)', color: 'var(--muted)', icon: '💬' };
}

function outcomeBadge(o: string) {
  const l = (o || '').toLowerCase();
  if (l === 'booked') return { bg: 'var(--a3b)', color: 'var(--a3)' };
  if (l === 'hot lead') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  if (l === 'no answer' || l === 'voicemail') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

export default function VACommsClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const clockTime = useClientTime('time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interactions, setInteractions] = useState<AggInteraction[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'email' | 'call'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [thread, setThread] = useState<ThreadReply[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [threadTsMap, setThreadTsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!thread.length) { setThreadTsMap({}); return; }
    const m: Record<string, string> = {};
    thread.forEach((r) => {
      const key = r.messageSid || r.timestamp;
      if (key) m[key] = r.timestamp ? `${r.timestamp.slice(0, 10)} ${r.timestamp.slice(11, 16)}` : '';
    });
    setThreadTsMap(m);
  }, [thread]);

  async function loadThread(phone: string) {
    if (!phone) return;
    setSelectedPhone(phone);
    setThreadLoading(true);
    setThreadError('');
    try {
      const r = await fetch(`/api/va/sms/thread?phone=${encodeURIComponent(phone)}`);
      const d = await r.json();
      if (d.error) { setThreadError(d.error); setThread([]); }
      else setThread(d.replies || []);
    } catch {
      setThreadError('Failed to load thread');
    } finally {
      setThreadLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/clients');
        const d = await r.json();
        if (d.error) { setError(d.error); setLoading(false); return; }
        const clientList: ClientConfig[] = d.clients || [];
        setClients(clientList.map(c => c.businessName));

        const results = await Promise.all(
          clientList.map(async (c) => {
            try {
              const dr = await fetch(`/api/clients/${c.clientId}/data`);
              const dd = await dr.json();
              return { clientId: c.clientId, clientName: c.businessName, interactions: (dd.interactions || []) as RawInteraction[] };
            } catch {
              return { clientId: c.clientId, clientName: c.businessName, interactions: [] };
            }
          })
        );

        const all: AggInteraction[] = [];
        results.forEach(({ clientId, clientName, interactions: its }) => {
          its.forEach((it) => all.push({ ...it, clientId, clientName }));
        });
        all.sort((a, b) => {
          const ta = a.timestamp || '';
          const tb = b.timestamp || '';
          return tb > ta ? 1 : -1;
        });
        setInteractions(all);
      } catch {
        setError('Failed to load communications');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visible = interactions.filter(it => {
    if (clientFilter !== 'all' && it.clientName !== clientFilter) return false;
    if (channelFilter === 'all') return true;
    const ch = (it.channel || '').toLowerCase();
    if (channelFilter === 'sms') return ch === 'sms';
    if (channelFilter === 'email') return ch === 'email';
    if (channelFilter === 'call') return ch.includes('call') || ch.includes('voice');
    return true;
  });

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal" page="Communications" sub="All AI call interactions and messages across all clients" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
          {[
            { label: 'Total Interactions', val: loading ? '—' : interactions.length, stripe: 'var(--a1)' },
            { label: 'Booked', val: loading ? '—' : interactions.filter(i => (i.outcome || '').toLowerCase() === 'booked').length, stripe: 'var(--a3)' },
            { label: 'Hot Leads', val: loading ? '—' : interactions.filter(i => (i.outcome || '').toLowerCase() === 'hot lead').length, stripe: 'var(--a2)' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: s.stripe }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)' }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>⚠ {error}</div>}

        {/* Filters + table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginRight: '8px' }}>
              Communications {!loading && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>({visible.length})</span>}
            </div>

            {/* Channel filter */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all','sms','email','call'] as const).map((f) => (
                <button key={f} onClick={() => setChannelFilter(f)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: channelFilter === f ? 'var(--a1)' : 'var(--slate)', color: channelFilter === f ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>
                  {f === 'all' ? 'All Channels' : f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Client filter */}
            {clients.length > 0 && (
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: '1px solid var(--divider)', cursor: 'pointer', background: '#fff', color: 'var(--ink)', fontFamily: '"Inter",sans-serif', marginLeft: 'auto' }}
              >
                <option value="all">All Clients</option>
                {clients.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '36px', borderRadius: '6px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No communications found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>{['Client','Caller','Channel','Intent','Outcome','Conv ID','Time','Thread'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {visible.map((it, i) => {
                    const ch = channelBadge(it.channel || '');
                    const ob = outcomeBadge(it.outcome || '');
                    const ts = it.timestamp || '';
                    return (
                      <tr key={i} onClick={(() => {
                          const hasKey = !!(it.conversationId || it.timestamp);
                          if (!hasKey) return undefined;
                          const key = it.conversationId || `${it.clientId}__${it.timestamp || ''}`;
                          return () => router.push(`/va/communications/${encodeURIComponent(key)}`);
                        })()} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: !!(it.conversationId || it.timestamp) ? 'pointer' : 'default' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--a1)', fontSize: '10px', whiteSpace: 'nowrap' }}>{it.clientName}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{it.callerName || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: ch.bg, color: ch.color, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            {ch.icon} {it.channel || 'Call'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.intent || '—'}</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: ob.bg, color: ob.color }}>{it.outcome || '—'}</span></td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{it.conversationId || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{ts ? `${ts.slice(0,10)} ${ts.slice(11,16)}` : '—'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {(it.channel || '').toLowerCase() === 'sms' && it.phoneNumber ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); loadThread(it.phoneNumber!); }}
                              style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '5px', border: '1px solid var(--divider)', background: selectedPhone === it.phoneNumber ? 'var(--a1)' : '#fff', color: selectedPhone === it.phoneNumber ? '#fff' : 'var(--a1)', cursor: 'pointer', fontFamily: '"Inter",sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              💬 Thread
                            </button>
                          ) : <span style={{ color: 'var(--faint)', fontSize: '10px' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SMS Reply Thread panel */}
        {selectedPhone && (
          <div style={{ marginTop: '14px', background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>💬 SMS Thread</span>
              <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{selectedPhone}</span>
              <button
                onClick={() => { setSelectedPhone(''); setThread([]); setThreadError(''); }}
                style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 10px', borderRadius: '5px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--muted)', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}
              >✕ Close</button>
            </div>
            <div style={{ padding: '14px', maxHeight: '440px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {threadLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', padding: '24px' }}>Loading thread…</div>
              ) : threadError ? (
                <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px' }}>⚠ {threadError}</div>
              ) : thread.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', padding: '24px' }}>No messages yet for this number</div>
              ) : thread.map((msg) => {
                const isOut = msg.direction === 'out';
                const tsKey = msg.messageSid || msg.timestamp;
                return (
                  <div key={tsKey} style={{ display: 'flex', flexDirection: 'column', alignItems: isOut ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '72%', padding: '8px 12px', borderRadius: isOut ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isOut ? 'var(--a1)' : 'var(--slate)', color: isOut ? '#fff' : 'var(--ink)', fontSize: '12px', lineHeight: '1.55', wordBreak: 'break-word' }}>
                      {msg.body}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--faint)', marginTop: '3px', fontFamily: '"IBM Plex Mono",monospace' }}>
                      {threadTsMap[tsKey] || ''}{isOut ? ` · You → ${msg.to}` : ` · ${msg.from}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{clockTime}</div>
        </div>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
