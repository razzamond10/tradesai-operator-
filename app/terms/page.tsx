import Link from 'next/link';
import Footer from '@/components/Footer';

const BG   = 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)';
const CYAN = '#00d4ff';
const GOLD = '#d4af37';

const sections = [
  { id: 'definitions',    title: '1. Definitions' },
  { id: 'service',        title: '2. Service Description' },
  { id: 'subscription',   title: '3. Subscription & Billing' },
  { id: 'cancellation',   title: '4. Cancellation' },
  { id: 'refunds',        title: '5. Refund Policy' },
  { id: 'acceptable-use', title: '6. Acceptable Use' },
  { id: 'liability',      title: '7. Liability Cap' },
  { id: 'availability',   title: '8. Service Availability' },
  { id: 'data-ip',        title: '9. Data Ownership & IP' },
  { id: 'changes',        title: '10. Changes to Terms' },
  { id: 'governing-law',  title: '11. Governing Law' },
  { id: 'contact',        title: '12. Contact' },
];

const H2 = { fontSize: '1.35rem', fontWeight: '700', color: CYAN, margin: '2.5rem 0 1rem', scrollMarginTop: '5rem' } as const;
const P  = { color: '#ccc', lineHeight: '1.8', marginBottom: '1rem' } as const;
const LI = { color: '#ccc', lineHeight: '1.8', marginBottom: '0.4rem' } as const;

