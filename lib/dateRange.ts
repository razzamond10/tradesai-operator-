export type Preset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface DateRange {
  preset: Preset;
  from: Date;
  to: Date;
}

export function getPresetRange(preset: Preset, now?: Date): DateRange {
  const n = now ?? new Date();
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const eod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  switch (preset) {
    case 'today':
      return { preset, from: sod(n), to: eod(n) };
    case 'week': {
      const from = sod(new Date(n)); from.setDate(from.getDate() - 6);
      return { preset, from, to: eod(n) };
    }
    case 'month': {
      const from = sod(new Date(n)); from.setDate(from.getDate() - 29);
      return { preset, from, to: eod(n) };
    }
    case 'quarter': {
      const from = sod(new Date(n)); from.setDate(from.getDate() - 89);
      return { preset, from, to: eod(n) };
    }
    case 'year': {
      const y = n.getFullYear();
      return { preset, from: new Date(y, 0, 1, 0, 0, 0), to: new Date(y, 11, 31, 23, 59, 59, 999) };
    }
    case 'all':
      return { preset, from: new Date(2000, 0, 1), to: eod(n) };
    case 'custom':
      return { preset, from: sod(n), to: eod(n) };
  }
}

export function filterByRange<T>(
  items: T[],
  getTs: (item: T) => string | undefined,
  range: DateRange,
): T[] {
  if (range.preset === 'all') return items;
  const lo = range.from.getTime();
  const hi = range.to.getTime();
  return items.filter(item => {
    const raw = getTs(item);
    if (!raw) return false;
    const ms = new Date(raw.replace(' ', 'T')).getTime();
    return !isNaN(ms) && ms >= lo && ms <= hi;
  });
}

export function fmtRange(range: DateRange): string {
  const s = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const l = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  switch (range.preset) {
    case 'today':   return 'Today';
    case 'week':    return 'Last 7 days';
    case 'month':   return 'Last 30 days';
    case 'quarter': return 'Last 90 days';
    case 'year':    return String(range.from.getFullYear());
    case 'all':     return 'All time';
    case 'custom': {
      const sy = range.from.getFullYear(), ey = range.to.getFullYear();
      return sy === ey ? `${s(range.from)} – ${l(range.to)}` : `${l(range.from)} – ${l(range.to)}`;
    }
  }
}

export function rangeSubLabel(range: DateRange): string {
  switch (range.preset) {
    case 'today':   return 'today';
    case 'week':    return 'last 7 days';
    case 'month':   return 'last 30 days';
    case 'quarter': return 'last 90 days';
    case 'year':    return `in ${range.from.getFullYear()}`;
    case 'all':     return 'all time';
    case 'custom':  return fmtRange(range).toLowerCase();
  }
}

export function parseRange(params: URLSearchParams): DateRange {
  const preset = params.get('range') as Preset | null;
  const valid: Preset[] = ['today', 'week', 'month', 'quarter', 'year', 'all', 'custom'];
  if (!preset || !valid.includes(preset)) return getPresetRange('month');
  if (preset === 'custom') {
    const fromStr = params.get('from'), toStr = params.get('to');
    if (fromStr && toStr) {
      const from = new Date(fromStr + 'T00:00:00');
      const to   = new Date(toStr   + 'T23:59:59');
      if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
        return { preset: 'custom', from, to };
      }
    }
  }
  return getPresetRange(preset);
}

export function serializeRange(range: DateRange): Record<string, string> {
  if (range.preset === 'custom') {
    return {
      range: 'custom',
      from: range.from.toISOString().slice(0, 10),
      to:   range.to.toISOString().slice(0, 10),
    };
  }
  return { range: range.preset };
}
