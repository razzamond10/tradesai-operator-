'use client';
import { useState } from 'react';

export interface BusinessAnswers {
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  trades: string[];        // display names, e.g. ['Plumbing', 'Gas/Heating']
  primaryTrade: string;    // = trades[0] || ''
}

export const TRADE_TYPES = [
  'Plumbing', 'Electrical', 'Gas/Heating', 'Roofing',
  'HVAC', 'Building', 'Handyman', 'Other',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikePhone(v: string): boolean {
  return /\d/.test(v);
}

export function step1Valid(b: BusinessAnswers | undefined): boolean {
  if (!b) return false;
  return (
    b.business_name.trim() !== '' &&
    b.owner_name.trim() !== '' &&
    b.phone.trim() !== '' &&
    looksLikePhone(b.phone) &&
    b.email.trim() !== '' &&
    EMAIL_RE.test(b.email.trim()) &&
    b.trades.length >= 1
  );
}

type TextFieldKey = 'business_name' | 'owner_name' | 'phone' | 'email';

interface Props {
  values: BusinessAnswers;
  onChange: (values: BusinessAnswers) => void;
}

export default function Step1BusinessDetails({ values, onChange }: Props) {
  const [touched, setTouched] = useState<Partial<Record<TextFieldKey, true>>>({});
  const [focused, setFocused] = useState<TextFieldKey | null>(null);
  const [touchedTrades, setTouchedTrades] = useState(false);

  function set(field: TextFieldKey, value: string) {
    onChange({ ...values, [field]: value });
  }

  function touch(field: TextFieldKey) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function toggleTrade(displayName: string) {
    setTouchedTrades(true);
    const next = values.trades.includes(displayName)
      ? values.trades.filter((t) => t !== displayName)
      : [...values.trades, displayName];
    onChange({ ...values, trades: next, primaryTrade: next[0] || '' });
  }

  const errors: Partial<Record<TextFieldKey, string>> = {};
  if (touched.business_name && !values.business_name.trim()) {
    errors.business_name = 'Business name is required.';
  }
  if (touched.owner_name && !values.owner_name.trim()) {
    errors.owner_name = 'Owner name is required.';
  }
  if (touched.phone) {
    if (!values.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!looksLikePhone(values.phone)) errors.phone = 'Please enter a valid phone number.';
  }
  if (touched.email) {
    if (!values.email.trim()) errors.email = 'Email address is required.';
    else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  }

  function borderColor(field: TextFieldKey, hasError: boolean): string {
    if (focused === field) return '#3D1FA8';
    if (hasError) return '#C01830';
    return '#D8D0F0';
  }

  const baseInput: React.CSSProperties = {
    width: '100%',
    minHeight: '44px',
    padding: '10px 14px',
    background: '#FAFAFC',
    borderRadius: '8px',
    color: 'var(--ink, #1A1A2E)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Inter", sans-serif',
    transition: 'border-color .15s',
    borderStyle: 'solid',
    borderWidth: '1px',
  };

  const noTradesError = touchedTrades && values.trades.length === 0;

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Business name */}
        <Field label="Business name" required error={errors.business_name}>
          <input
            type="text"
            value={values.business_name}
            placeholder="e.g. Smith's Plumbing Ltd"
            onChange={(e) => set('business_name', e.target.value)}
            onFocus={() => setFocused('business_name')}
            onBlur={() => { setFocused(null); touch('business_name'); }}
            style={{ ...baseInput, borderColor: borderColor('business_name', !!errors.business_name) }}
          />
        </Field>

        {/* Owner name */}
        <Field label="Owner / contact name" required error={errors.owner_name}>
          <input
            type="text"
            value={values.owner_name}
            placeholder="e.g. John Smith"
            onChange={(e) => set('owner_name', e.target.value)}
            onFocus={() => setFocused('owner_name')}
            onBlur={() => { setFocused(null); touch('owner_name'); }}
            style={{ ...baseInput, borderColor: borderColor('owner_name', !!errors.owner_name) }}
          />
        </Field>

        {/* Phone */}
        <Field label="Business phone" required error={errors.phone}>
          <input
            type="tel"
            value={values.phone}
            placeholder="e.g. 07700 900123"
            onChange={(e) => set('phone', e.target.value)}
            onFocus={() => setFocused('phone')}
            onBlur={() => { setFocused(null); touch('phone'); }}
            style={{ ...baseInput, borderColor: borderColor('phone', !!errors.phone) }}
          />
        </Field>

        {/* Email */}
        <Field label="Business email" required error={errors.email}>
          <input
            type="email"
            value={values.email}
            placeholder="e.g. info@smithsplumbing.co.uk"
            onChange={(e) => set('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => { setFocused(null); touch('email'); }}
            style={{ ...baseInput, borderColor: borderColor('email', !!errors.email) }}
          />
        </Field>

        {/* Trade type — multi-select checkbox group */}
        <Field
          label="Trade type"
          required
          error={noTradesError ? 'Select at least one trade to continue.' : undefined}
        >
          <div style={{ fontSize: '11px', color: 'var(--muted, #888)', marginBottom: '10px', lineHeight: 1.5 }}>
            Select all trades{values.business_name ? ` ${values.business_name}` : ''} covers — many cover
            more than one (e.g. plumbing + gas).
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '8px',
          }}>
            {TRADE_TYPES.map((t) => {
              const checked = values.trades.includes(t);
              const isPrimary = checked && values.trades[0] === t;
              return (
                <label
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    minHeight: '44px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${checked ? 'rgba(61,31,168,0.3)' : noTradesError ? '#C01830' : 'var(--divider, #E8E8EE)'}`,
                    background: checked ? 'var(--a1b, #EDE8FF)' : '#FAFAFC',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all .15s',
                  }}
                >
                  {/* Custom checkbox box */}
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
                    onChange={() => toggleTrade(t)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    aria-label={t}
                  />
                  <span style={{
                    flex: 1,
                    fontSize: '12px',
                    fontWeight: checked ? 600 : 500,
                    color: checked ? 'var(--a1, #3D1FA8)' : 'var(--ink, #1A1A2E)',
                    lineHeight: 1.3,
                  }}>
                    {t}
                    {isPrimary && values.trades.length > 1 && (
                      <span style={{
                        display: 'block',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: 'var(--a1, #3D1FA8)',
                        opacity: 0.7,
                        letterSpacing: '.4px',
                        textTransform: 'uppercase',
                        marginTop: '1px',
                      }}>
                        primary
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </Field>

      </div>
    </div>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--muted, #888)',
        letterSpacing: '.6px',
        textTransform: 'uppercase',
        marginBottom: '6px',
      }}>
        {label}
        {required && <span style={{ color: '#C01830', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: '11px', color: '#C01830', marginTop: '5px', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
}
