'use client';
import { useEffect, useRef } from 'react';

interface Segment { label: string; value: number; color: string; }
interface Props { data: Segment[]; total: number; centerLabel: string; }

export default function DonutChart({ data, total, centerLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const segments = data.length > 0 ? data : [{ label: 'None', value: 1, color: '#E0E0EE' }];

    import('chart.js').then(({ Chart, DoughnutController, ArcElement, Tooltip }) => {
      Chart.register(DoughnutController, ArcElement, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;

      chartRef.current = new Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels: segments.map(s => s.label),
          datasets: [{ data: segments.map(s => s.value), backgroundColor: segments.map(s => s.color), borderWidth: 0, hoverOffset: 4 }],
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}` } } },
        },
      });
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '120px' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '120px' }} />
      <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '18px', fontWeight: 900, color: '#1A0A3C', letterSpacing: '-1px', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '8px', color: '#7468A0', letterSpacing: '.5px', marginTop: '1px' }}>{centerLabel}</div>
      </div>
    </div>
  );
}
