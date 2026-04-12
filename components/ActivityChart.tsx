'use client';
import { useEffect, useRef } from 'react';

interface ActivityChartProps {
  interactions: Array<{ timestamp: string }>;
}

export default function ActivityChart({ interactions }: ActivityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Build last 7 days data
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    interactions.forEach((it) => {
      const day = it.timestamp?.slice(0, 10);
      if (day && day in days) days[day]++;
    });

    const labels = Object.keys(days).map((d) => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
    });
    const data = Object.values(days);

    import('chart.js').then(({ Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip }) => {
      Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      if (!canvasRef.current) return;

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Calls',
            data,
            borderColor: '#C9A84C',
            backgroundColor: 'rgba(201,168,76,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#C9A84C',
            pointRadius: 4,
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#888', font: { size: 11 } } },
            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#888', font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [interactions]);

  return (
    <div style={{ position: 'relative', height: '220px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
