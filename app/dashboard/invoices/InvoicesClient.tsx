'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';
import type { Invoice } from '@/lib/invoices';

type User = { email: string; name: string; role: string; clientId?: string; planTier?: string };

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  draft:   { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  sent:    { bg: '#EFF6FF', color: '#2563EB', label: 'Sent' },
  paid:    { bg: '#F0FDF4', color: '#16A34A', label: 'Paid' },
  overdue: { bg: '#FEF2F2', color: '#DC2626', label: 'Overdue' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '.5px' }}>
      {s.label}
    </span>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧾</div>
      <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>No invoices yet</div>
      <div style={{ fontSize: '13px', marginBottom: '24px' }}>Create your first invoice to start getting paid faster.</div>
      <button onClick={() => router.push('/dashboard/invoices/new')} style={{ background: '#3D1FA8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        + New Invoice
      </button>
    </div>
  );
}

export default function InvoicesClient({ user }: { user: User }) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices ?? []); setLoading(false); })
      .catch(() => { setError('Failed to load invoices.'); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? invoices : invoices.filter(inv => inv.status === filter);

  const totals = {
    outstanding: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    draft: invoices.filter(i => i.status === 'draft').length,
  };

  function fmt(n: number) { return `£${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` }

  return (
    <ClientShell userName={user.name} planTier={user.planTier}>
      <Topbar breadcrumb="Revenue" page="Invoices" sub="Create, send, and track your invoices" />

      <div style={{ padding: '20px', maxWidth: '1100px' }}>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Outstanding', value: fmt(totals.outstanding), color: '#2563EB' },
            { label: 'Collected', value: fmt(totals.paid), color: '#16A34A' },
            { label: 'Drafts', value: String(totals.draft), color: '#6B7280' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '4px' }}>{k.label}</div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '26px', fontWeight: 900, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'draft', 'sent', 'paid', 'overdue'].map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px', border: '1px solid', borderColor: filter === s ? '#3D1FA8' : 'var(--divider)', background: filter === s ? '#3D1FA8' : '#fff', color: filter === s ? '#fff' : 'var(--muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/api/invoices/export" style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ↓ Export CSV
              </a>
              <button onClick={() => router.push('/dashboard/invoices/new')} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#3D1FA8', color: '#fff', cursor: 'pointer' }}>
                + New Invoice
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#DC2626', fontSize: '13px' }}>{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Invoice', 'Customer', 'Issue Date', 'Due Date', 'Total', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--divider)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.invoiceId} onClick={() => router.push(`/dashboard/invoices/${inv.invoiceId}`)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--divider)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--ink)' }}>{inv.invoiceId}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--ink)' }}>{inv.customerName}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{inv.issueDate}</td>
                      <td style={{ padding: '12px 14px', color: inv.status === 'overdue' ? '#DC2626' : 'var(--muted)', fontWeight: inv.status === 'overdue' ? 700 : 400 }}>{inv.dueDate}</td>
                      <td style={{ padding: '12px 14px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--ink)' }}>{fmt(inv.total)}</td>
                      <td style={{ padding: '12px 14px' }}><StatusBadge status={inv.status} /></td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#3D1FA8', fontWeight: 600 }}>View →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ClientShell>
  );
}
