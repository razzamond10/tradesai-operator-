'use client';
import { useState, useEffect } from 'react';

type TimeFormat = 'time' | 'date' | 'dateLong' | 'monthYear' | 'isoDate';

function fmt(d: Date, kind: TimeFormat): string {
  switch (kind) {
    case 'time':
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    case 'date':
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    case 'dateLong':
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    case 'monthYear':
      return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    case 'isoDate':
      return d.toISOString().slice(0, 10);
  }
}

/**
 * Returns a live time/date string that's hydration-safe.
 * First render returns '' (matches SSR), then useEffect populates and ticks.
 * Default tick is 60s — enough for HH:mm clocks without burning CPU.
 */
export function useClientTime(kind: TimeFormat, tickMs = 60000): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const update = () => setValue(fmt(new Date(), kind));
    update();
    const id = setInterval(update, tickMs);
    return () => clearInterval(id);
  }, [kind, tickMs]);
  return value;
}
