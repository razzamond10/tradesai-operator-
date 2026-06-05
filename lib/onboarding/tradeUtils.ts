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
