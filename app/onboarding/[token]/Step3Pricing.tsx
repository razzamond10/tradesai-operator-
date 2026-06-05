'use client';
import { useState } from 'react';
import { tradeKey, TRADE_SERVICES, UNIVERSAL_FALLBACK } from '@/lib/onboarding/tradeUtils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PricingRow {
  service: string;
  from: number;
  to: number;
}

export interface PricingAnswers {
  rows: PricingRow[];
}

export function step3Valid(p: PricingAnswers | undefined): boolean {
  return (p?.rows.length ?? 0) >= 1;
}

// ── Pricing reference map ─────────────────────────────────────────────────────
// service name → [from, to] in GBP

const PRICING_MAP: Record<string, [number, number]> = {
  // Plumbing
  'Boiler repair':          [150, 400],
  'Boiler replacement':     [1000, 5000],
  'Boiler service':         [150, 300],
  'Drain unblocking':       [150, 350],
  'Leak/tap repair':        [100, 250],
  'Burst pipe':             [150, 400],
  'Radiator repair/replace':[200, 400],
  'Bathroom refit':         [3000, 8000],
  // Electrical
  'Rewiring':               [2000, 6000],
  'Consumer unit replacement':[500, 800],
  'EV charger install':     [800, 1500],
  'EICR/electrical inspection':[150, 300],
  'Shower install':         [300, 600],
  'Emergency call-out':     [90, 150],
  'Fault finding':          [90, 200],
  'Lighting install':       [100, 400],
  // Gas/Heating
  'Central heating system': [2000, 6000],
  'Heat pump install':      [3000, 8000],
  'Gas safety certificate': [80, 150],
  'Radiator install':       [200, 400],
  // Roofing
  'Re-roofing':             [4000, 15000],
  'Roof repair':            [200, 800],
  'Gutter cleaning':        [150, 350],
  'Chimney work':           [500, 2000],
  'Fascia/soffit':          [500, 1500],
  'Flat roof':              [1500, 5000],
  'Leak repair':            [200, 800],
  // Building
  'Extensions':             [15000, 50000],
  'Loft conversion':        [20000, 60000],
  'Kitchen fitting':        [5000, 20000],
  'Damp proofing':          [500, 3000],
  'Plastering':             [300, 800],
  'Decking':                [500, 3000],
  'General building':       [500, 10000],
  // HVAC
  'AC install':             [1500, 4000],
  'AC servicing':           [80, 200],
  'Ventilation':            [500, 2000],
  'Heat pump':              [3000, 8000],
  'Ducting':                [800, 3000],
  'Maintenance contract':   [200, 600],
  // Handyman
  'General repairs':        [50, 200],
  'Flat-pack assembly':     [40, 150],
  'Painting/decorating':    [150, 600],
  'Small plumbing':         [60, 200],
  'Small electrical':       [60, 200],
  'Odd jobs':               [40, 150],
};

// Plumbing core 4 — used when both Step 2 was skipped AND trade is unknown
const PLUMBING_CORE = ['Boiler repair', 'Boiler service', 'Drain unblocking', 'Leak/tap repair'];

function coreForTrade(rawTrade: string): string[] {
  const key = tradeKey(rawTrade);
  if (!key) return PLUMBING_CORE;
  return (TRADE_SERVICES[key] ?? PLUMBING_CORE).slice(0, 4);
}

function priceFor(service: string): [number, number] {
  return PRICING_MAP[service] ?? [0, 0];
}

// Internal row representation (adds `custom` flag stripped before persisting)
interface Row {
  id: string;        // stable React key
  service: string;
  from: number;
  to: number;
  custom: boolean;   // true = user-entered name, show text input
}

let _id = 0;
function nextId() { return String(++_id); }

function makeRow(service: string, custom = false): Row {
  const [from, to] = priceFor(service);
  return { id: nextId(), service, from, to, custom };
}

function initRows(
  initialRows: PricingRow[] | undefined,
  selectedServices: string[],
  rawTrade: string,
): Row[] {
  // Resume flow — draft already has rows
  if (initialRows && initialRows.length > 0) {
    return initialRows.map((r) => ({ ...r, id: nextId(), custom: !PRICING_MAP[r.service] && r.service !== '' }));
  }
  // Step 2 produced selections → use those
  if (selectedServices.length > 0) {
    return selectedServices.map((s) => makeRow(s));
  }
  // Step 2 skipped → trade core fallback (never empty)
  return coreForTrade(rawTrade).map((s) => makeRow(s));
}

function rowsToOutput(rows: Row[]): PricingRow[] {
  return rows.map(({ service, from, to }) => ({ service, from, to }));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialRows?: PricingRow[];   // from draft_json resume flow
  selectedServices: string[];   // from answers.services.selected
  tradeType: string;
  businessName: string;
  onChange: (values: PricingAnswers) => void;
}

