'use client';
import { getServicesForTrade } from '@/lib/onboarding/tradeUtils';

export interface ServicesAnswers {
  selected: string[];
}

export function step2Valid(s: ServicesAnswers | undefined): boolean {
  return (s?.selected.length ?? 0) >= 1;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  values: ServicesAnswers;
  onChange: (values: ServicesAnswers) => void;
  tradeType: string;
  businessName: string;
}

export default function Step2ServicesOffered({ values, onChange, tradeType, businessName }: Props) {
  const services = getServicesForTrade(tradeType);
  const selected = values.selected;

  function toggle(service: string) {
    const next = selected.includes(service)
      ? selected.filter((s) => s !== service)
      : [...selected, service];
    onChange({ selected: next });
  }

  const noneSelected = selected.length === 0;

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
        Tick everything{businessName ? ` ${businessName}` : ''} offers — this shapes what your AI
        receptionist can quote and book.
      </div>

      {/* Checkbox grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '8px',
        marginBottom: noneSelected ? '12px' : '0',
      }}>
        {services.map((service) => {
          const checked = selected.includes(service);
          return (
            <label
              key={service}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${checked ? 'rgba(61,31,168,0.3)' : 'var(--divider, #E8E8EE)'}`,
                background: checked ? 'var(--a1b, #EDE8FF)' : '#FAFAFC',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all .15s',
              }}
            >
              {/* Custom checkbox */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: `2px solid ${checked ? 'var(--a1, #3D1FA8)' : '#D8D0F0'}`,
                background: checked ? 'var(--a1, #3D1FA8)' : '#fff',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .15s',
              }}>
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(service)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                aria-label={service}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: checked ? 600 : 500,
                color: checked ? 'var(--a1, #3D1FA8)' : 'var(--ink, #1A1A2E)',
                lineHeight: 1.3,
              }}>
                {service}
              </span>
            </label>
          );
        })}
      </div>

      {/* Validation hint — only shown when nothing is ticked */}
      {noneSelected && (
        <div style={{ fontSize: '11px', color: '#C01830', fontWeight: 500, marginTop: '8px' }}>
          Select at least one service to continue.
        </div>
      )}

      {/* Selected count badge */}
      {selected.length > 0 && (
        <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--a1, #3D1FA8)', fontWeight: 600 }}>
          {selected.length} service{selected.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
