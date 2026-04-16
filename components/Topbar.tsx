'use client';
import { useEffect, useState } from 'react';

interface TopbarProps {
  breadcrumb: string;
  page: string;
  sub?: string;
  onRefresh?: () => void;
  period?: string;
  onPeriod?: (p: string) => void;
}

export default function Topbar({ breadcrumb, page, sub, onRefresh, period, onPeriod }: TopbarProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB'));
      setDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: '#fff',
      height: '52px',
      borderBottom: '1px solid #D8D0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 3px rgba(26,10,60,0.06)',
      flexShrink: 0, fontFamily: '"Inter",system-ui,sans-serif',
    }}>
      {/* Gold gradient line at very bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#C9A84C,#E8D080,#C9A84C,transparent)' }} />

      <div style={{ fontSize: '12px', color: '#7468A0', fontWeight: 500 }}>
        {breadcrumb} / <span style={{ color: '#1A0A3C', fontWeight: 600 }}>{page}</span>
        {sub && <span style={{ fontSize: '10px', color: '#7468A0', fontWeight: 400 }}> — {sub}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="topbar-clock" style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '12px', color: '#3D2580', fontWeight: 500, letterSpacing: '.5px' }}>{time}</div>
          <div style={{ fontSize: '10px', color: '#7468A0' }}>{date}</div>
        </div>
        <div className="topbar-divider" style={{ width: '1px', height: '24px', background: '#D8D0F0' }} />
        {onPeriod && ['Today','Week','Month'].map((p) => (
          <button key={p} onClick={() => onPeriod(p.toLowerCase())} style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid #D8D0F0',
            background: period === p.toLowerCase() ? '#1A0A3C' : '#fff',
            color: period === p.toLowerCase() ? '#fff' : '#3D2580',
            fontFamily: '"Inter",sans-serif', transition: 'all .15s',
            boxShadow: '0 1px 2px rgba(26,10,60,0.06)',
          }}>
            {p}
          </button>
        ))}
        {onRefresh && (
          <button onClick={onRefresh} style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid #D8D0F0', background: '#fff',
            color: '#3D2580', fontFamily: '"Inter",sans-serif', transition: 'all .15s',
          }}>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
