'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

const OUTCOME_COLORS: Record<string, { bg: string; color: string }> = {
  booked:   { bg: 'var(--a3b)', color: 'var(--a3)' },
  hot:      { bg: '#FEF0E7', color: '#D94F00' },
  callback: { bg: 'var(--a2b)', color: 'var(--a6)' },
  cold:     { bg: 'var(--slate)', color: 'var(--muted)' },
  emergency:{ bg: 'var(--a4b)', color: 'var(--a4)' },
};

function outcomeBadge(outcome: string) {
  const key = (outcome || '').toLowerCase();
  return OUTCOME_COLORS[key] || { bg: 'var(--slate)', color: 'var(--muted)' };
}

export default function CommsClient({ user }: { user: JWTPayload }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const interactions: any[] = data?.interactions || [];

  const outcomes = ['all', ...Array.from(new Set(interactions.map(i => i.outcome).filter(Boolean)))];

  const filtered = interactions
    .filter(i =>
      (filter === 'all' || (i.outcome || '').toLowerCase() === filter.toLowerCase()) &&
      (!search ||
        (i.callerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.phone || '').includes(search) ||
        (i.intent || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.notes || '').toLowerCase().includes(search.toLowerCase()))
    )
    .reverse(); // most recent first

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Communications" sub="All call interactions" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Interactions Log</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{interactions.length} total interactions captured by AI</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calls…"
              style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '12px', outline: 'none', width: '200px', background: '#fff', color: 'var(--ink)', fontFamily: '"Inter",sans-serif' }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Total Calls', val: interactions.length, stripe: 'var(--a1)' },
            { label: 'Booked', val: interactions.filter(i=>(i.outcome||'').toLowerCase()==='booked').length, stripe: 'var(--a3)' },
            { label: 'Hot Leads', val: interactions.filter(i=>(i.outcome||'').toLowerCase()==='hot').length, stripe: '#D94F00' },
            { label: 'Callbacks Due', val: interactions.filter(i=>(i.outcome||'').toLowerCase()==='callback').length, stripe: 'var(--a2)' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: s.stripe }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: 'var(--ink)' }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Outcome filter pills */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {outcomes.map((o) => (
            <button key={o} onClick={() => setFilter(o)} style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: filter === o ? 'var(--a1)' : 'var(--slate)',
              color: filter === o ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>{o === 'all' ? `All (${interactions.length})` : o}</button>
          ))}
        </div>

        {/* Main content: table + detail panel */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading interactions…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No interactions found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>
                    {['Time','Caller','Phone','Intent','Outcome','Notes'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it, i) => {
                    const ob = outcomeBadge(it.outcome);
                    const isSelected = selected === it;
                    return (
                      <tr key={i} onClick={() => setSelected(isSelected ? null : it)} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', background: isSelected ? 'var(--a1b)' : undefined, transition: 'background .1s' }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--slate)'; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = ''; }}>
                        <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{(it.timestamp || '').slice(0, 16).replace('T', ' ')}</td>
                        <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--ink)' }}>{it.callerName || '—'}</td>
                        <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{it.phone || '—'}</td>
                        <td style={{ padding: '7px 12px', color: 'var(--ink2)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.intent || '—'}</td>
                        <td style={{ padding: '7px 12px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: ob.bg, color: ob.color }}>{it.outcome || '—'}</span>
                        </td>
                        <td style={{ padding: '7px 12px', color: 'var(--muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '16px', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Call Detail</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', lineHeight: 1 }}>×</button>
              </div>
              {[
                { label: 'Caller', value: selected.callerName || '—' },
                { label: 'Phone', value: selected.phone || '—', mono: true },
                { label: 'Time', value: (selected.timestamp || '—').replace('T', ' ').slice(0, 19), mono: true },
                { label: 'Intent', value: selected.intent || '—' },
                { label: 'Outcome', value: selected.outcome || '—', badge: true },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>{row.label}</div>
                  {row.badge ? (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: outcomeBadge(row.value).bg, color: outcomeBadge(row.value).color }}>{row.value}</span>
                  ) : (
                    <div style={{ fontSize: '12px', fontWeight: row.label === 'Caller' ? 700 : 400, color: 'var(--ink)', fontFamily: row.mono ? '"IBM Plex Mono",monospace' : '"Inter",sans-serif' }}>{row.value}</div>
                  )}
                </div>
              ))}
              {selected.notes && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '4px' }}>Notes</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink)', lineHeight: 1.5, background: 'var(--slate)', padding: '8px 10px', borderRadius: '6px' }}>{selected.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </PortalShell>
  );
}
