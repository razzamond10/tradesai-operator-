'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

const STAGES = [
  { key: 'new',        label: 'New Lead',    color: '#3D1FA8', bg: '#EDE8FF' },
  { key: 'quoted',     label: 'Quoted',      color: '#9A6200', bg: '#FEF8EC' },
  { key: 'booked',     label: 'Booked',      color: '#0A7455', bg: '#E6FAF4' },
  { key: 'inprogress', label: 'In Progress', color: '#6B3FD0', bg: '#F0EAFF' },
  { key: 'completed',  label: 'Complete',    color: '#047857', bg: '#D1FAE5' },
  { key: 'invoiced',   label: 'Invoiced',    color: '#C9A84C', bg: '#FEF8EC' },
  { key: 'paid',       label: 'Paid',        color: '#065F46', bg: '#ECFDF5' },
];

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[^0-9.]/g, '') || '0');
  return isNaN(n) ? 0 : n;
}

function getInteractionStage(outcome: string): string {
  const o = (outcome || '').toLowerCase();
  if (o === 'booked') return 'booked';
  if (o === 'hot' || o === 'quote') return 'quoted';
  if (o === 'callback' || o === 'general call') return 'new';
  return 'new';
}

function getBookingStage(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'paid';
  if (s === 'invoiced') return 'invoiced';
  if (s === 'completed') return 'completed';
  if (s === 'in progress') return 'inprogress';
  if (s === 'confirmed' || s === 'booked') return 'booked';
  if (s === 'quoted') return 'quoted';
  return 'new';
}

export default function PipelineClient({ user }: { user: JWTPayload }) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'funnel'>('kanban');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => { setInteractions(d.interactions || []); setBookings(d.bookings || []); })
      .finally(() => setLoading(false));
  }, [user.clientId]);

  // Build pipeline items
  const leadItems = interactions.map((it) => ({
    id: `i-${it.timestamp}`,
    name: it.callerName || 'Unknown',
    sub: it.intent || it.notes || '—',
    phone: it.phone || '',
    stage: getInteractionStage(it.outcome),
    type: 'lead' as const,
    value: 0,
    time: it.timestamp || '',
    outcome: it.outcome || '',
  }));

  const bookingItems = bookings.map((b) => ({
    id: `b-${b.timestamp}`,
    name: b.customerName || 'Unknown',
    sub: b.jobType || '—',
    phone: b.phone || '',
    stage: getBookingStage(b.status),
    type: 'booking' as const,
    value: parseValue(b.value),
    time: b.scheduledDate || b.timestamp || '',
    outcome: b.status || '',
  }));

  // De-duplicate: if a lead has a matching booking, only show in booking stage
  const allItems = [...leadItems, ...bookingItems];
  const byStage: Record<string, typeof allItems> = {};
  STAGES.forEach((s) => { byStage[s.key] = []; });
  allItems.forEach((item) => { if (byStage[item.stage]) byStage[item.stage].push(item); });

  const totalLeads = interactions.length;
  const totalBookings = bookings.length;
  const convRate = totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;
  const pipelineValue = bookings.reduce((s, b) => s + parseValue(b.value), 0);

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Lead Pipeline" sub="Full journey — enquiry to paid invoice" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a1)', icon: '📞', label: 'Total Leads', val: loading ? '—' : totalLeads, sub: 'all enquiries' },
            { stripe: 'var(--a3)', icon: '✅', label: 'Bookings', val: loading ? '—' : totalBookings, sub: 'confirmed' },
            { stripe: 'var(--a2)', icon: '📊', label: 'Conversion', val: loading ? '—' : `${convRate}%`, sub: 'lead to booking' },
            { stripe: '#C9A84C', icon: '💷', label: 'Pipeline Value', val: loading ? '—' : `£${Math.round(pipelineValue).toLocaleString()}`, sub: 'all booking value' },
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

        {/* Stage dots pipeline */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '14px 18px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Pipeline Stages</div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {(['kanban','funnel'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: view === v ? 'var(--a1)' : 'var(--slate)', color: view === v ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {STAGES.map((stage, idx) => (
              <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ textAlign: 'center', minWidth: '64px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 900, color: '#fff', margin: '0 auto 5px' }}>
                    {byStage[stage.key].length}
                  </div>
                  <div style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{stage.label}</div>
                </div>
                {idx < STAGES.length - 1 && <div style={{ color: 'var(--faint)', fontSize: '14px', marginBottom: '14px', flexShrink: 0 }}>›</div>}
              </div>
            ))}
          </div>
        </div>

        {/* View: Kanban or Funnel */}
        {view === 'kanban' ? (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px' }}>
            {STAGES.map((stage) => (
              <div key={stage.key} style={{ minWidth: '210px', flex: '0 0 210px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 0' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{stage.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: stage.bg, color: stage.color }}>{byStage[stage.key].length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {byStage[stage.key].length === 0 ? (
                    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px dashed var(--divider)', textAlign: 'center', color: 'var(--faint)', fontSize: '10px' }}>Empty</div>
                  ) : byStage[stage.key].slice(0, 12).map((item, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', borderLeft: `3px solid ${stage.color}` }}>
                      <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: stage.bg, color: stage.color }}>
                          {item.type === 'booking' ? 'Booking' : 'Lead'}
                        </span>
                        {item.value > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--a3)', fontFamily: '"Inter Tight",sans-serif' }}>£{item.value.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                  {byStage[stage.key].length > 12 && (
                    <div style={{ padding: '6px', textAlign: 'center', fontSize: '10px', color: 'var(--muted)' }}>+{byStage[stage.key].length - 12} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Funnel view */
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '16px', maxWidth: '640px' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '14px' }}>Conversion Funnel</div>
            {STAGES.map((stage, idx) => {
              const count = byStage[stage.key].length;
              const maxCount = Math.max(1, ...STAGES.map(s => byStage[s.key].length));
              const pct = Math.max(4, Math.round((count / maxCount) * 100));
              return (
                <div key={stage.key} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>{stage.label}</span>
                    <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 900, color: 'var(--ink)' }}>{count}</span>
                  </div>
                  <div style={{ height: '22px', borderRadius: '4px', background: 'var(--slate)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: stage.color, width: `${pct}%`, display: 'flex', alignItems: 'center', paddingLeft: '8px', transition: 'width 1s ease' }}>
                      {pct > 15 && <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{pct}%</span>}
                    </div>
                  </div>
                  {idx < STAGES.length - 1 && count > 0 && byStage[STAGES[idx + 1].key].length > 0 && (
                    <div style={{ fontSize: '9px', color: 'var(--muted)', textAlign: 'right', marginTop: '1px' }}>
                      → {Math.round((byStage[STAGES[idx + 1].key].length / count) * 100)}% advance
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
