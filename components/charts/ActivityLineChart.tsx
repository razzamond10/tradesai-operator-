'use client';
import { useEffect, useRef } from 'react';

function safeValue(raw: string): number {
  const n = parseFloat((raw || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '') || '0');
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
}

interface Props {
  interactions: any[];
  bookings: any[];
  mode: 'today' | 'week' | 'month';
}

export default function ActivityLineChart({ interactions, bookings, mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let labels: string[] = [];
    let callData: number[] = [];
    let bookingData: number[] = [];
    let revenueData: number[] = [];

    if (mode === 'today') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      callData = new Array(24).fill(0);
      bookingData = new Array(24).fill(0);
      revenueData = new Array(24).fill(0);
      const today = new Date().toISOString().slice(0, 10);
      interactions.filter(i => (i.timestamp || '').startsWith(today)).forEach(i => {
        const h = parseInt((i.timestamp || '').slice(11, 13), 10);
        if (!isNaN(h)) callData[h]++;
      });
      bookings.filter(b => (b.timestamp || '').startsWith(today)).forEach(b => {
        const h = parseInt((b.timestamp || '').slice(11, 13), 10);
        if (!isNaN(h)) {
          bookingData[h]++;
          const v = safeValue(b.value);
          revenueData[h] += Math.round(v / 100);
        }
      });
    } else if (mode === 'week') {
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
      }
      labels = days.map(d => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }));
      callData = days.map(d => interactions.filter(i => (i.timestamp || '').startsWith(d)).length);
      bookingData = days.map(d => bookings.filter(b => (b.timestamp || '').startsWith(d)).length);
      revenueData = days.map(d => {
        const v = bookings.filter(b => (b.timestamp || '').startsWith(d))
          .reduce((s, b) => s + safeValue(b.value), 0);
        return Math.round(v / 100);
      });
    } else {
      // month — group by actual calendar month from the data (last 6 months that have entries)
      // Uses YYYY-MM prefix so it works with any data age, not just the last 5 weeks from today
      const monthMap: Record<string, { calls: number; bookings: number; revenue: number }> = {};
      interactions.forEach(i => {
        const mo = (i.timestamp || '').slice(0, 7);
        if (mo.length < 7) return;
        if (!monthMap[mo]) monthMap[mo] = { calls: 0, bookings: 0, revenue: 0 };
        monthMap[mo].calls++;
      });
      bookings.forEach(b => {
        const mo = (b.timestamp || '').slice(0, 7);
        if (mo.length < 7) return;
        if (!monthMap[mo]) monthMap[mo] = { calls: 0, bookings: 0, revenue: 0 };
        monthMap[mo].bookings++;
        monthMap[mo].revenue += safeValue(b.value);
      });
      const sortedMonths = Object.keys(monthMap).sort().slice(-6);
      if (sortedMonths.length === 0) {
        labels = ['No data']; callData = [0]; bookingData = [0]; revenueData = [0];
      } else {
        labels = sortedMonths.map(mo => {
          const [y, m] = mo.split('-');
          return new Date(parseInt(y), parseInt(m) - 1, 1)
            .toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        });
        callData    = sortedMonths.map(mo => monthMap[mo].calls);
        bookingData = sortedMonths.map(mo => monthMap[mo].bookings);
        revenueData = sortedMonths.map(mo => Math.round(monthMap[mo].revenue / 100));
      }
    }

    import('chart.js').then(({ Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend }) => {
      Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Calls', data: callData, borderColor: '#3D1FA8', backgroundColor: 'rgba(61,31,168,0.06)', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
            { label: 'Bookings', data: bookingData, borderColor: '#0A7455', backgroundColor: 'rgba(10,116,85,0.05)', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
            { label: 'Revenue ÷100', data: revenueData, borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.05)', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 10 }, maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions, bookings, mode]);

  return <div style={{ position: 'relative', height: '180px' }}><canvas ref={canvasRef} /></div>;
}
