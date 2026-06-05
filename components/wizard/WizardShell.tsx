'use client';

export const STEP_NAMES = [
  'Business Info',
  'Services Offered',
  'Call Handling',
  'Calendar & Booking',
  'Review & Launch',
] as const;

interface WizardShellProps {
  currentStep: number;      // 1-based
  totalSteps: number;
  businessName?: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

export default function WizardShell({
  currentStep,
  totalSteps,
  businessName,
  onBack,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
  nextDisabled = false,
  children,
}: WizardShellProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);
  const stepName = STEP_NAMES[currentStep - 1] ?? '';

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--slate, #F8F8FB)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 0 48px',
    }}>
      {/* Top bar */}
      <div style={{
        width: '100%',
        background: '#fff',
        borderBottom: '1px solid var(--divider, #E8E8EE)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Brand + business name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0 8px',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontFamily: '"Inter Tight", sans-serif',
                fontSize: '14px',
                fontWeight: 900,
                color: 'var(--a1, #3D1FA8)',
                letterSpacing: '-0.3px',
              }}>
                TradesAI
              </div>
              {businessName && (
                <>
                  <span style={{ color: 'var(--divider, #E8E8EE)', fontSize: '14px' }}>|</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--muted, #888)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                  }}>{businessName}</span>
                </>
              )}
            </div>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--muted, #888)',
              letterSpacing: '.6px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            height: '4px',
            background: 'var(--divider, #E8E8EE)',
            borderRadius: '2px',
            marginBottom: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--a1, #3D1FA8)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Step pills */}
          <div style={{
            display: 'flex',
            gap: '4px',
            paddingBottom: '10px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {STEP_NAMES.map((name, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: isCurrent ? 'var(--a1b, #EDE8FF)' : isDone ? 'var(--a3b, #E6F9F0)' : 'transparent',
                    border: isCurrent ? '1px solid rgba(61,31,168,0.2)' : isDone ? '1px solid rgba(0,160,90,0.2)' : '1px solid transparent',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--a1, #3D1FA8)' : isDone ? 'var(--a3, #00A05A)' : 'var(--divider, #E8E8EE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: isCurrent || isDone ? '#fff' : 'var(--muted, #888)',
                    flexShrink: 0,
                  }}>
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--a1, #3D1FA8)' : isDone ? 'var(--a3, #00A05A)' : 'var(--muted, #888)',
                    whiteSpace: 'nowrap',
                  }}>{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        width: '100%',
        maxWidth: '640px',
        padding: '24px 16px 0',
        flex: 1,
      }}>
        {/* Step heading */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--a1, #3D1FA8)',
            letterSpacing: '.8px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            Step {currentStep} of {totalSteps}
          </div>
          <div style={{
            fontFamily: '"Inter Tight", sans-serif',
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--ink, #1A1A2E)',
            lineHeight: 1.2,
          }}>
            {stepName}
          </div>
        </div>

        {/* Step body */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--divider, #E8E8EE)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          {children}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={onBack}
            disabled={isFirstStep}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid var(--divider, #E8E8EE)',
              cursor: isFirstStep ? 'not-allowed' : 'pointer',
              background: '#fff',
              color: isFirstStep ? 'var(--muted, #888)' : 'var(--ink, #1A1A2E)',
              fontFamily: '"Inter", sans-serif',
              opacity: isFirstStep ? 0.4 : 1,
              transition: 'all .15s',
            }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isLastStep && (
              <button
                onClick={onSkip}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: 'var(--muted, #888)',
                  fontFamily: '"Inter", sans-serif',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                Skip for now
              </button>
            )}

            <button
              onClick={nextDisabled ? undefined : onNext}
              disabled={nextDisabled}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: nextDisabled ? 'not-allowed' : 'pointer',
                background: nextDisabled ? 'var(--a1, #3D1FA8)' : 'var(--a1, #3D1FA8)',
                color: '#fff',
                fontFamily: '"Inter", sans-serif',
                transition: 'all .15s',
                opacity: nextDisabled ? 0.4 : 1,
              }}
            >
              {isLastStep ? 'Launch →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '40px',
        fontSize: '10px',
        color: 'var(--faint, #BABAC8)',
        textAlign: 'center',
      }}>
        Powered by <strong style={{ color: 'var(--muted, #888)' }}>TradesAI</strong>
      </div>
    </div>
  );
}
