'use client';
import { useState, useCallback } from 'react';
import type { Booking } from '@/lib/sheets';

// ── Date parsing ──────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function parseScheduledDate(raw: string): { date: string; time: string } | null {
  if (!raw) return null;
  // ISO: "2026-04-18 14:00" or "2026-04-18T14:00"
  let m = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  // ISO date only: "2026-04-18"
  m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return { date: m[1], time: '' };
  // DD/MM/YYYY HH:MM or DD/MM/YYYY
  m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?/);
  if (m) {
    const d = m[1].padStart(2, '0'), mo = m[2].padStart(2, '0');
    return { date: `${m[3]}-${mo}-${d}`, time: m[4] || '' };
  }
  // "Saturday, 19 April 2026 at 14:00" or "19 April 2026 14:00"
  m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(?:at\s+)?(\d{2}:\d{2}))?/i);
  if (m) {
    const mon = MONTH_MAP[m[2].toLowerCase().slice(0, 3)];
    if (mon) {
      const d = m[1].padStart(2, '0'), mo = String(mon).padStart(2, '0');
      return { date: `${m[3]}-${mo}-${d}`, time: m[4] || '' };
    }
  }
  return null;
}

// ── Status helpers ────────────────────────────────────────────────────────────

type StatusKind = 'booked' | 'emergency' | 'completed' | 'cancelled' | 'other';

function classifyStatus(status: string): StatusKind {
  const s = (status || '').toLowerCase();
  if (s.includes('emergency') || s.includes('urgent')) return 'emergency';
  if (s.includes('cancel') || s.includes('declin') || s.includes('reject') || s.includes('no show')) return 'cancelled';
  if (s.includes('complet') || s.includes('done') || s.includes('paid')) return 'completed';
  if (s.includes('confirm') || s.includes('booked') || s.includes('schedul') || s.includes('new') || s.includes('await') || s.includes('pending')) return 'booked';
  return 'other';
}

const STATUS_DOT: Record<StatusKind, string> = {
  booked: '#0A7455',
  emergency: '#C01830',
  completed: '#3D1FA8',
  cancelled: '#999',
  other: '#C9A84C',
};

const STATUS_CHIP_BG: Record<StatusKind, string> = {
  booked: 'rgba(10,116,85,0.1)',
  emergency: 'rgba(192,24,48,0.1)',
  completed: 'rgba(61,31,168,0.1)',
  cancelled: 'rgba(100,100,100,0.08)',
  other: 'rgba(201,168,76,0.1)',
};

const STATUS_LABEL: Record<StatusKind, string> = {
  booked: 'Booked',
  emergency: 'Emergency',
  completed: 'Completed',
  cancelled: 'Cancelled',
  other: 'Pending',
};

// ── Calendar math ─────────────────────────────────────────────────────────────

/** Returns the ISO "YYYY-MM-DD" strings for every day in a 6-row Mon-Sun grid
 *  that covers the given year/month. */
function buildCalendarGrid(year: number, month: number): string[][] {
  // Day-of-week for the 1st: 0=Sun..6=Sat → convert to Mon-based (0=Mon..6=Sun)
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: string[] = [];
  // Pad with days from previous month
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 2, prevMonthDays - i);
    cells.push(d.toISOString().slice(0, 10));
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    cells.push(dt.toISOString().slice(0, 10));
  }
  // Pad to 6 rows × 7 cols = 42
  let next = 1;
  while (cells.length < 42) {
    const d = new Date(year, month, next++);
    cells.push(d.toISOString().slice(0, 10));
  }
  // Split into weeks
  const rows: string[][] = [];
  for (let i = 0; i < 42; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ── Drawer ────────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function BookingDrawer({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const kind = classifyStatus(booking.status);
  const dot = STATUS_DOT[kind];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(26,10,60,0.35)',
          zIndex: 200, backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px',
        maxWidth: '100vw', background: '#fff',
        zIndex: 201, boxShadow: '-4px 0 32px rgba(26,10,60,0.18)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '"Inter",system-ui,sans-serif',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{booking.customerName || 'Unknown'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0,
                display: 'inline-block',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: 600,
                color: dot,
                background: STATUS_CHIP_BG[kind],
                padding: '2px 8px', borderRadius: '10px',
              }}>{booking.status || STATUS_LABEL[kind]}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--slate)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '16px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <DetailRow label="Scheduled Date" value={booking.bookingDateReadable || booking.scheduledDate} />
          <DetailRow label="Customer" value={booking.customerName} />
          <DetailRow label="Phone" value={booking.phone} />
          <DetailRow label="Postcode" value={booking.postcode} />
          <DetailRow label="Issue / Job Type" value={booking.jobType} />
          <DetailRow label="Value" value={booking.value} />
          <DetailRow label="Calendar Event" value={booking.calendarEventId} />
          <DetailRow label="Logged" value={booking.timestamp} />
        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  bookings: Booking[];
}

