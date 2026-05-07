'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';
import type { Invoice, LineItem } from '@/lib/invoices';

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

const INPUT: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '13px', color: 'var(--ink)', background: '#fff', boxSizing: 'border-box' };
const LABEL: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px' };

export default function InvoiceDetailClient({ invoiceId, user }: { invoiceId: string; user: User }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Edit state mirrors invoice fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([]);
  const [vatEnabled, setVatEnabled] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${invoiceId}`)
      .then(r => r.json())
      .then(d => {
        if (d.invoice) {
          setInvoice(d.invoice);
          populateEdit(d.invoice);
        } else {
          setError('Invoice not found.');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load invoice.'); setLoading(false); });
  }, [invoiceId]);

  function populateEdit(inv: Invoice) {
    setCustomerName(inv.customerName);
    setCustomerPhone(inv.customerPhone);
    setCustomerAddress(inv.customerAddress);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setNotes(inv.notes);
    setLines(inv.lineItems.length ? inv.lineItems : [{ description: '', quantity: 1, unitPrice: 0 }]);
    setVatEnabled(inv.vatRate > 0);
  }

  const vatRate = vatEnabled ? 20 : 0;
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vatAmount = parseFloat((subtotal * vatRate / 100).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));

  function updateLine(i: number, field: keyof LineItem, val: string | number) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: field === 'description' ? val : Number(val) } : l));
  }
  function addLine() { setLines(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]); }
  function removeLine(i: number) { if (lines.length > 1) setLines(prev => prev.filter((_, idx) => idx !== i)); }

  async function saveEdit() {
    if (!customerName.trim()) { setActionMsg('Customer name is required.'); return; }
    setSaving(true); setActionMsg('');
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerPhone, customerAddress, issueDate, dueDate, notes, lineItems: lines, vatRate }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setInvoice(data.invoice); setEditing(false); setActionMsg(''); }
    else setActionMsg(data.error || 'Save failed.');
  }

  async function changeStatus(status: Invoice['status']) {
    setSaving(true); setActionMsg('');
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setInvoice(data.invoice); setActionMsg(status === 'paid' ? 'Marked as paid.' : `Status updated to ${status}.`); }
    else setActionMsg(data.error || 'Update failed.');
  }

  if (loading) return (
    <ClientShell userName={user.name} planTier={user.planTier}>
      <Topbar breadcrumb="Invoices" page="Invoice" sub="" />
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>
    </ClientShell>
  );

  if (error || !invoice) return (
    <ClientShell userName={user.name} planTier={user.planTier}>
      <Topbar breadcrumb="Invoices" page="Invoice" sub="" />
      <div style={{ padding: '24px', color: '#DC2626', fontSize: '13px' }}>{error || 'Not found.'}</div>
    </ClientShell>
  );

  return (
    <ClientShell userName={user.name} planTier={user.planTier}>
      <Topbar breadcrumb="Invoices" page={invoice.invoiceId} sub={`${invoice.customerName} · ${invoice.issueDate}`} />

      <div style={{ padding: '20px', maxWidth: '720px' }}>
        {/* Action bar */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '16px', fontWeight: 900, color: 'var(--ink)' }}>{invoice.invoiceId}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!editing && invoice.status !== 'paid' && (
              <button onClick={() => setEditing(true)} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', cursor: 'pointer' }}>Edit</button>
            )}
            {invoice.status === 'draft' && (
              <button onClick={() => changeStatus('sent')} disabled={saving} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid #2563EB', background: '#fff', color: '#2563EB', cursor: 'pointer' }}>Mark Sent</button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button onClick={() => changeStatus('paid')} disabled={saving} style={{ fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#16A34A', color: '#fff', cursor: 'pointer' }}>✓ Mark Paid</button>
            )}
            {invoice.status !== 'overdue' && invoice.status !== 'paid' && (
              <button onClick={() => changeStatus('overdue')} disabled={saving} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid #DC2626', background: '#fff', color: '#DC2626', cursor: 'pointer' }}>Mark Overdue</button>
            )}
            <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ↓ PDF
            </a>
            <button onClick={() => router.push('/dashboard/invoices')} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--muted)', cursor: 'pointer' }}>← Back</button>
          </div>
        </div>

        {actionMsg && (
          <div style={{ background: actionMsg.includes('failed') || actionMsg.includes('required') ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${actionMsg.includes('failed') || actionMsg.includes('required') ? '#FCA5A5' : '#86EFAC'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: actionMsg.includes('failed') || actionMsg.includes('required') ? '#DC2626' : '#16A34A', marginBottom: '12px' }}>
            {actionMsg}
          </div>
        )}

        {/* Customer & Dates */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Customer Details</div>
          {editing ? (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LABEL}>Customer Name *</label>
                <input style={INPUT} value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LABEL}>Customer Phone</label>
                <input type="tel" style={INPUT} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+44 7700 900000" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LABEL}>Customer Address</label>
                <textarea style={{ ...INPUT, minHeight: '60px', resize: 'vertical' } as React.CSSProperties} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="123 High St, London, SW1A 1AA" />
              </div>
              <div>
                <label style={LABEL}>Issue Date</label>
                <input type="date" style={INPUT} value={issueDate} onChange={e => setIssueDate(e.target.value)} />
              </div>
              <div>
                <label style={LABEL}>Due Date</label>
                <input type="date" style={INPUT} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '13px' }}>
              <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Customer</div><div style={{ color: 'var(--ink)', fontWeight: 600 }}>{invoice.customerName}</div></div>
              <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Phone</div><div style={{ color: 'var(--ink)' }}>{invoice.customerPhone || '—'}</div></div>
              <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Address</div><div style={{ color: 'var(--ink)' }}>{invoice.customerAddress || '—'}</div></div>
              <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Issue Date</div><div style={{ color: 'var(--ink)' }}>{fmtUKDate(invoice.issueDate)}</div></div>
              <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Due Date</div><div style={{ color: invoice.status === 'overdue' ? '#DC2626' : 'var(--ink)', fontWeight: invoice.status === 'overdue' ? 700 : 400 }}>{fmtUKDate(invoice.dueDate)}</div></div>
              {invoice.paidAt && <div><div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '3px' }}>Paid At</div><div style={{ color: '#16A34A', fontWeight: 600 }}>{invoice.paidAt.slice(0, 10)}</div></div>}
            </div>
          )}
        </div>

        {/* Line items */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Line Items</div>
            {editing && <button type="button" onClick={addLine} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', background: '#fff', color: '#3D1FA8', cursor: 'pointer' }}>+ Add line</button>}
          </div>
          <div style={{ padding: '12px 16px' }}>
            {editing ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 90px', gap: '8px', marginBottom: '6px', minWidth: '480px' }}>
                  {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</div>
                  ))}
                </div>
                {lines.map((line, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 90px', gap: '8px', marginBottom: '8px', alignItems: 'center', minWidth: '480px' }}>
                    <input style={INPUT} value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} />
                    <input type="number" min="1" style={INPUT} value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" style={INPUT} value={line.unitPrice === 0 ? '' : line.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} placeholder="0.00" />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Inter Tight",sans-serif', color: 'var(--ink)' }}>{fmt(line.quantity * line.unitPrice)}</span>
                      {lines.length > 1 && <button type="button" onClick={() => removeLine(i)} style={{ fontSize: '13px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>✕</button>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                    {invoice.lineItems.map((item, i) => (
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
            )}

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--divider)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '230px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(editing ? subtotal : invoice.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  {editing ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} />
                      VAT (20%)
                    </label>
                  ) : (
                    <span>VAT ({invoice.vatRate}%)</span>
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(editing ? vatAmount : invoice.vatAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontWeight: 900, color: 'var(--ink)', fontSize: '18px' }}>{fmt(editing ? total : invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>Notes</div>
          {editing ? (
            <textarea style={{ ...INPUT, resize: 'vertical', minHeight: '72px' } as React.CSSProperties} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, bank details…" />
          ) : (
            <div style={{ fontSize: '13px', color: invoice.notes ? 'var(--ink)' : 'var(--muted)', whiteSpace: 'pre-wrap' }}>{invoice.notes || 'No notes.'}</div>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setEditing(false); populateEdit(invoice); setActionMsg(''); }} disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: saving ? '#9CA3AF' : '#3D1FA8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </ClientShell>
  );
}
