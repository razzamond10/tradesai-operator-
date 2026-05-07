'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';

type User = { email: string; name: string; role: string; clientId?: string; planTier?: string };
interface LineItem { description: string; quantity: number; unitPrice: number }
interface RecentBooking { customerName: string; phone: string; jobType: string; scheduledDate: string }

function today() { return new Date().toISOString().slice(0, 10); }
function dueIn(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const INPUT: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '13px', color: 'var(--ink)', background: '#fff', boxSizing: 'border-box' };
const LABEL: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px' };

function fmt(n: number) { return `£${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` }

export default function NewInvoiceClient({ user }: { user: User }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(dueIn(14));
  const [vatEnabled, setVatEnabled] = useState(false);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [showAutoFill, setShowAutoFill] = useState(false);

  useEffect(() => {
    fetch('/api/bookings/recent')
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => {});
  }, []);

  const vatRate = vatEnabled ? 20 : 0;
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vatAmount = parseFloat((subtotal * vatRate / 100).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));

  function updateLine(i: number, field: keyof LineItem, val: string | number) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: field === 'description' ? val : Number(val) } : l));
  }
  function addLine() { setLines(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]); }
  function removeLine(i: number) { if (lines.length > 1) setLines(prev => prev.filter((_, idx) => idx !== i)); }

  function fillFromBooking(b: RecentBooking) {
    setCustomerName(b.customerName);
    setCustomerPhone(b.phone || '');
    setBookingRef('');
    if (b.jobType) setLines([{ description: b.jobType, quantity: 1, unitPrice: 0 }]);
    setShowAutoFill(false);
  }

  async function submit(targetStatus: 'draft' | 'sent') {
    setError('');
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (lines.some(l => !l.description.trim())) { setError('All line items need a description.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerPhone, customerAddress, bookingRef, issueDate, dueDate, lineItems: lines, vatRate, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create invoice.'); setSaving(false); return; }
      // If "Send", immediately mark as sent
      if (targetStatus === 'sent') {
        await fetch(`/api/invoices/${data.invoice.invoiceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'sent' }),
        });
      }
      router.push(`/dashboard/invoices/${data.invoice.invoiceId}`);
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  return (
    <ClientShell userName={user.name} planTier={user.planTier}>
      <Topbar breadcrumb="Invoices" page="New Invoice" sub="Fill in the details below" />

      <div style={{ padding: '20px', maxWidth: '720px' }}>
        {/* Customer */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Customer Details</div>
            {bookings.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button type="button" onClick={() => setShowAutoFill(v => !v)} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', background: '#fff', color: '#3D1FA8', cursor: 'pointer' }}>
                  Auto-fill from booking ▾
                </button>
                {showAutoFill && (
                  <div style={{ position: 'absolute', right: 0, top: '32px', background: '#fff', border: '1px solid var(--divider)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 50, minWidth: '240px', maxHeight: '220px', overflowY: 'auto' }}>
                    {bookings.map((b, i) => (
                      <button key={i} type="button" onClick={() => fillFromBooking(b)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', fontSize: '12px', color: 'var(--ink)', cursor: 'pointer', borderBottom: i < bookings.length - 1 ? '1px solid var(--divider)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{b.jobType} · {b.scheduledDate}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={LABEL}>Customer Name *</label>
              <input style={INPUT} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Smith" />
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
              <label style={LABEL}>Issue Date *</label>
              <input type="date" style={INPUT} value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Due Date *</label>
              <input type="date" style={INPUT} value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Line Items</div>
            <button type="button" onClick={addLine} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', background: '#fff', color: '#3D1FA8', cursor: 'pointer' }}>+ Add line</button>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 90px', gap: '8px', marginBottom: '6px', minWidth: '480px' }}>
              {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{h}</div>
              ))}
            </div>
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 90px', gap: '8px', marginBottom: '8px', alignItems: 'center', minWidth: '480px' }}>
                <input style={INPUT} value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="e.g. Boiler service" />
                <input type="number" min="1" style={INPUT} value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                <input type="number" min="0" step="0.01" style={INPUT} value={line.unitPrice === 0 ? '' : line.unitPrice} onChange={e => updateLine(i, 'unitPrice', e.target.value)} placeholder="0.00" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Inter Tight",sans-serif', color: 'var(--ink)' }}>{fmt(line.quantity * line.unitPrice)}</span>
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} style={{ fontSize: '13px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                  )}
                </div>
              </div>
            ))}
            </div>{/* end overflowX wrapper */}

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--divider)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '230px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} style={{ cursor: 'pointer' }} />
                    VAT (20%)
                  </label>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(vatAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontWeight: 900, color: 'var(--ink)', fontSize: '18px' }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px', boxShadow: 'var(--shadow-s)', padding: '16px', marginBottom: '16px' }}>
          <label style={LABEL}>Notes (optional)</label>
          <textarea style={{ ...INPUT, resize: 'vertical', minHeight: '72px' } as React.CSSProperties} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, bank details, thank-you note…" />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard/invoices')} disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={() => submit('draft')} disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #3D1FA8', background: '#fff', color: '#3D1FA8', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="button" onClick={() => submit('sent')} disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: saving ? '#9CA3AF' : '#3D1FA8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save & Send'}
          </button>
        </div>
      </div>
    </ClientShell>
  );
}