export default function BookingsCalendar({ bookings }: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [year, setYear] = useState(() => parseInt(todayStr.slice(0, 4)));
  const [month, setMonth] = useState(() => parseInt(todayStr.slice(5, 7)));
  const [selected, setSelected] = useState<Booking | null>(null);

  // Build lookup: date → bookings[]
  const byDate = new Map<string, Booking[]>();
  bookings.forEach((b) => {
    const parsed = parseScheduledDate(b.scheduledDate);
    if (!parsed) return;
    const list = byDate.get(parsed.date) || [];
    list.push({ ...b, _parsedTime: parsed.time } as any);
    byDate.set(parsed.date, list);
  });

  const grid = buildCalendarGrid(year, month);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  // All bookings in current month (for mobile list view)
  const monthBookings = [...byDate.entries()]
    .filter(([d]) => d.startsWith(currentMonthStr))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div>
      {/* ── Navigation header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{
            background: 'var(--slate)', border: '1px solid var(--divider)', borderRadius: '7px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
          <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--ink)', minWidth: '160px', textAlign: 'center' }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={nextMonth} style={{
            background: 'var(--slate)', border: '1px solid var(--divider)', borderRadius: '7px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>›</button>
        </div>
        <button onClick={() => { const t = new Date(); setYear(t.getFullYear()); setMonth(t.getMonth() + 1); }} style={{
          background: 'var(--slate)', border: '1px solid var(--divider)', borderRadius: '7px',
          padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: 'var(--ink)',
          fontFamily: '"Inter",sans-serif',
        }}>Today</button>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {(Object.entries(STATUS_DOT) as [StatusKind, string][]).map(([kind, color]) => (
          <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {STATUS_LABEL[kind]}
          </div>
        ))}
      </div>

      {/* ── Desktop calendar grid ── */}
      <div className="cal-desktop" style={{}}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
          {DOW_LABELS.map((d) => (
            <div key={d} style={{
              padding: '6px 0', textAlign: 'center',
              fontSize: '10px', fontWeight: 700, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
            {week.map((dateStr) => {
              const isToday = dateStr === todayStr;
              const inMonth = dateStr.startsWith(currentMonthStr);
              const dayBookings = byDate.get(dateStr) || [];
              const dayNum = parseInt(dateStr.slice(8));

              return (
                <div key={dateStr} style={{
                  minHeight: '90px', padding: '6px',
                  background: isToday ? 'rgba(61,31,168,0.06)' : '#fff',
                  border: isToday ? '1.5px solid var(--a1)' : '1px solid var(--divider)',
                  borderRadius: '6px',
                  opacity: inMonth ? 1 : 0.35,
                  verticalAlign: 'top',
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'var(--a1)' : 'var(--ink)',
                    marginBottom: dayBookings.length ? '5px' : '0',
                    fontFamily: '"Inter Tight",sans-serif',
                  }}>{dayNum}</div>

                  {dayBookings.slice(0, 3).map((b, bi) => {
                    const kind = classifyStatus(b.status);
                    const dot = STATUS_DOT[kind];
                    const time = (b as any)._parsedTime;
                    const name = (b.customerName || '').split(' ').slice(0, 2).join(' ');
                    return (
                      <button key={bi} onClick={() => setSelected(b)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        width: '100%', padding: '3px 5px',
                        background: STATUS_CHIP_BG[kind],
                        border: 'none', borderRadius: '4px',
                        cursor: 'pointer', marginBottom: '2px',
                        textAlign: 'left', overflow: 'hidden',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {name}{time ? ` • ${time}` : ''}
                        </span>
                      </button>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <div style={{ fontSize: '9px', color: 'var(--muted)', paddingLeft: '5px', marginTop: '1px' }}>
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Mobile list view ── */}
      <div className="cal-mobile" style={{ display: 'none' }}>
        {monthBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: '13px' }}>
            No bookings this month
          </div>
        ) : monthBookings.map(([dateStr, dayBks]) => {
          const dt = new Date(dateStr + 'T12:00:00');
          const label = dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: isToday ? 'var(--a1)' : 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '6px', paddingBottom: '4px',
                borderBottom: '1px solid var(--divider)',
              }}>
                {label}{isToday ? ' — Today' : ''}
              </div>
              {dayBks.map((b, bi) => {
                const kind = classifyStatus(b.status);
                const dot = STATUS_DOT[kind];
                const time = (b as any)._parsedTime;
                return (
                  <button key={bi} onClick={() => setSelected(b)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 12px',
                    background: '#fff', border: '1px solid var(--divider)',
                    borderRadius: '8px', cursor: 'pointer', marginBottom: '6px',
                    textAlign: 'left',
                  }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.customerName || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {time || ''}{b.jobType ? (time ? ' · ' : '') + b.jobType : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: dot, fontWeight: 600, flexShrink: 0 }}>{b.status || STATUS_LABEL[kind]}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Drawer ── */}
      {selected && <BookingDrawer booking={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @media (max-width: 640px) {
          .cal-desktop { display: none !important; }
          .cal-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
