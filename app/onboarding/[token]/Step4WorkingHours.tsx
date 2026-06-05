'use client';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

export type OutOfHoursAction = 'callback' | 'forward' | 'message';

export interface EmergencyAnswers {
  triggers: string[];
  outOfHoursAction: OutOfHoursAction;
  onCallNumber?: string;
}

export interface WorkingHoursAnswers {
  hours: DayHours[];
  emergency: EmergencyAnswers;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS: DayHours[] = DAYS.map((day) => ({
  day,
  open: true,
  from: '08:00',
  to: '18:00',
}));

const EMERGENCY_TRIGGERS = [
  'Flooding',
  'Burst pipe',
  'Gas smell',
  'Carbon monoxide',
  'Total power failure',
  'No heating (vulnerable person / winter)',
  'Structural danger',
];

const DEFAULT_EMERGENCY: EmergencyAnswers = {
  triggers: [...EMERGENCY_TRIGGERS],  // all pre-ticked
  outOfHoursAction: 'callback',
  onCallNumber: '',
};

export function defaultWorkingHoursAnswers(): WorkingHoursAnswers {
  return {
    hours: DEFAULT_HOURS.map((h) => ({ ...h })),
    emergency: { ...DEFAULT_EMERGENCY, triggers: [...DEFAULT_EMERGENCY.triggers] },
  };
}

// step4 is always valid (defaults are sensible) — Next never blocked.
// Amber warnings are shown inline but don't gate.
export function step4Valid(_w: WorkingHoursAnswers | undefined): boolean {
  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  values: WorkingHoursAnswers;
  onChange: (v: WorkingHoursAnswers) => void;
}

export default function Step4WorkingHours({ values, onChange }: Props) {
  const { hours, emergency } = values;

  // ── Hours helpers ──────────────────────────────────────────────────────────

  function setDay(idx: number, patch: Partial<DayHours>) {
    const next = hours.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange({ ...values, hours: next });
  }

  function setEmergency(patch: Partial<EmergencyAnswers>) {
    onChange({ ...values, emergency: { ...emergency, ...patch } });
  }

  function toggleTrigger(trigger: string) {
    const next = emergency.triggers.includes(trigger)
      ? emergency.triggers.filter((t) => t !== trigger)
      : [...emergency.triggers, trigger];
    setEmergency({ triggers: next });
  }

  // Amber warns
  const allClosed = hours.every((d) => !d.open);
  const rangeErrors = hours.filter((d) => d.open && d.from >= d.to);

  // ── Shared styles ──────────────────────────────────────────────────────────

  const timeInput: React.CSSProperties = {
    minHeight: '36px',
    padding: '6px 8px',
    background: '#FAFAFC',
    border: '1px solid #D8D0F0',
    borderRadius: '6px',
    fontSize: '13px',
    color: 'var(--ink, #1A1A2E)',
    outline: 'none',
    fontFamily: '"IBM Plex Mono", monospace',
    boxSizing: 'border-box',
    width: '100%',
  };

  return (
    <div style={{ padding: '20px 20px 24px' }}>

      {/* ── Section 1: Opening hours ──────────────────────────────────────── */}
      <SectionHeading>Opening hours</SectionHeading>

      {/* Amber warns */}
      {allClosed && (
        <AmberWarn>All days are set to closed — your AI receptionist will treat every call as out-of-hours.</AmberWarn>
      )}
      {!allClosed && rangeErrors.length > 0 && (
        <AmberWarn>
          {rangeErrors.map((d) => d.day).join(', ')}: closing time is not after opening time — check these rows.
        </AmberWarn>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
        {hours.map((row, idx) => (
          <div
            key={row.day}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 52px 1fr 16px 1fr',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: row.open ? '#FAFAFC' : 'transparent',
              border: `1px solid ${row.open ? 'var(--divider, #E8E8EE)' : 'transparent'}`,
              transition: 'all .15s',
            }}
          >
            {/* Day label */}
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: row.open ? 'var(--ink, #1A1A2E)' : 'var(--muted, #888)',
            }}>
              {row.day.slice(0, 3)}
            </div>

            {/* Open/closed toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <ToggleSwitch
                checked={row.open}
                onChange={(v) => setDay(idx, { open: v })}
              />
            </label>

            {/* From time */}
            <input
              type="time"
              value={row.from}
              disabled={!row.open}
              onChange={(e) => setDay(idx, { from: e.target.value })}
              style={{
                ...timeInput,
                opacity: row.open ? 1 : 0.3,
                cursor: row.open ? 'text' : 'not-allowed',
                borderColor: row.open && row.from >= row.to ? '#D97706' : '#D8D0F0',
              }}
            />

            {/* separator */}
            <div style={{
              textAlign: 'center',
              fontSize: '11px',
              color: 'var(--muted, #888)',
              opacity: row.open ? 1 : 0.3,
            }}>–</div>

            {/* To time */}
            <input
              type="time"
              value={row.to}
              disabled={!row.open}
              onChange={(e) => setDay(idx, { to: e.target.value })}
              style={{
                ...timeInput,
                opacity: row.open ? 1 : 0.3,
                cursor: row.open ? 'text' : 'not-allowed',
                borderColor: row.open && row.from >= row.to ? '#D97706' : '#D8D0F0',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Section 2: Emergency policy ───────────────────────────────────── */}
      <SectionHeading>Emergency policy</SectionHeading>

      <SubLabel>What counts as an emergency?</SubLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '7px',
        marginBottom: '22px',
      }}>
        {EMERGENCY_TRIGGERS.map((trigger) => {
          const checked = emergency.triggers.includes(trigger);
          return (
            <label
              key={trigger}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                minHeight: '44px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${checked ? 'rgba(61,31,168,0.3)' : 'var(--divider, #E8E8EE)'}`,
                background: checked ? 'var(--a1b, #EDE8FF)' : '#FAFAFC',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all .15s',
              }}
            >
              <Checkbox checked={checked} onChange={() => toggleTrigger(trigger)} />
              <span style={{
                fontSize: '12px',
                fontWeight: checked ? 600 : 500,
                color: checked ? 'var(--a1, #3D1FA8)' : 'var(--ink, #1A1A2E)',
                lineHeight: 1.35,
              }}>
                {trigger}
              </span>
            </label>
          );
        })}
      </div>

      {/* Out-of-hours action */}
      <SubLabel>Out of hours, when an emergency comes in, the AI should…</SubLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: emergency.outOfHoursAction === 'forward' ? '12px' : '0' }}>
        {([
          { value: 'callback', label: 'Take details, flag urgent, and alert the team for a 10-minute callback' },
          { value: 'forward',  label: 'Take details and forward to an on-call number' },
          { value: 'message',  label: 'Take a message only' },
        ] as { value: OutOfHoursAction; label: string }[]).map(({ value, label }) => {
          const selected = emergency.outOfHoursAction === value;
          return (
            <label
              key={value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                minHeight: '44px',
                padding: '11px 14px',
                borderRadius: '8px',
                border: `1px solid ${selected ? 'rgba(61,31,168,0.3)' : 'var(--divider, #E8E8EE)'}`,
                background: selected ? 'var(--a1b, #EDE8FF)' : '#FAFAFC',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all .15s',
              }}
            >
              {/* Custom radio */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${selected ? 'var(--a1, #3D1FA8)' : '#D8D0F0'}`,
                background: '#fff',
                flexShrink: 0,
                marginTop: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .15s',
              }}>
                {selected && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--a1, #3D1FA8)',
                  }} />
                )}
              </div>
              <input
                type="radio"
                name="outOfHoursAction"
                value={value}
                checked={selected}
                onChange={() => setEmergency({ outOfHoursAction: value })}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: selected ? 600 : 500,
                color: selected ? 'var(--a1, #3D1FA8)' : 'var(--ink, #1A1A2E)',
                lineHeight: 1.4,
              }}>
                {label}
              </span>
            </label>
          );
        })}
      </div>

      {/* On-call number — revealed when "forward" selected */}
      {emergency.outOfHoursAction === 'forward' && (
        <div style={{ marginTop: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--muted, #888)',
            letterSpacing: '.6px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            On-call number <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={emergency.onCallNumber ?? ''}
            placeholder="e.g. 07700 900999"
            onChange={(e) => setEmergency({ onCallNumber: e.target.value })}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '10px 14px',
              background: '#FAFAFC',
              border: '1px solid #D8D0F0',
              borderRadius: '8px',
              color: 'var(--ink, #1A1A2E)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: '"Inter", sans-serif',
              transition: 'border-color .15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3D1FA8'; }}
            onBlur={(e) => { e.target.style.borderColor = '#D8D0F0'; }}
          />
        </div>
      )}
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '"Inter Tight", sans-serif',
      fontSize: '13px',
      fontWeight: 700,
      color: 'var(--ink, #1A1A2E)',
      marginBottom: '12px',
      paddingBottom: '10px',
      borderBottom: '1px solid var(--divider, #E8E8EE)',
    }}>
      {children}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: 700,
      color: 'var(--muted, #888)',
      letterSpacing: '.4px',
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      {children}
    </div>
  );
}

function AmberWarn({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '10px 12px',
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: '8px',
      fontSize: '11px',
      color: '#92400E',
      fontWeight: 500,
      lineHeight: 1.5,
      marginBottom: '12px',
    }}>
      <span style={{ flexShrink: 0 }}>⚠</span>
      <span>{children}</span>
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <>
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
        onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'var(--a1, #3D1FA8)' : '#D8D0F0',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: checked ? '18px' : '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left .2s',
      }} />
    </div>
  );
}
