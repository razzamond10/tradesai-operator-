'use client';
import { useEffect, useRef } from 'react';

function safeValue(raw: string): number {
  const n = parseFloat((raw || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '') || '0');
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
}

export default function BarChart({ bookings }: { bookings: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const jobRevenue: Record<string, number> = {};
    bookings.forEach(b => {
      const type = b.jobType || 'Other';
      jobRevenue[type] = (jobRevenue[type] || 0) + safeValue(b.value);
    });

    const entries = Object.entries(jobRevenue).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const labels = entries.map(([l]) => l.length > 12 ? l.slice(0, 12) + '…' : l);
    const data = entries.map(([, v]) => Math.round(v));
    const colors = ['#3D1FA8', '#0A7455', '#C9A84C', '#6B3FD0', '#C01830', '#9A6200'];

    import('chart.js').then(({ Chart, CategoryScale, LinearScale, BarElement, Tooltip }) => {
      Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;

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
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` £${ctx.raw.toLocaleString()}` } } },
          scales: {
            x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, callback: (v: any) => `£${v}` } },
            y: { grid: { display: false }, ticks: { color: '#3D2580', font: { size: 10 } } },
          },
        },
      });
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [bookings]);

  return <div style={{ position: 'relative', height: '160px' }}><canvas ref={canvasRef} /></div>;
}
