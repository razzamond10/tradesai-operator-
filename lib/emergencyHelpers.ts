/**
 * Treats both legacy ('yes') and new enum ('resolved') as resolved.
 * Anything else (including '', 'no', 'open', 'acknowledged', 'escalated')
 * counts as not-resolved → open list.
 */
export function isResolved(r: string | undefined | null): boolean {
  const v = (r || '').toLowerCase();
  return v === 'yes' || v === 'resolved';
}