export default function TermsPage() {
  const updated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <img src="/logo.jpg" alt="TradesAI Operator" style={{ height: '36px', borderRadius: '6px' }} />
          <span style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>Trades <span style={{ color: GOLD }}>Ai</span> Operator</span>
        </Link>
        <Link href="/" style={{ color: CYAN, fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </header>

      {/* TOC + Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>

        {/* Sticky TOC */}
        <aside className="legal-toc" style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '5rem', display: 'none' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#555', marginBottom: '0.75rem' }}>Contents</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: '0.82rem', color: '#777', textDecoration: 'none', padding: '0.25rem 0', lineHeight: 1.45 }}>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, maxWidth: '720px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Terms of Service</h1>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Last updated: {updated} · TradesAI Operator Ltd (Companies House 17114582)</p>

          <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
            <p style={{ ...P, marginBottom: 0, fontSize: '0.88rem' }}>
              By creating an account or using the TradesAI Operator platform you agree to these Terms. Please read them carefully before proceeding.
            </p>
          </div>

          {/* 1. Definitions */}
          <h2 id="definitions" style={H2}>1. Definitions</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}><strong style={{ color: '#fff' }}>Company / We / Us:</strong> TradesAI Operator Ltd, Companies House 17114582, 5 Brayford Square, London, E1 0SG.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Customer / You:</strong> The trade business that has subscribed to the Service.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>End User:</strong> Any individual who contacts your business via the AI receptionist (callers, enquirers).</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Service:</strong> The TradesAI Operator platform, including the AI receptionist, portal, APIs, and all related features.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Subscription Fee:</strong> The monthly recurring charge for access to the Service.</li>
          </ul>

          {/* 2. Service Description */}
          <h2 id="service" style={H2}>2. Service Description</h2>
          <p style={P}>
            TradesAI Operator provides a 24/7 AI receptionist service for UK trade businesses (plumbers, electricians, HVAC engineers, roofers, and 40+ other trades). The Service handles inbound calls, captures enquiries, books appointments into Google Calendar, logs interactions to Google Sheets, sends SMS confirmations via Twilio, detects emergencies, and provides a management portal for the Customer.
          </p>
          <p style={P}>
            The Service is a software platform. We are not a licensed trade business and we provide no trade services directly. The Customer remains solely responsible for all trade work carried out for End Users.
          </p>

          {/* 3. Subscription & Billing */}
          <h2 id="subscription" style={H2}>3. Subscription & Billing</h2>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Setup fee (one-time, non-refundable after onboarding starts):</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}>£1,197 — covers bespoke AI configuration, Twilio provisioning, Google integrations, and onboarding.</li>
            <li style={LI}>Non-refundable once the onboarding process has commenced.</li>
          </ul>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Monthly subscription (billed in advance):</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}><strong style={{ color: '#fff' }}>Starter</strong> — £447 / month (currently available)</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Professional</strong> — £997 / month (launching October 2026)</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Enterprise</strong> — £2,197 / month (launching October 2026)</li>
          </ul>

          <p style={P}>All fees are quoted exclusive of VAT. Where applicable, VAT will be added at the prevailing UK rate. Payment is due on the billing anniversary each month. Failure to pay within 14 days may result in service suspension.</p>

          {/* 4. Cancellation */}
          <h2 id="cancellation" style={H2}>4. Cancellation</h2>
          <p style={P}>
            Either party may cancel the subscription by providing <strong style={{ color: '#fff' }}>30 days' written notice via email</strong> to <a href="mailto:admin@tradesaioperator.uk" style={{ color: CYAN }}>admin@tradesaioperator.uk</a>. Notice must include your business name and registered account email address.
          </p>
          <p style={P}>
            Upon cancellation, your account remains active until the end of the current billing period. No further charges are taken after the notice period expires. Access to the portal and all Service features ceases at the end of the final billing period.
          </p>
          <p style={P}>
            We may terminate your access immediately and without notice if you materially breach these Terms, fail to pay fees outstanding for more than 30 days, or use the Service for any unlawful purpose.
          </p>

          {/* 5. Refund Policy */}
          <h2 id="refunds" style={H2}>5. Refund Policy</h2>
          <p style={P}>
            Monthly subscription fees are non-refundable except where the Service has experienced <strong style={{ color: '#fff' }}>documented downtime exceeding 10% of total hours in a calendar month</strong> (i.e. less than 90% availability in that month). In that case, the Customer is entitled to a pro-rata refund for the affected period only.
          </p>
          <p style={P}>
            To claim a downtime refund, the Customer must submit a written request with supporting evidence within 14 days of the affected month. Refund claims are assessed against our server monitoring records. Refunds are issued to the original payment method within 14 business days of approval.
          </p>
          <p style={P}>
            The one-time setup fee is non-refundable after onboarding has commenced, regardless of the reason for cancellation.
          </p>

          {/* 6. Acceptable Use */}
          <h2 id="acceptable-use" style={H2}>6. Acceptable Use</h2>
          <p style={P}>You agree not to:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}>Use the Service for any unlawful, fraudulent, or deceptive purpose.</li>
            <li style={LI}>Collect or process End User data beyond what is necessary to deliver trade services.</li>
            <li style={LI}>Reverse-engineer, decompile, or attempt to extract the source code of any part of the platform.</li>
            <li style={LI}>Resell, sublicense, or transfer access to any third party without written consent.</li>
            <li style={LI}>Use the Service in a manner that could harm, overload, or impair its availability for other customers.</li>
            <li style={LI}>Misrepresent the AI receptionist as a human to End Users in a manner that violates applicable law.</li>
          </ul>
          <p style={P}>
            You are responsible for ensuring that your use of the Service complies with all applicable UK regulations, including GDPR, the Consumer Rights Act 2015, and any trade-specific licensing requirements (Gas Safe, NICEIC, etc.).
          </p>

          {/* 7. Liability Cap */}
          <h2 id="liability" style={H2}>7. Limitation of Liability</h2>
          <p style={P}>
            To the fullest extent permitted by law, our total aggregate liability to you for all claims arising under or in connection with these Terms shall not exceed the total fees paid by you to us in the <strong style={{ color: '#fff' }}>12 months immediately preceding the event giving rise to the claim</strong>.
          </p>
          <p style={P}>
            We shall not be liable for any indirect, consequential, special, or exemplary loss, including loss of revenue, loss of profit, loss of business opportunity, or damage to reputation, even if we have been advised of the possibility of such loss.
          </p>
          <p style={P}>
            Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.
          </p>

          {/* 8. Service Availability */}
          <h2 id="availability" style={H2}>8. Service Availability</h2>
          <p style={P}>
            We target <strong style={{ color: '#fff' }}>99% availability</strong> for the platform, measured monthly. This is a target, not a contractual SLA guarantee. No financial penalty applies for failure to meet the 99% target at the Starter tier.
          </p>
          <p style={P}>
            Downtime may occur due to scheduled maintenance (notified in advance where possible), failures of third-party infrastructure (Retell AI, Twilio, Google, Vercel), force majeure events, or security incidents requiring immediate intervention.
          </p>
          <p style={P}>
            We will use reasonable endeavours to restore service promptly and to notify affected Customers of significant outages via email.
          </p>

          {/* 9. Data Ownership & IP */}
          <h2 id="data-ip" style={H2}>9. Data Ownership & Intellectual Property</h2>
          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Your data:</p>
          <p style={P}>
            The Customer retains full ownership of all data inputted into the Service, including End User data (call records, bookings, transcripts). We process this data on your behalf as a data processor under UK GDPR. See our <Link href="/privacy" style={{ color: CYAN }}>Privacy Policy</Link> for full details.
          </p>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Our intellectual property:</p>
          <p style={P}>
            TradesAI Operator Ltd retains all rights, title, and interest in and to the platform, including all software, AI models, algorithms, APIs, designs, trademarks, and documentation. No rights in our IP are transferred by these Terms. The limited licence granted to use the Service is non-exclusive, non-transferable, and terminates when your subscription ends.
          </p>

          {/* 10. Changes to Terms */}
          <h2 id="changes" style={H2}>10. Changes to These Terms</h2>
          <p style={P}>
            We may update these Terms from time to time. Where changes are material, we will provide <strong style={{ color: '#fff' }}>at least 30 days' notice by email</strong> to your registered address before the new Terms take effect. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.
          </p>
          <p style={P}>
            If you do not accept revised Terms, you may cancel your subscription in accordance with Section 4 before the effective date, and we will issue a pro-rata refund for any unused prepaid period.
          </p>

          {/* 11. Governing Law */}
          <h2 id="governing-law" style={H2}>11. Governing Law</h2>
          <p style={P}>
            These Terms are governed by and construed in accordance with the laws of England and Wales. Both parties submit to the exclusive jurisdiction of the courts of England and Wales for the resolution of any dispute arising under or in connection with these Terms.
          </p>
          <p style={P}>
            We encourage good-faith discussion to resolve any dispute before formal legal action. Where a dispute cannot be resolved informally, either party may refer the matter to the courts.
          </p>

          {/* 12. Contact */}
          <h2 id="contact" style={H2}>12. Contact</h2>
          <div style={{ paddingLeft: '1rem', borderLeft: `2px solid rgba(0,212,255,0.3)` }}>
            <p style={{ ...P, marginBottom: '0.25rem' }}><strong style={{ color: '#fff' }}>TradesAI Operator Ltd</strong></p>
            <p style={{ ...P, marginBottom: '0.25rem' }}>5 Brayford Square, London, E1 0SG</p>
            <p style={{ ...P, marginBottom: 0 }}><a href="mailto:admin@tradesaioperator.uk" style={{ color: CYAN }}>admin@tradesaioperator.uk</a></p>
          </div>
        </main>
      </div>

      <Footer />

      <style>{`
        @media (min-width: 900px) { .legal-toc { display: block !important; } }
        @media (max-width: 640px) { header { padding: 0.75rem 1rem !important; } }
      `}</style>
    </div>
  );
}
