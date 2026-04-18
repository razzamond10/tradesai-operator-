'use client';
import { useEffect, useRef } from 'react';
import { getPresetRange, type DateRange } from '@/lib/dateRange';

function safeValue(raw: string): number {
  const n = parseFloat((raw || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '') || '0');
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
}

function getDisplayMode(range: DateRange): 'hourly' | 'daily' | 'monthly' {
  if (range.preset === 'today') return 'hourly';
  const diffDays = (range.to.getTime() - range.from.getTime()) / 86400000;
  return diffDays > 90 ? 'monthly' : 'daily';
}

const NO_DATA_STYLE: React.CSSProperties = {
  width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', gap: '6px',
};

interface Props {
  interactions: any[];
  bookings: any[];
  range?: DateRange;
  /** @deprecated use range instead */
  mode?: 'today' | 'week' | 'month';
}

export default function ActivityLineChart({ interactions, bookings, range: rangeProp, mode }: Props) {
  const range: DateRange = rangeProp ?? (
    mode === 'today' ? getPresetRange('today') :
    mode === 'week'  ? getPresetRange('week')  :
    getPresetRange('month')
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  if (interactions.length === 0 && bookings.length === 0) {
    return (
      <div style={NO_DATA_STYLE}>
        <div style={{ fontSize: '22px' }}>📊</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>No data in this range</div>
        <div style={{ fontSize: '10px', color: 'var(--faint, #B0A8D0)' }}>Try a wider date range</div>
      </div>
    );
  }

  useEffect(() => {
    const displayMode = getDisplayMode(range);
    let labels: string[] = [];
    let callData: number[] = [];
    let bookingData: number[] = [];
    let revenueData: number[] = [];

    if (displayMode === 'hourly') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      callData = new Array(24).fill(0);
      bookingData = new Array(24).fill(0);
      revenueData = new Array(24).fill(0);
      const today = `${range.from.getFullYear()}-${String(range.from.getMonth()+1).padStart(2,'0')}-${String(range.from.getDate()).padStart(2,'0')}`;
      interactions.filter(i => (i.timestamp || '').startsWith(today)).forEach(i => {
        const h = parseInt((i.timestamp || '').slice(11, 13), 10);
        if (!isNaN(h) && h >= 0 && h < 24) callData[h]++;
      });
      bookings.filter(b => (b.timestamp || '').startsWith(today)).forEach(b => {
        const h = parseInt((b.timestamp || '').slice(11, 13), 10);
        if (!isNaN(h) && h >= 0 && h < 24) {
          bookingData[h]++;
          revenueData[h] += Math.round(safeValue(b.value) / 100);
        }
      });
    } else if (displayMode === 'daily') {
      // Generate daily buckets from range.from to range.to (max 90 points)
      const dates: string[] = [];
      const cur = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
      const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
      while (cur <= end && dates.length < 90) {
        dates.push(`${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`);
        cur.setDate(cur.getDate() + 1);
      }
      labels = dates.map(d => {
        const [y, m, day] = d.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(day))
          .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      });
      callData    = dates.map(d => interactions.filter(i => (i.timestamp || '').startsWith(d)).length);
      bookingData = dates.map(d => bookings.filter(b => (b.timestamp || '').startsWith(d)).length);
      revenueData = dates.map(d => Math.round(
        bookings.filter(b => (b.timestamp || '').startsWith(d)).reduce((s, b) => s + safeValue(b.value), 0) / 100
      ));
    } else {
      // monthly — group by YYYY-MM across all data received
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
      const sortedMonths = Object.keys(monthMap).sort();
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

    import('chart.js').then(({ Chart, LineController, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend }) => {
      Chart.register(LineController, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) { return; }

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Calls',         data: callData,    borderColor: '#3D1FA8', backgroundColor: 'rgba(61,31,168,0.06)',  borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
            { label: 'Bookings',      data: bookingData, borderColor: '#0A7455', backgroundColor: 'rgba(10,116,85,0.05)',  borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
            { label: 'Revenue ÷100',  data: revenueData, borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.05)', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { left: 8, right: 8, top: 8, bottom: 24 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (items: any[]) => items[0]?.label ?? '',
                label: (item: any) => ` ${item.dataset.label}: ${item.parsed.y}`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { display: true, color: '#7468A0', font: { size: 9 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { display: true, color: '#7468A0', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions, bookings, range]);

  return <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}><canvas ref={canvasRef} /></div>;
}
