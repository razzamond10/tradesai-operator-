/**
 * Treats both legacy ('yes') and new enum ('resolved') as resolved.
 * Anything else (including '', 'no', 'open', 'acknowledged', 'escalated')
 * counts as not-resolved → open list.
 */
export function isResolved(r: string | undefined | null): boolean {
  const v = (r || '').toLowerCase();
  return v === 'yes' || v === 'resolved';
}

/**
 * Derive severity from issue text when the sheet has no severity column.
 * Mirrors the AI agent's triage logic — gas/CO/flooding/structural → high;
 * no-heating/burst → medium; everything else → low.
 * Pure function of the issue string. Safe to call with empty input.
 */
export function deriveSeverity(issue: string | undefined | null): 'high' | 'medium' | 'low' {
  const v = (issue || '').toLowerCase();
  if (!v) return 'low';

  // HIGH — safety-critical
  if (/\bgas\b|carbon monoxide|\bco\b/.test(v)) return 'high';
  if (/flood|burst/.test(v)) return 'high';
  if (/structural|collapse|fire/.test(v)) return 'high';
  if (/power.*(out|fail|down)|no power/.test(v)) return 'high';

  // MEDIUM — urgent but not safety-critical
  if (/no heating|no hot water/.test(v)) return 'medium';
  if (/leak/.test(v)) return 'medium';

  return 'low';
}
