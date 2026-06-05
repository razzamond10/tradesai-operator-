'use client';
import { useState } from 'react';
import type { BusinessAnswers } from './Step1BusinessDetails';
import type { ServicesAnswers } from './Step2ServicesOffered';
import type { PricingAnswers } from './Step3Pricing';
import type { WorkingHoursAnswers } from './Step4WorkingHours';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AllAnswers {
  business?: BusinessAnswers;
  services?: ServicesAnswers;
  pricing?: PricingAnswers;
  workingHours?: WorkingHoursAnswers;
  voice?: { key: string; label: string };
}

interface Props {
  answers: AllAnswers;
  onGoToStep: (step: number) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TRADESAI_NUMBER         = '+447727950277';
const TRADESAI_NUMBER_DISPLAY = '+44 7727 950277';

const OUT_OF_HOURS_LABELS: Record<string, string> = {
  callback: 'Alert team for a callback',
  forward:  'Forward to on-call number',
  message:  'Take a message only',
};

// step5 is read-only — Next is never blocked.
export function step5Valid(_a: AllAnswers | undefined): boolean {
  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Step5Review({ answers, onGoToStep }: Props) {
  const [copied, setCopied]   = useState(false);
  const [launched, setLaunched] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(TRADESAI_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — fail silently
    }
  }

  // ── Post-launch confirmation ───────────────────────────────────────────────

  if (launched) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'var(--a3b, #E6F9F0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', margin: '0 auto 20px',
        }}>
          ✓
        </div>
        <div style={{
          fontFamily: '"Inter Tight", sans-serif',
          fontSize: '18px', fontWeight: 800,
          color: 'var(--ink, #1A1A2E)', marginBottom: '10px',
        }}>
          Setup complete
        </div>
        <div style={{
          fontSize: '13px', color: 'var(--muted, #888)',
          lineHeight: 1.6, maxWidth: '300px', margin: '0 auto',
        }}>
          We'll be in touch shortly to confirm your TradesAI number and get you live.
        </div>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 20px 28px' }}>

      {/* ── Section 1: Phone forwarding ───────────────────────────────────── */}
      <SectionHeading>Forward your calls to TradesAI</SectionHeading>

      <div style={{
        fontSize: '12px', color: 'var(--muted, #888)',
        lineHeight: 1.65, marginBottom: '16px',
      }}>
        Divert your existing business line to the TradesAI number below — your AI
        receptionist will answer every call on your behalf.
      </div>

      {/* Prominent number + copy button */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px',
        background: 'var(--a1b, #EDE8FF)',
        border: '1px solid rgba(61,31,168,0.2)',
        borderRadius: '10px',
        marginBottom: '16px',
      }}>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '18px', fontWeight: 700,
          color: 'var(--a1, #3D1FA8)', flex: 1, letterSpacing: '0.5px',
        }}>
          {TRADESAI_NUMBER_DISPLAY}
        </span>
        <button
          onClick={copyNumber}
          style={{
            padding: '7px 14px', borderRadius: '7px',
            border: '1px solid rgba(61,31,168,0.3)',
            background: copied ? 'var(--a3, #00A05A)' : '#fff',
            color: copied ? '#fff' : 'var(--a1, #3D1FA8)',
            fontSize: '11px', fontWeight: 700,
            cursor: 'pointer', fontFamily: '"Inter", sans-serif',
            transition: 'all .15s', whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Divert steps */}
      <ol style={{
        paddingLeft: '18px', margin: '0 0 8px',
        fontSize: '12px', color: 'var(--ink, #1A1A2E)', lineHeight: 1.7,
      }}>
        <li style={{ marginBottom: '6px' }}>
          On your business mobile or handset, dial the divert code. Most UK networks use{' '}
          <Code>{'**21*<number>#'}</Code>{' '}to divert all calls, or{' '}
          <Code>{'*21#'}</Code>{' '}to cancel.
        </li>
        <li style={{ marginBottom: '6px' }}>Enter the TradesAI number when prompted.</li>
        <li>Make a test call to your business number to confirm TradesAI answers.</li>
      </ol>
      <div style={{
        fontSize: '11px', color: 'var(--muted, #888)',
        fontStyle: 'italic', marginBottom: '28px',
      }}>
        Exact codes vary by provider — we'll confirm yours after launch.
      </div>

      {/* ── Section 2: Setup video ─────────────────────────────────────────── */}
      <SectionHeading>Watch the 2-minute setup walkthrough</SectionHeading>

      {/*
        PHASE B: replace this placeholder with the real video embed, e.g.:
        <iframe
          src="https://www.youtube.com/embed/XXXXXXXXXX"
          style={{ width: '100%', aspectRatio: '16/9', border: 0, borderRadius: '10px' }}
          allowFullScreen
        />
      */}
      <div style={{
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#F3F0FF',
        border: '1px solid var(--divider, #E8E8EE)',
        borderRadius: '10px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'rgba(61,31,168,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '10px',
        }}>
          {/* Play triangle */}
          <div style={{
            width: 0, height: 0,
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            borderLeft: '15px solid rgba(61,31,168,0.35)',
            marginLeft: '3px',
          }} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted, #888)', fontWeight: 500 }}>
          Setup video coming soon
        </span>
      </div>

      {/* ── Section 3: Review summary ──────────────────────────────────────── */}
      <SectionHeading>Review your details</SectionHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>

        {/* AI voice */}
        <ReviewBlock title="AI voice" onEdit={() => onGoToStep(1)}>
          {answers.voice
            ? <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink, #1A1A2E)' }}>{answers.voice.label}</span>
            : <NotProvided />
          }
        </ReviewBlock>

        {/* Business */}
        <ReviewBlock title="Business" onEdit={() => onGoToStep(1)}>
          {answers.business ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <ReviewRow label="Name"    value={answers.business.business_name} />
              <ReviewRow label="Owner"   value={answers.business.owner_name} />
              <ReviewRow label="Phone"   value={answers.business.phone} />
              <ReviewRow label="Email"   value={answers.business.email} />
              <ReviewRow
                label="Trade(s)"
                value={
                  answers.business.trades.length === 0
                    ? '—'
                    : answers.business.trades
                        .map((t) =>
                          t === answers.business!.primaryTrade &&
                          answers.business!.trades.length > 1
                            ? `${t} (primary)`
                            : t
                        )
                        .join(', ')
                }
              />
            </div>
          ) : <NotProvided />}
        </ReviewBlock>

        {/* Services */}
        <ReviewBlock title="Services" onEdit={() => onGoToStep(2)}>
          {answers.services && answers.services.selected.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {answers.services.selected.map((s) => (
                <span key={s} style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '3px 8px', borderRadius: '20px',
                  background: 'var(--a1b, #EDE8FF)',
                  color: 'var(--a1, #3D1FA8)',
                  border: '1px solid rgba(61,31,168,0.15)',
                }}>
                  {s}
                </span>
              ))}
            </div>
          ) : <NotProvided />}
        </ReviewBlock>

        {/* Pricing */}
        <ReviewBlock title="Pricing" onEdit={() => onGoToStep(3)}>
          {answers.pricing && answers.pricing.rows.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {answers.pricing.rows.map((row, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--ink, #1A1A2E)' }}>
                  <span style={{ fontWeight: 600 }}>{row.service || '(unnamed)'}</span>
                  <span style={{ color: 'var(--muted, #888)' }}> — </span>
                  <span style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '11px', color: 'var(--muted, #888)',
                  }}>
                    £{row.from}–£{row.to}
                  </span>
                </div>
              ))}
            </div>
          ) : <NotProvided />}
        </ReviewBlock>

        {/* Working hours
            ⚠ READ PATH: answers.workingHours.hours (not answers.hours) */}
        <ReviewBlock title="Working hours" onEdit={() => onGoToStep(4)}>
          {answers.workingHours ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {answers.workingHours.hours.map((d) => {
                const incomplete = d.open && (!d.from || !d.to);
                return (
                  <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      width: '28px', flexShrink: 0,
                      color: d.open ? 'var(--ink, #1A1A2E)' : 'var(--muted, #888)',
                    }}>
                      {d.day.slice(0, 3)}
                    </span>
                    {d.open ? (
                      <>
                        <span style={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '11px',
                          color: incomplete ? '#D97706' : 'var(--ink, #1A1A2E)',
                        }}>
                          {d.from || '—:——'}–{d.to || '—:——'}
                        </span>
                        {incomplete && (
                          <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                            ⚠ incomplete
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--muted, #888)' }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <NotProvided />}
        </ReviewBlock>

        {/* Emergency policy
            ⚠ READ PATH: answers.workingHours.emergency (not answers.emergency) */}
        <ReviewBlock title="Emergency policy" onEdit={() => onGoToStep(4)}>
          {answers.workingHours?.emergency ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Triggers */}
              <div>
                <div style={{
                  fontSize: '10px', fontWeight: 700,
                  color: 'var(--muted, #888)', textTransform: 'uppercase',
                  letterSpacing: '.4px', marginBottom: '5px',
                }}>
                  Triggers
                </div>
                {answers.workingHours.emergency.triggers.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {answers.workingHours.emergency.triggers.map((t) => (
                      <span key={t} style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        background: '#FEF3C7', color: '#92400E',
                        border: '1px solid #FDE68A', fontWeight: 500,
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--muted, #888)' }}>None selected</span>
                )}
              </div>
              {/* Out-of-hours action */}
              <div style={{ fontSize: '12px', color: 'var(--ink, #1A1A2E)' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  color: 'var(--muted, #888)', textTransform: 'uppercase',
                  letterSpacing: '.4px',
                }}>
                  Out-of-hours action:{' '}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {OUT_OF_HOURS_LABELS[answers.workingHours.emergency.outOfHoursAction]
                    ?? answers.workingHours.emergency.outOfHoursAction}
                </span>
              </div>
              {/* On-call number — only shown when action === 'forward' */}
              {answers.workingHours.emergency.outOfHoursAction === 'forward' &&
               answers.workingHours.emergency.onCallNumber && (
                <div style={{ fontSize: '12px', color: 'var(--ink, #1A1A2E)' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    color: 'var(--muted, #888)', textTransform: 'uppercase',
                    letterSpacing: '.4px',
                  }}>
                    On-call number:{' '}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px' }}>
                    {answers.workingHours.emergency.onCallNumber}
                  </span>
                </div>
              )}
            </div>
          ) : <NotProvided />}
        </ReviewBlock>

      </div>

      {/* ── Launch button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          // PHASE B: fire Make.com webhook here
          setLaunched(true);
        }}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: '10px',
          border: 'none',
          background: 'var(--a1, #3D1FA8)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: '"Inter Tight", sans-serif',
          letterSpacing: '-0.2px',
          transition: 'opacity .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        Launch my AI receptionist
      </button>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '"Inter Tight", sans-serif',
      fontSize: '13px', fontWeight: 700,
      color: 'var(--ink, #1A1A2E)',
      marginBottom: '12px', paddingBottom: '10px',
      borderBottom: '1px solid var(--divider, #E8E8EE)',
    }}>
      {children}
    </div>
  );
}

function ReviewBlock({
  title, onEdit, children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      border: '1px solid var(--divider, #E8E8EE)',
      borderRadius: '10px', overflow: 'hidden',
    }}>
      {/* Block header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 14px',
        background: '#F8F8FB',
        borderBottom: '1px solid var(--divider, #E8E8EE)',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink, #1A1A2E)' }}>
          {title}
        </span>
        <button
          onClick={onEdit}
          style={{
            padding: '3px 10px', borderRadius: '5px',
            border: '1px solid var(--divider, #E8E8EE)', background: '#fff',
            color: 'var(--a1, #3D1FA8)', fontSize: '11px', fontWeight: 700,
            cursor: 'pointer', fontFamily: '"Inter", sans-serif',
          }}
        >
          Edit
        </button>
      </div>
      {/* Block body */}
      <div style={{ padding: '12px 14px', background: '#fff' }}>
        {children}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
      <span style={{
        fontSize: '10px', fontWeight: 700,
        color: 'var(--muted, #888)', textTransform: 'uppercase',
        letterSpacing: '.4px', flexShrink: 0, minWidth: '52px',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '12px', color: 'var(--ink, #1A1A2E)',
        fontWeight: 500, wordBreak: 'break-word',
      }}>
        {value || '—'}
      </span>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '11px', background: '#F3F0FF',
      padding: '1px 5px', borderRadius: '4px',
      color: 'var(--a1, #3D1FA8)',
    }}>
      {children}
    </code>
  );
}

function NotProvided() {
  return (
    <span style={{ fontSize: '12px', color: 'var(--muted, #888)', fontStyle: 'italic' }}>
      Not provided
    </span>
  );
}
