'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WizardShell, { STEP_NAMES } from '@/components/wizard/WizardShell';
import type { TokenValidResult } from '@/lib/onboarding/tokens';

const TOTAL_STEPS = 5;

interface Props {
  token: string;
  initialState: TokenValidResult;
}

export default function OnboardingClient({ token, initialState }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialState.current_step);
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    initialState.draft_json ?? {}
  );

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  function goToStep(step: number) {
    setCurrentStep(Math.max(1, Math.min(TOTAL_STEPS, step)));
  }

  function next() {
    if (!isLastStep) goToStep(currentStep + 1);
  }

  function back() {
    if (!isFirstStep) goToStep(currentStep - 1);
  }

  function skip() {
    if (!isLastStep) goToStep(currentStep + 1);
  }

  // Expose setAnswers for step bodies when built (A1–A5)
  void answers;
  void setAnswers;
  void router;
  void token;

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      businessName={initialState.business_name || undefined}
      onBack={back}
      onNext={next}
      onSkip={skip}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    >
      <StepPlaceholder step={currentStep} />
    </WizardShell>
  );
}

function StepPlaceholder({ step }: { step: number }) {
  const name = STEP_NAMES[step - 1];
  return (
    <div style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'var(--a1b, #EDE8FF)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        margin: '0 auto 16px',
      }}>
        {['🏢', '📍', '📞', '📅', '🚀'][step - 1]}
      </div>
      <div style={{
        fontFamily: '"Inter Tight", sans-serif',
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--ink, #1A1A2E)',
        marginBottom: '8px',
      }}>
        Step {step} — {name}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--muted, #888)',
        lineHeight: 1.6,
        maxWidth: '320px',
        margin: '0 auto',
      }}>
        This step body is coming in task A{step}. Navigation, progress bar, and skip are all wired.
      </div>
    </div>
  );
}
