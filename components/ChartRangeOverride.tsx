'use client';
import { useState, useRef, useEffect } from 'react';
import { DateRange, Preset, fmtRange, getPresetRange } from '@/lib/dateRange';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'Last 7 days' },
  { key: 'month',   label: 'Last 30 days' },
  { key: 'quarter', label: 'Last 90 days' },
  { key: 'year',    label: 'This year' },
  { key: 'all',     label: 'All time' },
];

interface Props {
  pageRange: DateRange;
  override: DateRange | null;
  onChange: (r: DateRange | null) => void;
}

export default function ChartRangeOverride({ override, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isOverridden = override !== null;
  const label = isOverridden ? `🔒 ${fmtRange(override!)}` : '📅 Range ▼';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
          border: 'none', cursor: 'pointer', fontFamily: '"Inter",sans-serif',
          background: isOverridden ? 'var(--a2b)' : 'var(--slate)',
          color: isOverridden ? 'var(--a6)' : 'var(--muted)',
          transition: 'all .15s',
        }}
      >
        {label}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '28px', right: 0, zIndex: 300,
          background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(26,10,60,0.18)', padding: '8px', minWidth: '160px',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', padding: '4px 8px 6px' }}>Chart range</div>
          {PRESETS.map(({ key, label: pl }) => (
            <button key={key} onClick={() => { onChange(getPresetRange(key)); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px',
              background: (override?.preset === key) ? 'var(--a1b)' : 'transparent',
              color: (override?.preset === key) ? 'var(--a1)' : 'var(--ink)',
              border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', fontFamily: '"Inter",sans-serif',
            }}>{pl}</button>
          ))}
          {isOverridden && (
            <button onClick={() => { onChange(null); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px',
              background: 'transparent', color: 'var(--muted)', borderTop: '1px solid var(--divider)',
              border: 'none', borderRadius: '0 0 6px 6px',
              fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter",sans-serif',
              marginTop: '4px', paddingTop: '10px',
            }}>✕ Reset to page filter</button>
          )}
        </div>
      )}
    </div>
  );
}
