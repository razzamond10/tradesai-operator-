// Shared trade-normalisation utilities — used by Step 2 (services checklist) and
// Step 3 (pricing). Keep the map here so it never drifts out of sync.

export const TRADE_SERVICES: Record<string, string[]> = {
  plumbing: [
    'Boiler repair', 'Boiler replacement', 'Boiler service',
    'Drain unblocking', 'Leak/tap repair', 'Burst pipe',
    'Radiator repair/replace', 'Bathroom refit',
  ],
  electrical: [
    'Rewiring', 'Consumer unit replacement', 'EV charger install',
    'EICR/electrical inspection', 'Shower install', 'Emergency call-out',
    'Fault finding', 'Lighting install',
  ],
  'gas/heating': [
    'Central heating system', 'Heat pump install', 'Boiler repair',
    'Boiler replacement', 'Boiler service', 'Gas safety certificate',
    'Radiator install',
  ],
  roofing: [
    'Re-roofing', 'Roof repair', 'Gutter cleaning',
    'Chimney work', 'Fascia/soffit', 'Flat roof', 'Leak repair',
  ],
  building: [
    'Extensions', 'Loft conversion', 'Kitchen fitting',
    'Damp proofing', 'Plastering', 'Decking', 'General building',
  ],
  hvac: [
    'AC install', 'AC servicing', 'Ventilation',
    'Heat pump', 'Ducting', 'Maintenance contract',
  ],
  handyman: [
    'General repairs', 'Flat-pack assembly', 'Painting/decorating',
    'Small plumbing', 'Small electrical', 'Odd jobs',
  ],
};

export const UNIVERSAL_FALLBACK = [
  'Repairs', 'Installations', 'Servicing/Maintenance',
  'Emergency call-outs', 'Inspections/Quotes', 'Other',
];

/** Map raw trade_type string → canonical key in TRADE_SERVICES, or null for universal. */
export function tradeKey(raw: string): string | null {
  const t = (raw || '').trim().toLowerCase();
  if (!t) return null;
  if (t === 'plumbing') return 'plumbing';
  if (t === 'electrical') return 'electrical';
  if (t.includes('gas') || t.includes('heating')) return 'gas/heating';
  if (t === 'roofing') return 'roofing';
  if (t === 'building') return 'building';
  if (t === 'hvac') return 'hvac';
  if (t === 'handyman') return 'handyman';
  return null;
}

export function getServicesForTrade(rawTrade: string): string[] {
  const key = tradeKey(rawTrade);
  return (key ? TRADE_SERVICES[key] : null) ?? UNIVERSAL_FALLBACK;
}

// ── Multi-trade helpers ───────────────────────────────────────────────────────

export interface TradeServiceGroup {
  key: string;       // canonical trade key e.g. 'plumbing'
  label: string;     // display name as user entered e.g. 'Plumbing'
  services: string[];
}

/**
 * Merge services across multiple trades, de-duped (first trade wins on collision).
 * Primary trade (rawTrades[0]) appears first.
 * Falls back to UNIVERSAL_FALLBACK when rawTrades is empty or all unrecognised.
 */
export function getMergedServicesForTrades(rawTrades: string[]): TradeServiceGroup[] {
  const seen = new Set<string>();
  const groups: TradeServiceGroup[] = [];

  for (const raw of rawTrades) {
    const k = tradeKey(raw);
    if (!k) continue;
    const all = TRADE_SERVICES[k] ?? [];
    const unique = all.filter((s) => !seen.has(s));
    unique.forEach((s) => seen.add(s));
    if (unique.length > 0) {
      groups.push({ key: k, label: raw, services: unique });
    }
  }

  if (groups.length === 0) {
    // All trades invalid or empty → universal fallback as a single group
    return [{ key: 'other', label: 'Other', services: [...UNIVERSAL_FALLBACK] }];
  }

  return groups;
}

/**
 * Flat de-duped union of services across all trades — for Step 3 Add dropdown.
 * Falls back to UNIVERSAL_FALLBACK when rawTrades is empty or all unrecognised.
 */
export function getUnionServicesForTrades(rawTrades: string[]): string[] {
  return getMergedServicesForTrades(rawTrades).flatMap((g) => g.services);
}
