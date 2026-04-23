'use client';
import Link from 'next/link';
import { requiredTierFor, TIER_LABELS, TIER_PRICING, TIER_TAGLINES, type Tier } from '@/lib/tiers';

const BENEFITS_MAP: Record<string, string[]> = {
  'page.analytics': [
    'Call volume trends broken down by day, week and month',
    'Call outcome and intent analysis (what callers are asking for)',
    'Peak hour heatmaps to optimise staffing',
    'Lead source attribution to know where enquiries come from',
  ],
  'page.forecasting': [
    '30-day revenue and call volume projections',
    'Day-of-week demand analysis',
    'Seasonal trend modelling based on your data',
    'Avg daily call and revenue KPIs',
  ],
  'page.revenueTracker': [
    'Full revenue breakdown by job type',
    'Month-over-month revenue trends',
    'Booking value tracking and CSV export',
    'Projected monthly earnings at current rate',
  ],
  'page.leadPipeline': [
    'Visual lead status pipeline',
    'Conversion rate by outcome type',
    'Lost lead analysis to identify drop-off points',
    'Pipeline stage metrics and movement tracking',
  ],
  'page.reviews': [
    'Automated review request SMS after every job',
    'Star rating tracking and sentiment overview',
    'Google & Trustpilot integration',
    'Review response templates',
  ],
  'page.marketplace': [
    'Access to the TradesAI partner marketplace',
    'Cross-trade referral network',
    'Verified supplier integrations',
    'Preferred pricing on partner tools',
  ],
  'page.aiInsights': [
    'AI-generated narrative business insights',
    'Automated performance commentary',
    'Anomaly detection and trend alerts',
    'Actionable weekly summaries',
  ],
};

const DEFAULT_BENEFITS: string[] = [
  'Advanced reporting and analytics',
  'Automation and smart integrations',
  'Priority customer support',
  'More visibility into your business performance',
];

export default function UpgradeTeaser({
  featureKey,
  featureName,
  benefits,
}: {
  featureKey: string;
  featureName: string;
  benefits?: string[];
}) {
  const requiredTier: Tier = requiredTierFor(featureKey) as Tier;
  const tierLabel = TIER_LABELS[requiredTier];
  const pricing = TIER_PRICING[requiredTier];
  const tagline = TIER_TAGLINES[requiredTier];
  const bullets = benefits ?? BENEFITS_MAP[featureKey] ?? DEFAULT_BENEFITS;
  const upgradeHref = `/dashboard/upgrade?feature=${encodeURIComponent(featureKey)}`;
  const callHref = `/dashboard/upgrade?feature=${encodeURIComponent(featureKey)}&action=call`;

  return (
    <div style={{
      maxWidth: '480px', margin: '48px auto', padding: '32px 28px',
      background: '#fff', borderRadius: '14px',
      border: '1px solid var(--divider)',
      boxShadow: '0 4px 24px rgba(26,10,60,0.10)',
      textAlign: 'center',
      fontFamily: '"Inter",system-ui,sans-serif',
    }}>
      {/* Lock icon */}
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>

      {/* Feature name */}
      <div style={{
        fontFamily: '"Inter Tight",sans-serif', fontSize: '18px', fontWeight: 800,
        color: 'var(--ink)', marginBottom: '6px',
      }}>
        {featureName}
      </div>

      {/* Upgrade callout */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'var(--a1b)', color: 'var(--a1)',
        fontSize: '11px', fontWeight: 700, padding: '4px 12px',
        borderRadius: '20px', marginBottom: '10px',
      }}>
        Upgrade to {tierLabel} to unlock
      </div>

      {/* Tagline */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.5 }}>
        {tagline}
      </p>

      {/* Benefits list */}
      <ul style={{ textAlign: 'left', listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            fontSize: '12px', color: 'var(--ink)', marginBottom: '8px',
          }}>
            <span style={{ color: 'var(--a3)', flexShrink: 0, marginTop: '1px' }}>✓</span>
            {b}
          </li>
        ))}
      </ul>

      {/* Primary CTA */}
      <Link href={upgradeHref} style={{
        display: 'block', width: '100%',
        padding: '12px 20px', borderRadius: '8px',
        background: 'var(--a1)', color: '#fff',
        fontSize: '13px', fontWeight: 700,
        textDecoration: 'none', textAlign: 'center',
        marginBottom: '10px',
        fontFamily: '"Inter",system-ui,sans-serif',
      }}>
        Upgrade to {tierLabel} — {pricing}
      </Link>

      {/* Secondary link */}
      <Link href={callHref} style={{
        fontSize: '11px', color: 'var(--muted)', textDecoration: 'underline',
      }}>
        Book a call to learn more
      </Link>
    </div>
  );
}
