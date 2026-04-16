'use client';
import { useEffect, useRef } from 'react';

function safeValue(raw: string): number {
  const n = parseFloat((raw || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '') || '0');
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
}

const NO_DATA_STYLE: React.CSSProperties = {
  height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', gap: '6px',
};

export default function BarChart({ bookings }: { bookings: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  if (bookings.length === 0) {
    return (
      <div style={NO_DATA_STYLE}>
        <div style={{ fontSize: '20px' }}>📊</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Not enough data yet</div>
      </div>
    );
  }

  useEffect(() => {
    console.log('[BarChart] render', { bookings: bookings.length, sample: bookings.slice(0,2).map(b => ({ jobType: b.jobType, value: b.value })) });

    const jobRevenue: Record<string, number> = {};
    const jobCount: Record<string, number> = {};
    bookings.forEach(b => {
      const type = b.jobType || 'Other';
      jobRevenue[type] = (jobRevenue[type] || 0) + safeValue(b.value);
      jobCount[type] = (jobCount[type] || 0) + 1;
    });

    const totalRevenue = Object.values(jobRevenue).reduce((s, v) => s + v, 0);
    const useCount = totalRevenue === 0;

    const source = useCount ? jobCount : jobRevenue;
    const entries = Object.entries(source).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const labels = entries.map(([l]) => l.length > 12 ? l.slice(0, 12) + '…' : l);
    const data = entries.map(([, v]) => Math.round(v));
    const colors = ['#3D1FA8', '#0A7455', '#C9A84C', '#6B3FD0', '#C01830', '#9A6200'];

    const xFormatter = useCount
      ? (v: any) => `${v}`
      : (v: any) => `£${v}`;
    const tooltipFormatter = useCount
      ? (ctx: any) => ` ${ctx.raw} booking${ctx.raw === 1 ? '' : 's'}`
      : (ctx: any) => ` £${ctx.raw.toLocaleString()}`;

    console.log('[BarChart] computed', { useCount, labels, data });

    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) { console.warn('[BarChart] canvas not ready'); return; }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['No data'],
          datasets: [{
            data: data.length > 0 ? data : [0],
            backgroundColor: colors,
            borderRadius: 4,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: tooltipFormatter } } },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, callback: xFormatter } },
            y: { grid: { display: false }, ticks: { color: '#3D2580', font: { size: 10 } } },
          },
        },
      });
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [bookings]);

  return <div style={{ position: 'relative', height: '160px' }}><canvas ref={canvasRef} /></div>;
}