export default function Step3Pricing({
  initialRows,
  selectedServices,
  tradeType,
  businessName,
  onChange,
}: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    initRows(initialRows, selectedServices, tradeType)
  );
  const [showAdder, setShowAdder] = useState(false);
  const [addSelection, setAddSelection] = useState('');
  const [customName, setCustomName] = useState('');

  function emit(next: Row[]) {
    setRows(next);
    onChange({ rows: rowsToOutput(next) });
  }

  function updateRow(id: string, patch: Partial<Pick<Row, 'service' | 'from' | 'to'>>) {
    emit(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return; // never hit zero
    emit(rows.filter((r) => r.id !== id));
  }

  // Services from the trade list not already in the rows
  const key = tradeKey(tradeType);
  const tradeList = (key ? TRADE_SERVICES[key] : null) ?? UNIVERSAL_FALLBACK;
  const existingServices = new Set(rows.map((r) => r.service));
  const remainingServices = tradeList.filter((s) => !existingServices.has(s));

  function confirmAdd() {
    if (addSelection === '__custom') {
      const name = customName.trim();
      if (!name) return;
      const newRow: Row = { id: nextId(), service: name, from: 0, to: 0, custom: true };
      emit([...rows, newRow]);
    } else if (addSelection && !existingServices.has(addSelection)) {
      emit([...rows, makeRow(addSelection)]);
    }
    setShowAdder(false);
    setAddSelection('');
    setCustomName('');
  }

  // Shared input style
  const numInput = (hasWarn: boolean): React.CSSProperties => ({
    width: '100%',
    minHeight: '44px',
    padding: '10px 10px 10px 28px', // space for £ prefix
    background: '#FAFAFC',
    border: `1px solid ${hasWarn ? '#D97706' : '#D8D0F0'}`,
    borderRadius: '8px',
    color: 'var(--ink, #1A1A2E)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Inter", sans-serif',
    transition: 'border-color .15s',
  });

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      {/* Helper line */}
      <div style={{
        fontSize: '12px',
        color: 'var(--muted, #888)',
        lineHeight: 1.6,
        marginBottom: '18px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--divider, #E8E8EE)',
      }}>
        These are typical UK ranges — adjust to match what{businessName ? ` ${businessName}` : ''} charges.
        Your AI receptionist quotes ranges only, never fixed prices.
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {rows.map((row) => {
          const rangeWarn = row.from > 0 && row.to > 0 && row.from > row.to;
          return (
            <div key={row.id} style={{
              background: '#FAFAFC',
              border: '1px solid var(--divider, #E8E8EE)',
              borderRadius: '10px',
              padding: '12px 14px',
            }}>
              {/* Service name */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                {row.custom ? (
                  <input
                    type="text"
                    value={row.service}
                    placeholder="Service name"
                    onChange={(e) => updateRow(row.id, { service: e.target.value })}
                    style={{
                      flex: 1,
                      minHeight: '36px',
                      padding: '6px 10px',
                      background: '#fff',
                      border: '1px solid #D8D0F0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--ink, #1A1A2E)',
                      outline: 'none',
                      fontFamily: '"Inter", sans-serif',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3D1FA8'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#D8D0F0'; }}
                  />
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink, #1A1A2E)', flex: 1 }}>
                    {row.service}
                  </div>
                )}
                {/* Remove button — hidden when only 1 row */}
                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    title="Remove"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--divider, #E8E8EE)',
                      background: '#fff',
                      color: 'var(--muted, #888)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Price inputs */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['from', 'to'] as const).map((field) => (
                  <div key={field} style={{ flex: 1, position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '13px',
                      color: 'var(--muted, #888)',
                      fontWeight: 600,
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}>£</span>
                    <input
                      type="number"
                      min={0}
                      value={row[field] === 0 ? '' : row[field]}
                      placeholder={field === 'from' ? 'From' : 'To'}
                      onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                        updateRow(row.id, { [field]: isNaN(n) ? 0 : n });
                      }}
                      onFocus={(e) => { e.target.style.borderColor = rangeWarn ? '#D97706' : '#3D1FA8'; }}
                      onBlur={(e) => { e.target.style.borderColor = rangeWarn ? '#D97706' : '#D8D0F0'; }}
                      style={numInput(rangeWarn)}
                    />
                  </div>
                ))}
              </div>

              {/* Amber range warning */}
              {rangeWarn && (
                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 500, marginTop: '5px' }}>
                  ⚠ Check this range — From should be less than To.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add another service */}
      {!showAdder ? (
        <button
          onClick={() => { setShowAdder(true); setAddSelection(remainingServices[0] || '__custom'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px dashed var(--divider, #E8E8EE)',
            background: 'transparent',
            color: 'var(--a1, #3D1FA8)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          + Add another service
        </button>
      ) : (
        <div style={{
          padding: '14px',
          background: '#FAFAFC',
          border: '1px solid var(--divider, #E8E8EE)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <select
            value={addSelection}
            onChange={(e) => setAddSelection(e.target.value)}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              background: '#fff',
              border: '1px solid #D8D0F0',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--ink, #1A1A2E)',
              outline: 'none',
              fontFamily: '"Inter", sans-serif',
              boxSizing: 'border-box',
            }}
          >
            {remainingServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom">Custom service…</option>
          </select>

          {addSelection === '__custom' && (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Power flush"
              autoFocus
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid #D8D0F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--ink, #1A1A2E)',
                outline: 'none',
                fontFamily: '"Inter", sans-serif',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3D1FA8'; }}
              onBlur={(e) => { e.target.style.borderColor = '#D8D0F0'; }}
            />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={confirmAdd}
              disabled={addSelection === '__custom' && !customName.trim()}
              style={{
                padding: '8px 18px',
                borderRadius: '7px',
                border: 'none',
                background: 'var(--a1, #3D1FA8)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                opacity: addSelection === '__custom' && !customName.trim() ? 0.4 : 1,
              }}
            >
              Add
            </button>
            <button
              onClick={() => { setShowAdder(false); setAddSelection(''); setCustomName(''); }}
              style={{
                padding: '8px 14px',
                borderRadius: '7px',
                border: '1px solid var(--divider, #E8E8EE)',
                background: '#fff',
                color: 'var(--ink, #1A1A2E)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
