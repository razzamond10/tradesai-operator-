'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';
import { requiredTierFor, TIER_LABELS, TIER_PRICING, TIER_TAGLINES, TIER_ORDER, type Tier } from '@/lib/tiers';

const TIER_FEATURES: Record<Tier, string[]> = {
  starter: [
    'AI-powered call answering 24/7',
    'Automatic job booking & calendar sync',
    'Live emergency call detection',
    'Job schedule & bookings calendar',
    'Basic communications log',
    'Business configuration',
    'Mobile-friendly PWA portal',
  ],
  professional: [
    'Everything in Starter',
    'Advanced analytics & call trends',
    'Revenue tracker & monthly reports',
    'Forecasting & 30-day projections',
    'Lead pipeline with conversion tracking',
    'Automated review request SMS',
    'WhatsApp integration',
    'Stripe deposit collection',
    'Multi-engineer scheduling',
    'Follow-up & reminder automation',
  ],
  enterprise: [
    'Everything in Professional',
    'Multi-location management',
    'AI narrative insights & anomaly alerts',
    'Competitor intelligence',
    'Demand & weather-based scheduling',
    'Zapier / API access',
    'White-label branding & custom domain',
    'Parts ordering integration',
    'Fleet tracking',
    'RBAC, 2FA, IP allowlist, audit log',
    'Dedicated account manager',
    'Same-day support SLA',
  ],
};

const TIER_BADGE_COLORS: Record<Tier, { bg: string; color: string; border: string }> = {
  starter:      { bg: 'var(--a3b)', color: 'var(--a3)', border: 'var(--a3)' },
  professional: { bg: 'var(--a1b)', color: 'var(--a1)', border: 'var(--a1)' },
  enterprise:   { bg: 'var(--a2b)', color: 'var(--a6)', border: 'var(--a2)' },
};

export default function UpgradePage({
  featureKey,
  action,
  planTier,
  userName,
}: {
  featureKey: string | null;
  action: string | null;
  planTier: string;
  userName: string;
}) {
  const [config, setConfig] = useState<{ businessName?: string; tradeType?: string } | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => { if (d.config) setConfig(d.config); })
      .catch(() => {});
  }, []);

  const currentTier = (planTier ?? 'starter') as Tier;
  const highlightTier: Tier | null = featureKey ? requiredTierFor(featureKey) as Tier : null;

  return (
    <ClientShell planTier={planTier} userName={userName} businessName={config?.businessName} tradeType={config?.tradeType}>
      <Topbar breadcrumb="Upgrade" page="Upgrade Plan" sub="Unlock more features for your business" />
      <div style={{ padding: '24px 22px', flex: 1, overflowY: 'auto', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
            Grow your business with TradesAI
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '460px', margin: '0 auto' }}>
            You&apos;re currently on the <strong>{TIER_LABELS[currentTier]}</strong> plan.
            {highlightTier && highlightTier !== currentTier && (
              <> Upgrade to <strong>{TIER_LABELS[highlightTier]}</strong> to unlock this feature.</>
            )}
          </div>
        </div>

        {/* Pricing grid */}
        <div className="upgrade-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {(TIER_ORDER as readonly Tier[]).map((t) => {
            const isHighlighted = t === highlightTier;
            const isCurrent = t === currentTier;
            const colors = TIER_BADGE_COLORS[t];
            const mailSubject = encodeURIComponent(`Upgrade to ${TIER_LABELS[t]} — TradesAI`);
            return (
              <div key={t} style={{
                background: '#fff', borderRadius: '14px', overflow: 'hidden',
                border: isHighlighted ? `2px solid ${colors.border}` : '1px solid var(--divider)',
                boxShadow: isHighlighted ? '0 8px 32px rgba(26,10,60,0.14)' : 'var(--shadow-s)',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                {/* Most popular badge */}
                {t === 'professional' && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    fontSize: '8px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                    background: 'var(--a1)', color: '#fff', letterSpacing: '0.5px',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--divider)' }}>
                  <div style={{
                    display: 'inline-block', fontSize: '9px', fontWeight: 800, padding: '2px 8px',
                    borderRadius: '8px', background: colors.bg, color: colors.color,
                    border: `1px solid ${colors.border}30`, marginBottom: '8px',
                  }}>
                    {TIER_LABELS[t].toUpperCase()}
                  </div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', marginBottom: '2px' }}>
                    {TIER_PRICING[t]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
                    {TIER_TAGLINES[t]}
                  </div>
                  {isCurrent && (
                    <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 700, color: 'var(--a3)' }}>
                      ✓ Your current plan
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {TIER_FEATURES[t].map((f, i) => (
                      <li key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        fontSize: '11.5px', color: 'var(--ink)', marginBottom: '7px',
                      }}>
                        <span style={{ color: 'var(--a3)', flexShrink: 0, marginTop: '1px' }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTAs */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!isCurrent && (
                    <button
                      onClick={() => alert('Stripe integration coming soon — please book a call to upgrade.')}
                      style={{
                        padding: '10px 16px', borderRadius: '8px',
                        background: isHighlighted ? colors.color : 'var(--a1)',
                        color: '#fff', fontSize: '12px', fontWeight: 700,
                        border: 'none', cursor: 'pointer', width: '100%',
                        fontFamily: '"Inter",system-ui,sans-serif',
                      }}
                    >
                      Upgrade to {TIER_LABELS[t]}
                    </button>
                  )}
                  <a
                    href={`mailto:admin@tradesaioperator.uk?subject=${mailSubject}`}
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '9px 16px', borderRadius: '8px',
                      background: 'var(--slate)', color: 'var(--ink)',
                      fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    📞 Book a call
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'underline' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .upgrade-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </ClientShell>
  );
}
