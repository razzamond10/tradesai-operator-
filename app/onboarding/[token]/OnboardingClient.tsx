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
import Step3Pricing, {
  type PricingAnswers,
  step3Valid,
} from './Step3Pricing';
import Step4WorkingHours, {
  type WorkingHoursAnswers,
  defaultWorkingHoursAnswers,
  step4Valid,
} from './Step4WorkingHours';
import Step5Review from './Step5Review';
import { type VoiceOption, DEFAULT_VOICE } from '@/components/wizard/VoicePicker';

const TOTAL_STEPS = 5;

// Typed answers — one namespace per step so steps don't collide.
interface Answers {
  business?: BusinessAnswers;
  services?: ServicesAnswers;
  pricing?: PricingAnswers;
  workingHours?: WorkingHoursAnswers;
  voice?: VoiceOption;
}

interface Props {
  token: string;
  initialState: TokenValidResult;
}

export default function OnboardingClient({ token, initialState }: Props) {
  const [currentStep, setCurrentStep] = useState(initialState.current_step);

  // Pre-fill step 1 from the token row.
  // Backward-compat: sheet col L is a single trade_type string → seed trades = [that one].
  // If draft_json already has a business namespace (resume flow), use that instead.
  const existingDraft = (initialState.draft_json ?? {}) as Answers;
  const [answers, setAnswers] = useState<Answers>(() => ({
    ...existingDraft,
    business: existingDraft.business ?? {
      business_name: initialState.business_name || '',
      owner_name: '',
      phone: '',
      email: initialState.client_email || '',
      trades: initialState.trade_type ? [initialState.trade_type] : [],
      primaryTrade: initialState.trade_type || '',
    },
    voice: existingDraft.voice ?? DEFAULT_VOICE,
  }));

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  // Next is gated only on steps with real forms. Placeholders always allow Next.
  const canNext =
    (currentStep === 1 ? step1Valid(answers.business) : true) &&
    (currentStep === 2 ? step2Valid(answers.services) : true) &&
    (currentStep === 3 ? step3Valid(answers.pricing) : true) &&
    (currentStep === 4 ? step4Valid(answers.workingHours) : true);

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
    if (!isLastStep) goToStep(currentStep + 1);
  }

  function setBusinessAnswers(b: BusinessAnswers) {
    setAnswers((prev) => ({ ...prev, business: b }));
  }

  function setServicesAnswers(s: ServicesAnswers) {
    setAnswers((prev) => ({ ...prev, services: s }));
  }

  function setPricingAnswers(p: PricingAnswers) {
    setAnswers((prev) => ({ ...prev, pricing: p }));
  }

  function setWorkingHoursAnswers(w: WorkingHoursAnswers) {
    setAnswers((prev) => ({ ...prev, workingHours: w }));
  }

  function setVoiceAnswer(v: VoiceOption) {
    setAnswers((prev) => ({ ...prev, voice: v }));
  }

  // Silence until A8 persistence wires it.
  void token;

  const businessName = answers.business?.business_name || initialState.business_name || '';
  const trades = answers.business?.trades ?? [];
  const primaryTrade = answers.business?.primaryTrade ?? '';

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      businessName={businessName || undefined}
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
          voice={answers.voice ?? DEFAULT_VOICE}
          onVoiceChange={setVoiceAnswer}
        />
      ) : currentStep === 2 ? (
        <Step2ServicesOffered
          values={answers.services ?? { selected: [] }}
          onChange={setServicesAnswers}
          trades={trades}
          businessName={businessName}
        />
      ) : currentStep === 3 ? (
        <Step3Pricing
          initialRows={answers.pricing?.rows}
          selectedServices={answers.services?.selected ?? []}
          trades={trades}
          primaryTrade={primaryTrade}
          businessName={businessName}
          onChange={setPricingAnswers}
        />
      ) : currentStep === 4 ? (
        <Step4WorkingHours
          values={answers.workingHours ?? defaultWorkingHoursAnswers()}
          onChange={setWorkingHoursAnswers}
        />
      ) : currentStep === 5 ? (
        <Step5Review
          answers={answers}
          onGoToStep={goToStep}
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
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'var(--a1b, #EDE8FF)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px', margin: '0 auto 16px',
      }}>
        {['🏢', '📍', '📞', '📅', '🚀'][step - 1]}
      </div>
      <div style={{
        fontFamily: '"Inter Tight", sans-serif', fontSize: '16px', fontWeight: 700,
        color: 'var(--ink, #1A1A2E)', marginBottom: '8px',
      }}>
        Step {step} — {name}
      </div>
      <div style={{
        fontSize: '12px', color: 'var(--muted, #888)', lineHeight: 1.6,
        maxWidth: '320px', margin: '0 auto',
      }}>
        This step body is coming in task A{step}. Navigation, progress bar, and skip are all wired.
      </div>
    </div>
  );
}
