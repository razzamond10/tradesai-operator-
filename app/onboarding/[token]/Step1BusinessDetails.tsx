'use client';
import { useState } from 'react';

export interface BusinessAnswers {
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  trade_type: string;
}

export const TRADE_TYPES = [
  'Plumbing', 'Electrical', 'Gas/Heating', 'Roofing',
  'HVAC', 'Building', 'Handyman', 'Other',
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lenient UK phone check — only warns if there are no digits at all. */
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
    b.trade_type !== ''
  );
}

interface Props {
  values: BusinessAnswers;
  onChange: (values: BusinessAnswers) => void;
}

export default function Step1BusinessDetails({ values, onChange }: Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessAnswers, true>>>({});
  const [focused, setFocused] = useState<keyof BusinessAnswers | null>(null);

  function set(field: keyof BusinessAnswers, value: string) {
    onChange({ ...values, [field]: value });
  }

  function touch(field: keyof BusinessAnswers) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  const errors: Partial<Record<keyof BusinessAnswers, string>> = {};
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
  if (touched.trade_type && !values.trade_type) {
    errors.trade_type = 'Please select your trade type.';
  }

  function borderColor(field: keyof BusinessAnswers, hasError: boolean): string {
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

        {/* Trade type */}
        <Field label="Trade type" required error={errors.trade_type}>
          <select
            value={values.trade_type}
            onChange={(e) => { set('trade_type', e.target.value); touch('trade_type'); }}
            onFocus={() => setFocused('trade_type')}
            onBlur={() => { setFocused(null); touch('trade_type'); }}
            style={{
              ...baseInput,
              borderColor: borderColor('trade_type', !!errors.trade_type),
              color: values.trade_type ? 'var(--ink, #1A1A2E)' : '#888',
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: '36px',
            }}
          >
            <option value="" disabled>Select your trade…</option>
            {TRADE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
