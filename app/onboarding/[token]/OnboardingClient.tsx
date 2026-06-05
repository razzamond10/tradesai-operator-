'use client';
import { useState } from 'react';
import WizardShell, { STEP_NAMES } from '@/components/wizard/WizardShell';
import type { TokenValidResult } from '@/lib/onboarding/tokens';
import Step1BusinessDetails, {
  type BusinessAnswers,
  step1Valid,
} from './Step1BusinessDetails';
import Step2ServicesOffered, {
  type ServicesAnswers,
  step2Valid,
} from './Step2ServicesOffered';

const TOTAL_STEPS = 5;

// Typed answers — one namespace per step so steps don't collide.
// Steps 3–5 are added as A3–A5 are built.
interface Answers {
  business?: BusinessAnswers;
  services?: ServicesAnswers;
}

interface Props {
  token: string;
  initialState: TokenValidResult;
}

export default function OnboardingClient({ token, initialState }: Props) {
  const [currentStep, setCurrentStep] = useState(initialState.current_step);

  // Pre-fill step 1 from the token row (business_name, client_email, trade_type).
  // If draft_json already has a business namespace (resume flow), use that instead.
  const existingDraft = (initialState.draft_json ?? {}) as Answers;
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...existingDraft,
    business: existingDraft.business ?? {
      business_name: initialState.business_name || '',
      owner_name: '',
      phone: '',
      email: initialState.client_email || '',
      trade_type: initialState.trade_type || '',
    },
  }));

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Next is gated only on steps with real forms. Placeholders always allow Next.
  const canNext =
    (currentStep === 1 ? step1Valid(answers.business) : true) &&
    (currentStep === 2 ? step2Valid(answers.services) : true);

  function goToStep(step: number) {
    setCurrentStep(Math.max(1, Math.min(TOTAL_STEPS, step)));
  }

  function next() {
    if (!isLastStep && canNext) goToStep(currentStep + 1);
  }

  function back() {
    if (!isFirstStep) goToStep(currentStep - 1);
  }

  function skip() {
    // Skip bypasses per-step validation by design (item 8).
    if (!isLastStep) goToStep(currentStep + 1);
  }

  function setBusinessAnswers(b: BusinessAnswers) {
    setAnswers((prev) => ({ ...prev, business: b }));
  }

  function setServicesAnswers(s: ServicesAnswers) {
    setAnswers((prev) => ({ ...prev, services: s }));
  }

  // Silence unused vars until A8 persistence wires them.
  void token;

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      businessName={answers.business?.business_name || initialState.business_name || undefined}
      onBack={back}
      onNext={next}
      onSkip={skip}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      nextDisabled={!canNext}
    >
      {currentStep === 1 ? (
        <Step1BusinessDetails
          values={answers.business!}
          onChange={setBusinessAnswers}
        />
      ) : currentStep === 2 ? (
        <Step2ServicesOffered
          values={answers.services ?? { selected: [] }}
          onChange={setServicesAnswers}
          tradeType={answers.business?.trade_type ?? ''}
          businessName={answers.business?.business_name ?? initialState.business_name ?? ''}
        />
      ) : (
        <StepPlaceholder step={currentStep} />
      )}
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
