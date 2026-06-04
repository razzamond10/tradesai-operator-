import { validateToken } from '@/lib/onboarding/tokens';
import OnboardingClient from './OnboardingClient';

interface Props {
  params: { token: string };
}

export default async function OnboardingPage({ params }: Props) {
  const result = await validateToken(params.token);

  if (!result.valid) {
    return <ExpiredPage />;
  }

  return <OnboardingClient token={params.token} initialState={result} />;
}

function ExpiredPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--slate, #F8F8FB)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--divider, #E8E8EE)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{ height: '4px', background: 'var(--a4, #C01830)' }} />
        <div style={{ padding: '40px 32px 36px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'var(--a4b, #FFF0F2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            margin: '0 auto 20px',
          }}>
            🔗
          </div>

          <div style={{
            fontFamily: '"Inter Tight", sans-serif',
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--ink, #1A1A2E)',
            marginBottom: '10px',
            lineHeight: 1.2,
          }}>
            Link expired or invalid
          </div>

          <div style={{
            fontSize: '13px',
            color: 'var(--muted, #888)',
            lineHeight: 1.7,
            marginBottom: '28px',
          }}>
            This onboarding link is no longer active — it may have expired
            (links are valid for 7 days) or already been used.
          </div>

          <div style={{
            padding: '14px 16px',
            background: 'var(--slate, #F8F8FB)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--muted, #888)',
            lineHeight: 1.6,
          }}>
            Need a new link? Contact your TradesAI account manager or reply to
            your original onboarding email.
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '24px',
        fontSize: '10px',
        color: 'var(--faint, #BABAC8)',
      }}>
        Powered by <strong style={{ color: 'var(--muted, #888)' }}>TradesAI</strong>
      </div>
    </div>
  );
}
