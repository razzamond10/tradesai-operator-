export const TIER_ORDER = ['starter', 'professional', 'enterprise'] as const;
export type Tier = (typeof TIER_ORDER)[number];

export const TIER_LABELS: Record<Tier, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const TIER_PRICING: Record<Tier, string> = {
  starter: '£447/mo',
  professional: '£997/mo',
  enterprise: '£2,197/mo',
};

export const TIER_TAGLINES: Record<Tier, string> = {
  starter: 'Everything a solo trader or 1–3 person team needs to never miss a lead.',
  professional: 'For growing businesses with 3–10 engineers who want full visibility and automation.',
  enterprise: 'For established businesses, multi-location operators, and agencies running at scale.',
};

export const FEATURE_TIERS: Record<string, Tier> = {
  // Sidebar pages — Starter (everyone sees)
  'page.dashboard': 'starter',
  'page.jobSchedule': 'starter',
  'page.bookingsCalendar': 'starter',
  'page.emergencies': 'starter',
  'page.communications': 'starter',
  'page.configuration': 'starter',
  'page.myAccount': 'starter',
  'page.leads': 'starter',
  'page.revenueSummary': 'starter',
  'page.pwaMobile': 'starter',

  // Sidebar pages — Professional
  'page.analytics': 'professional',
  'page.forecasting': 'professional',
  'page.revenueTracker': 'professional',
  'page.leadPipeline': 'professional',
  'page.customerProfiles': 'professional',
  'page.reviews': 'professional',
  'page.smsThreads': 'professional',
  'page.invoices': 'professional',
  'page.multiEngineer': 'professional',
  'page.routing': 'professional',
  'page.warrantyTracker': 'professional',

  // Sidebar pages — Enterprise
  'page.marketplace': 'enterprise',
  'page.whitelabel': 'enterprise',
  'page.multiLocation': 'enterprise',
  'page.aiInsights': 'enterprise',
  'page.competitorIntel': 'enterprise',
  'page.demandAlerts': 'enterprise',
  'page.auditLog': 'enterprise',
  'page.embeddableBooking': 'enterprise',
  'page.weatherScheduling': 'enterprise',
  'page.adSpendRoi': 'enterprise',
  'page.partsOrdering': 'enterprise',
  'page.fleetTracking': 'enterprise',

  // Widgets inside shared pages (CRM hub tiering)
  'widget.liveActivityFeed': 'professional',
  'widget.pipelineKanban': 'professional',
  'widget.quoteAnalytics': 'professional',
  'widget.leadPerformanceCharts': 'professional',
  'widget.lifetimeValue': 'professional',
  'widget.vipFlagging': 'professional',
  'widget.conversionPrediction': 'enterprise',
  'widget.dynamicPricing': 'enterprise',
  'widget.aiNarrativeInsights': 'enterprise',
  'widget.scopeOfWorksAi': 'enterprise',

  // Integrations & automation — Professional
  'integration.whatsapp': 'professional',
  'integration.stripeDeposits': 'professional',
  'notifications.email': 'professional',
  'automation.reviewRequestSms': 'professional',
  'automation.maintenanceReminderSms': 'professional',
  'automation.followUpSequences': 'professional',
  'onboarding.selfServeWizard': 'professional',

  // Integrations & automation — Enterprise
  'integration.zapierApi': 'enterprise',
  'integration.engineerMobileApp': 'enterprise',
  'integration.crossTradeReferrals': 'enterprise',
  'integration.supplyChain': 'enterprise',
  'integration.propertyMgmt': 'enterprise',

  // White-label — Enterprise
  'whitelabel.branding': 'enterprise',
  'whitelabel.customDomain': 'enterprise',
  'whitelabel.smsSenderName': 'enterprise',

  // Security — Enterprise
  'security.twoFactor': 'enterprise',
  'security.ipAllowlist': 'enterprise',
  'security.auditLog': 'enterprise',
  'security.rbac': 'enterprise',

  // Payments — Enterprise
  'payments.bnpl': 'enterprise',
  'billing.recurringSubscription': 'enterprise',

  // Enterprise service-level
  'service.dedicatedAM': 'enterprise',
  'service.sameDaySupport': 'enterprise',
  'service.sla999': 'enterprise',
  'service.quarterlyReview': 'enterprise',
  'service.academyAccess': 'enterprise',
};

export function canAccess(userTier: Tier, featureKey: string): boolean {
  const required = FEATURE_TIERS[featureKey];
  if (!required) return true; // unknown features are open
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(required);
}

export function requiredTierFor(featureKey: string): Tier {
  return FEATURE_TIERS[featureKey] ?? 'starter';
}
