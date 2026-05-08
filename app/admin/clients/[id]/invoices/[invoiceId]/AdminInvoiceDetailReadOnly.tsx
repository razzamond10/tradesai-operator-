'use client';
import { useEffect, useState } from 'react';
import AdminClientShell from '@/components/AdminClientShell';
import Topbar from '@/components/Topbar';
import type { Invoice, LineItem } from '@/lib/invoices';

type User = { email: string; name: string; role: string; planTier?: string };

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  draft:   { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  sent:    { bg: '#EFF6FF', color: '#2563EB', label: 'Sent' },
  paid:    { bg: '#F0FDF4', color: '#16A34A', label: 'Paid' },
  overdue: { bg: '#FEF2F2', color: '#DC2626', label: 'Overdue' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '.5px' }}>
      {s.label}
    </span>
  );
}

function fmt(n: number) { return `£${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` }

function fmtUKDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function AdminInvoiceDetailReadOnly({ clientId, invoiceId, user }: { clientId: string; invoiceId: string; user: User }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${encodeURIComponent(clientId)}/invoices/${invoiceId}`)
      .then(r => r.json())
      .then(d => {
        if (d.invoice) {
          setInvoice(d.invoice);
        } else {
          setError('Invoice not found.');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load invoice.'); setLoading(false); });
  }, [clientId, invoiceId]);

  if (loading) return (
    <AdminClientShell clientId={clientId} adminName={user.name}>
      <Topbar breadcrumb="Invoices" page="Invoice" sub="" />
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>
    </AdminClientShell>
  );

  if (error || !invoice) return (
    <AdminClientShell clientId={clientId} adminName={user.name}>
      <Topbar breadcrumb="Invoices" page="Invoice" sub="" />
      <div style={{ padding: '24px', color: '#DC2626', fontSize: '13px' }}>{error || 'Not found.'}</div>
    </AdminClientShell>
  );

  return (
    <AdminClientShell clientId={clientId} adminName={user.name}>
      <Topbar breadcrumb="Invoices" page={invoice.invoiceId} sub={`${invoice.customerName} · ${fmtUKDate(invoice.issueDate)}`} />

      <div style={{ padding: '20px', maxWidth: '720px' }}>
        {/* Action bar */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '16px', fontWeight: 900, color: 'var(--ink)' }}>{invoice.invoiceId}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <a href={`/admin/clients/${clientId}/invoices`} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--muted)', textDecoration: 'none' }}>← Back</a>
        </div>

        {/* Customer Details */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Customer Details</div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '13px' }}>
            <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Customer</div><div style={{ color: 'var(--ink)', fontWeight: 600 }}>{invoice.customerName}</div></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Phone</div><div style={{ color: 'var(--ink)' }}>{invoice.customerPhone || '—'}</div></div>
            <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Address</div><div style={{ color: 'var(--ink)' }}>{invoice.customerAddress || '—'}</div></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Issue Date</div><div style={{ color: 'var(--ink)' }}>{fmtUKDate(invoice.issueDate)}</div></div>
            <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Due Date</div><div style={{ color: invoice.status === 'overdue' ? '#DC2626' : 'var(--ink)', fontWeight: invoice.status === 'overdue' ? 700 : 400 }}>{fmtUKDate(invoice.dueDate)}</div></div>
            {invoice.paidAt && <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Paid At</div><div style={{ color: '#16A34A', fontWeight: 600 }}>{invoice.paidAt.slice(0, 10)}</div></div>}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Line Items</div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Amount' ? 'right' : 'left', fontWeight: 700, color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.4px', borderBottom: '1px solid var(--divider)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item: LineItem, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--divider)' }}>
                      <td style={{ padding: '10px' }}>{item.description}</td>
                      <td style={{ padding: '10px', color: 'var(--muted)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px', color: 'var(--muted)' }}>{fmt(item.unitPrice)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontFamily: '"Inter Tight",sans-serif' }}>{fmt(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--divider)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '230px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(invoice.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>VAT ({invoice.vatRate}%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(invoice.vatAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontWeight: 900, color: 'var(--ink)', fontSize: '18px' }}>{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>Notes</div>
          <div style={{ fontSize: '13px', color: invoice.notes ? 'var(--ink)' : 'var(--muted)', whiteSpace: 'pre-wrap' }}>{invoice.notes || 'No notes.'}</div>
        </div>
      </div>
    </AdminClientShell>
  );
}
