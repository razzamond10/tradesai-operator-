'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DateRange, Preset, fmtRange, getPresetRange, parseRange, serializeRange } from '@/lib/dateRange';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'Week' },
  { key: 'month',   label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year',    label: 'Year' },
  { key: 'all',     label: 'All' },
];

export function useDateRange(defaultPreset: Preset = 'month'): [DateRange, (r: DateRange) => void] {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const [range, setRangeState] = useState<DateRange>(() => {
    if (!searchParams.get('range')) return getPresetRange(defaultPreset);
    return parseRange(searchParams);
  });

  const setRange = useCallback((r: DateRange) => {
    setRangeState(r);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('range'); params.delete('from'); params.delete('to');
    Object.entries(serializeRange(r)).forEach(([k, v]) => params.set(k, v));
    router.replace(`${pathname ?? ''}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return [range, setRange];
}

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [fromStr, setFromStr] = useState('');
  const [toStr, setToStr]     = useState('');
  const [customErr, setCustomErr] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowCustom(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function applyCustom() {
    if (!fromStr || !toStr) { setCustomErr('Both dates are required.'); return; }
    const from = new Date(fromStr + 'T00:00:00');
    const to   = new Date(toStr   + 'T23:59:59');
    if (from > to) { setCustomErr('"From" must be before "To".'); return; }
    onChange({ preset: 'custom', from, to });
    setShowCustom(false);
    setCustomErr('');
  }

  const customLabel = value.preset === 'custom' ? fmtRange(value) : 'Custom ▼';

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px',
      padding: '7px 14px', marginBottom: '14px',
      display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
      boxShadow: 'var(--shadow-s)', position: 'relative',
    }}>
      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginRight: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        Range:
      </span>
      <div className="drf-presets" style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap', overflowX: 'auto', flexShrink: 1, minWidth: 0 }}>
        {PRESETS.map(({ key, label }) => {
          const active = value.preset === key;
          return (
            <button key={key} onClick={() => onChange(getPresetRange(key))} style={{
              padding: '4px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
              border: active ? 'none' : '1px solid var(--divider)',
              background: active ? 'var(--a1)' : '#fff',
              color: active ? '#fff' : 'var(--ink)',
              cursor: 'pointer', fontFamily: '"Inter",sans-serif',
              transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {label}
            </button>
          );
        })}
        <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => {
              if (!showCustom && value.preset === 'custom') {
                setFromStr(value.from.toISOString().slice(0, 10));
                setToStr(value.to.toISOString().slice(0, 10));
              }
              setShowCustom(p => !p);
            }}
            style={{
              padding: '4px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
              border: value.preset === 'custom' ? 'none' : '1px solid var(--divider)',
              background: value.preset === 'custom' ? 'var(--a2)' : '#fff',
              color: value.preset === 'custom' ? '#1A0A3C' : 'var(--ink)',
              cursor: 'pointer', fontFamily: '"Inter",sans-serif',
              transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            {customLabel}
          </button>
          {showCustom && (
            <div style={{
              position: 'absolute', top: '34px', left: 0, zIndex: 300,
              background: '#fff', border: '1px solid var(--divider)', borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(26,10,60,0.18)', padding: '14px 16px', width: '250px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Custom range</div>
              {(['From', 'To'] as const).map((label, li) => (
                <div key={label} style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: '3px' }}>{label}</label>
                  <input type="date"
                    value={li === 0 ? fromStr : toStr}
                    min={li === 1 ? fromStr : undefined}
                    onChange={e => li === 0 ? setFromStr(e.target.value) : setToStr(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--divider)', fontSize: '12px', outline: 'none', fontFamily: '"Inter",sans-serif', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              {customErr && <div style={{ fontSize: '10px', color: 'var(--a4)', marginBottom: '8px' }}>{customErr}</div>}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={applyCustom} style={{ flex: 1, padding: '7px', borderRadius: '7px', background: 'var(--a1)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}>Apply</button>
                <button onClick={() => { setShowCustom(false); setCustomErr(''); }} style={{ padding: '7px 12px', borderRadius: '7px', background: 'var(--slate)', color: 'var(--ink)', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {value.preset !== 'all' && (
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {fmtRange(value)}
        </span>
      )}
      <style>{`.drf-presets::-webkit-scrollbar{display:none}.drf-presets{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
