'use client';
import { useEffect, useState } from 'react';
import { useClientTime } from '@/lib/hooks/useClientTime';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';
import NoteModal from '@/components/va/NoteModal';

interface ClientConfig {
  businessName: string;
  clientId: string;
}

interface RawBooking {
  businessName?: string;
  timestamp?: string;
  customerName?: string;
  phone?: string;
  postcode?: string;
  jobType?: string;
  scheduledDate?: string;
  calendarEventId?: string;
  bookingDateReadable?: string;
  status?: string;
  value?: string;
  finalPrice?: string;
}

interface BookingDetail extends RawBooking {
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

function statusBadge(s: string) {
  const lower = (s || '').toLowerCase();
  if (lower.includes('confirm') || lower.includes('booked')) return { bg: 'var(--a3b)', color: 'var(--a3)', label: s || 'Confirmed' };
  if (lower.includes('cancel')) return { bg: 'var(--a4b)', color: 'var(--a4)', label: s || 'Cancelled' };
  if (lower.includes('complete')) return { bg: 'var(--a3b)', color: 'var(--a3)', label: s || 'Completed' };
  if (lower.includes('pending')) return { bg: 'var(--a2b)', color: 'var(--a6)', label: s || 'Pending' };
  return { bg: 'var(--slate)', color: 'var(--muted)', label: s || '—' };
}

export default function VABookingDetailClient({ user, id }: { user: JWTPayload; id: string }) {
  const clockTime = useClientTime('time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<BookingDetail | null>(null);
  const [toast, setToast] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    const eventId = decodeURIComponent(id);
    if (!eventId) {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const cr = await fetch('/api/clients');
        const cd = await cr.json();
        if (cd.error) { setError(cd.error); setLoading(false); return; }
        const clients: ClientConfig[] = cd.clients || [];

        let found: BookingDetail | null = null;
        for (const c of clients) {
          try {
            const dr = await fetch(`/api/clients/${encodeURIComponent(c.clientId)}/data`);
            const dd = await dr.json();
            const bookings: RawBooking[] = dd.bookings || [];
            const match = bookings.find(b => (b.calendarEventId || '') === eventId);
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
          setError('Booking not found');
          setLoading(false);
          return;
        }

        setRecord(found);
      } catch {
        setError('Failed to load booking');
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

  async function handleAddNote(note: string) {
    const calEventId = decodeURIComponent(id);
    const res = await fetch(`/api/va/booking/${encodeURIComponent(calEventId)}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: record?.clientId, eventId: calEventId, note }),
    }).catch(() => null);
    if (!res || !res.ok) {
      showToast('Failed to save note — try again');
      throw new Error('note save failed');
    }
  }

  const sv = record ? statusBadge(record.status || '') : null;
  const ts = record?.timestamp || '';
  const scheduled = record?.bookingDateReadable || record?.scheduledDate || '';
  const quote = record?.value ? `£${record.value}` : '—';
  const finalP = record?.finalPrice ? `£${record.finalPrice}` : '—';

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal / Bookings" page="Booking Detail" sub={record ? `${record.clientName} — ${record.customerName || 'Unknown customer'}` : 'Loading...'} />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        <div style={{ marginBottom: '16px' }}>
          <Link href="/va/bookings" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--a1)', textDecoration: 'none' }}>
            ← Back to all bookings
          </Link>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            Loading booking details...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && !error && record && (
          <>
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '3px', background: sv?.color || 'var(--a1)' }} />
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: 'var(--ink)', marginBottom: '4px' }}>
                    {record.customerName || 'Unknown customer'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {record.clientName} <span style={{ color: 'var(--faint)', margin: '0 6px' }}>•</span> Booked: {ts ? `${ts.slice(0,10)} ${ts.slice(11,16)}` : '—'}
                  </div>
                </div>
                {sv && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: sv.bg, color: sv.color }}>{sv.label}</span>}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Details</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Customer name" value={record.customerName || '—'} />
                <Field label="Phone" value={record.phone || '—'} tel={record.phone} />
                <Field label="Postcode" value={record.postcode || '—'} />
                <Field label="Job type" value={record.jobType || '—'} />
                <Field label="Scheduled" value={scheduled || '—'} />
                <Field label="Quote" value={quote} />
                <Field label="Final price" value={finalP} />
                <Field label="Client" value={record.clientName} />
                <Field label="Booked at" value={ts || '—'} mono />
                <Field label="Calendar event ID" value={record.calendarEventId || '—'} mono />
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Internal notes</div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'var(--slate)', color: 'var(--muted)', border: '1px solid var(--divider)' }}>PHASE 4</span>
              </div>
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>
                Notes timeline will load here in Phase 4.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ActionButton label="Reschedule" onClick={() => showToast('Wiring in Phase 4 — reschedule endpoint already verified')} primary />
              <ActionButton label="Cancel booking" onClick={() => showToast('Wiring in Phase 4 — cancel endpoint already verified')} />
              <ActionButton label="Add note" onClick={() => setNoteOpen(true)} />
            </div>
          </>
        )}

        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '10px 16px', background: 'var(--ink)', color: '#fff', borderRadius: '8px', fontSize: '11px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
            {toast}
          </div>
        )}

        <NoteModal
          isOpen={noteOpen}
          title="Add note"
          onClose={() => setNoteOpen(false)}
          onSubmit={handleAddNote}
        />

        <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{clockTime}</div>
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
