'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientTime } from '@/lib/hooks/useClientTime';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  tradeType: string;
  clientId: string;
  twilioNumber: string;
}

interface RawInteraction {
  callerName?: string;
  intent?: string;
  outcome?: string;
  timestamp?: string;
  conversationId?: string;
}

interface RawEmergency {
  resolved?: string;
  timestamp?: string;
}

interface RawBooking {
  scheduledDate?: string;
  timestamp?: string;
}

interface ClientData {
  interactions?: RawInteraction[];
  emergencies?: RawEmergency[];
  bookings?: RawBooking[];
  kpis?: { hotLeads?: number };
}

interface FeedItem {
  callerName: string;
  intent: string;
  outcome: string;
  timestamp: string;
  clientName: string;
  clientId: string;
  conversationId?: string;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function ReadOnlyBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', background: '#EDE8FF', border: '1px solid rgba(61,31,168,0.15)' }}>
      <span style={{ fontSize: '13px' }}>👁</span>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#3D1FA8' }}>VA View — Read-only. You can view all client dashboards but cannot modify data or billing.</div>
      <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(61,31,168,0.12)', color: '#3D1FA8' }}>READ-ONLY</span>
    </div>
  );
}

export default function VADashboardClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientCount, setClientCount] = useState(0);
  const [openEmergencies, setOpenEmergencies] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [hotLeads, setHotLeads] = useState(0);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/clients');
        const d = await r.json();
        if (d.error) { setError(d.error); setLoading(false); return; }
        const clients: ClientConfig[] = d.clients || [];
        setClientCount(clients.length);

        const results = await Promise.all(
          clients.map(async (c) => {
            try {
              const dr = await fetch(`/api/clients/${c.clientId}/data`);
              const dd: ClientData = await dr.json();
              return { clientName: c.businessName, clientId: c.clientId, data: dd };
            } catch {
              return { clientName: c.businessName, clientId: c.clientId, data: null };
            }
          })
        );

        let emergCount = 0;
        let bookCount = 0;
        let leads = 0;
        const allFeed: FeedItem[] = [];
        const td = todayStr();

        results.forEach(({ clientName, clientId, data }) => {
          if (!data) return;
          emergCount += (data.emergencies || []).filter(
            (e) => (e.resolved || '').toLowerCase() !== 'yes'
          ).length;
          bookCount += (data.bookings || []).filter(
            (b) => (b.scheduledDate || b.timestamp || '').startsWith(td)
          ).length;
          leads += data.kpis?.hotLeads ?? 0;
          (data.interactions || []).forEach((it) => {
            allFeed.push({
              callerName: it.callerName || 'Unknown',
              intent: it.intent || '—',
              outcome: it.outcome || '—',
              timestamp: it.timestamp || '',
              clientName,
              clientId,
              conversationId: it.conversationId,
            });
          });
        });

        allFeed.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        setOpenEmergencies(emergCount);
        setTodayBookings(bookCount);
        setHotLeads(leads);
        setFeed(allFeed.slice(0, 10));
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = useClientTime('dateLong');
  const clockTime = useClientTime('time');

  const kpis = [
    { label: 'Total Clients', val: loading ? '—' : clientCount, stripe: 'var(--a1)', iconBg: 'var(--a1b)', icon: '👥', badge: 'Portfolio' },
    { label: 'Open Emergencies', val: loading ? '—' : openEmergencies, stripe: 'var(--a4)', iconBg: 'var(--a4b)', icon: '🚨', badge: openEmergencies > 0 ? 'Active' : 'Clear', warn: openEmergencies > 0 },
    { label: "Today's Bookings", val: loading ? '—' : todayBookings, stripe: 'var(--a3)', iconBg: 'var(--a3b)', icon: '📅', badge: 'Today' },
    { label: 'Hot Leads', val: loading ? '—' : hotLeads, stripe: 'var(--a2)', iconBg: 'var(--a2b)', icon: '🔥', badge: 'Cross-client' },
  ];

  const quickLinks = [
    { label: 'Emergencies', icon: '🚨', href: '/va/emergencies', color: 'var(--a4)', bg: 'var(--a4b)', desc: 'All open alerts' },
    { label: 'Bookings', icon: '📅', href: '/va/bookings', color: 'var(--a3)', bg: 'var(--a3b)', desc: "Today's schedule" },
    { label: 'Communications', icon: '💬', href: '/va/communications', color: 'var(--a1)', bg: 'var(--a1b)', desc: 'All messages' },
    { label: 'All Clients', icon: '👥', href: '/va/clients', color: 'var(--a5)', bg: 'var(--a5b)', desc: 'Client roster' },
  ];

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal" page="Dashboard" sub="Today at a glance — all clients" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Today at a Glance</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{today}</div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>⚠ {error}</div>
        )}

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {loading
            ? [1,2,3,4].map(i => <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)
            : kpis.map((k) => (
              <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: k.stripe }} />
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{k.icon}</div>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: k.warn ? 'var(--a4b)' : k.iconBg, color: k.warn ? 'var(--a4)' : k.stripe }}>{k.badge}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{k.label}</div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '30px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.val}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Quick links */}
        <div style={{ marginBottom: '8px', fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {quickLinks.map((ql) => (
            <button
              key={ql.href}
              onClick={() => router.push(ql.href)}
              style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: ql.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '8px' }}>{ql.icon}</div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>{ql.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{ql.desc}</div>
            </button>
          ))}
        </div>

        {/* Recent activity feed */}
        <div style={{ marginBottom: '8px', fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Recent Activity</div>
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading…</div>
          ) : feed.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No activity yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>{['Client','Caller','Intent','Outcome','Time'].map(h => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {feed.map((it, i) => (
                  <tr key={i} onClick={(() => {
                      const hasKey = !!(it.conversationId || it.timestamp);
                      if (!hasKey) return undefined;
                      const key = it.conversationId || `${it.clientId}__${it.timestamp || ''}`;
                      return () => router.push(`/va/communications/${encodeURIComponent(key)}`);
                    })()} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: !!(it.conversationId || it.timestamp) ? 'pointer' : 'default' }}>
                    <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--a1)', fontSize: '10px' }}>{it.clientName}</td>
                    <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--ink)' }}>{it.callerName}</td>
                    <td style={{ padding: '7px 12px', color: 'var(--ink2)' }}>{it.intent}</td>
                    <td style={{ padding: '7px 12px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: it.outcome.toLowerCase() === 'booked' ? 'var(--a3b)' : 'var(--slate)', color: it.outcome.toLowerCase() === 'booked' ? 'var(--a3)' : 'var(--muted)' }}>{it.outcome}</span>
                    </td>
                    <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{it.timestamp.slice(11, 16) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{clockTime}</div>
        </div>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
