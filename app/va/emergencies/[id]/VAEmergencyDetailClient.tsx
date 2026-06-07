'use client';
import { useEffect, useState } from 'react';
import { useClientTime } from '@/lib/hooks/useClientTime';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';
import NoteModal from '@/components/va/NoteModal';
import ConfirmModal from '@/components/va/ConfirmModal';
import SelectModal from '@/components/va/SelectModal';
import { isResolved } from '@/lib/emergencyHelpers';

interface RawEmergency {
  businessName?: string;
  timestamp?: string;
  callerName?: string;
  phone?: string;
  type?: string;
  severity?: string;
  resolved?: string;
}

interface EmergencyDetail extends RawEmergency {
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

function severityBadge(s: string) {
  const lower = (s || '').toLowerCase();
  if (lower === 'critical' || lower === 'high') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  if (lower === 'medium') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

function resolvedBadge(r: string) {
  return isResolved(r)
    ? { bg: 'var(--a3b)', color: 'var(--a3)', label: 'Resolved' }
    : { bg: 'var(--a4b)', color: 'var(--a4)', label: 'Open' };
}

function decodeId(id: string): { clientId: string; timestamp: string } | null {
  try {
    const decoded = decodeURIComponent(id);
    const parts = decoded.split('__');
    if (parts.length !== 2) return null;
    return { clientId: parts[0], timestamp: parts[1] };
  } catch {
    return null;
  }
}

export default function VAEmergencyDetailClient({ user, id }: { user: JWTPayload; id: string }) {
  const clockTime = useClientTime('time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<EmergencyDetail | null>(null);
  const [toast, setToast] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    const parsed = decodeId(id);
    if (!parsed) {
      setError('Invalid emergency ID');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const dr = await fetch(`/api/clients/${encodeURIComponent(parsed!.clientId)}/data`);
        const dd = await dr.json();
        if (dd.error) { setError(dd.error); setLoading(false); return; }

        const emergencies: RawEmergency[] = dd.emergencies || [];
        const match = emergencies.find(e => (e.timestamp || '') === parsed!.timestamp);

        if (!match) {
          setError('Emergency not found');
          setLoading(false);
          return;
        }

        setRecord({
          ...match,
          clientId: parsed!.clientId,
          clientName: dd.config?.businessName || 'Unknown client',
        });
      } catch {
        setError('Failed to load emergency');
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

  async function handleClaim() {
    const res = await fetch(`/api/va/emergency/${encodeURIComponent(id)}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: record?.clientId, timestamp: ts }),
    }).catch(() => null);
    if (!res || !res.ok) {
      showToast('Failed to claim — try again');
      throw new Error('claim failed');
    }
    showToast('Emergency claimed');
  }

  async function handleRelease() {
    const res = await fetch(`/api/va/emergency/${encodeURIComponent(id)}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: record?.clientId, timestamp: ts }),
    }).catch(() => null);
    if (!res || !res.ok) {
      showToast('Failed to release — try again');
      throw new Error('release failed');
    }
    showToast('Emergency released');
  }

  async function handleSetStatus(newStatus: string) {
    const res = await fetch(`/api/va/emergency/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: record?.clientId,
        status: newStatus,
        phone: record?.phone || '',
        timestamp: ts,
      }),
    }).catch(() => null);
    if (!res || !res.ok) {
      showToast('Failed to update status — try again');
      throw new Error('status update failed');
    }
    if (record) setRecord({ ...record, resolved: newStatus });
    showToast('Status updated');
  }

  async function handleAddNote(note: string) {
    const res = await fetch(`/api/va/emergency/${encodeURIComponent(id)}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: record?.clientId, phone: record?.phone || '', timestamp: ts, note }),
    }).catch(() => null);
    if (!res || !res.ok) {
      showToast('Failed to save note — try again');
      throw new Error('note save failed');
    }
  }

  const sv = record ? severityBadge(record.severity || '') : null;
  const rv = record ? resolvedBadge(record.resolved || '') : null;
  const ts = record?.timestamp || '';

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal / Emergencies" page="Emergency Detail" sub={record ? `${record.clientName} — ${record.callerName || 'Unknown caller'}` : 'Loading...'} />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        {/* Back link */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/va/emergencies" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--a1)', textDecoration: 'none' }}>
            ← Back to all emergencies
          </Link>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            Loading emergency details...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && !error && record && (
          <>
            {/* Header card with status pills */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '3px', background: rv?.label === 'Open' ? 'var(--a4)' : 'var(--a3)' }} />
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: 'var(--ink)', marginBottom: '4px' }}>
                    {record.callerName || 'Unknown caller'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {record.clientName} <span style={{ color: 'var(--faint)', margin: '0 6px' }}>•</span> {ts ? `${ts.slice(0,10)} ${ts.slice(11,16)}` : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sv && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: sv.bg, color: sv.color }}>{record.severity || '—'}</span>}
                  {rv && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: rv.bg, color: rv.color }}>{rv.label}</span>}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Details</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Caller name" value={record.callerName || '—'} />
                <Field label="Phone" value={record.phone || '—'} tel={record.phone} />
                <Field label="Postcode" value={record.type || '—'} />
                <Field label="Issue" value={record.severity || '—'} />
                <Field label="Client" value={record.clientName} />
                <Field label="Timestamp" value={ts || '—'} mono />
              </div>
            </div>

            {/* Notes timeline placeholder */}
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Internal notes</div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'var(--slate)', color: 'var(--muted)', border: '1px solid var(--divider)' }}>PHASE 4</span>
              </div>
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>
                Notes timeline will load here in Phase 4.
              </div>
            </div>

            {/* Action buttons (placeholders — wired in Phase 4) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ActionButton label="Claim" onClick={() => setClaimOpen(true)} primary />
              <ActionButton label="Release" onClick={() => setReleaseOpen(true)} />
              <ActionButton label="Set status" onClick={() => setStatusOpen(true)} />
              <ActionButton label="Add note" onClick={() => setNoteOpen(true)} />
            </div>
          </>
        )}

        {/* Toast */}
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

        <SelectModal
          isOpen={statusOpen}
          title="Set emergency status"
          message="This will be visible to all VAs and the client."
          options={[
            { value: 'open',         label: 'Open',         description: 'Awaiting action' },
            { value: 'acknowledged', label: 'Acknowledged', description: 'VA has seen, action pending' },
            { value: 'resolved',     label: 'Resolved',     description: 'Customer call complete, no further action' },
            { value: 'escalated',    label: 'Escalated',    description: 'Passed to owner / engineer for follow-up' },
          ]}
          initialValue={
            isResolved(record?.resolved) ? 'resolved' :
            (record?.resolved && !['no', 'yes'].includes(record.resolved)) ? record.resolved :
            'open'
          }
          confirmLabel="Save"
          onClose={() => setStatusOpen(false)}
          onConfirm={handleSetStatus}
        />

        <ConfirmModal
          isOpen={claimOpen}
          title="Claim emergency"
          message="Assign this emergency to yourself. You'll be responsible for following up with the client."
          confirmLabel="Claim"
          onClose={() => setClaimOpen(false)}
          onConfirm={handleClaim}
        />

        <ConfirmModal
          isOpen={releaseOpen}
          title="Release emergency"
          message="Remove yourself from this emergency so another VA can pick it up."
          confirmLabel="Release"
          onClose={() => setReleaseOpen(false)}
          onConfirm={handleRelease}
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
