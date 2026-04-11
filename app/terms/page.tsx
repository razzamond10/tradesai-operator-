'use client';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1540 100%)', color: '#e0e0e0', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: '#fff' }}>Terms & Conditions</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>Last updated: April 11, 2026</p>

        {/* 1. Agreement to Terms */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>1. Agreement to Terms</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            By accessing and using TradesAI Operator ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree to any part of these terms, you may not use the Service. TradesAI Operator is provided by Raymond Sovereign Ltd trading as TradesAI Operator ("Company", "we", "us", "our").
          </p>
        </section>

        {/* 2. Service Description */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>2. Service Description</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            TradesAI Operator provides a 24/7 AI-powered virtual receptionist service for UK trade businesses (plumbers, electricians, HVAC engineers, roofers, builders, and 40+ other trades). The Service includes:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>AI voice receptionist answering calls 24/7</li>
            <li>Google Calendar integration for appointment booking</li>
            <li>Google Sheets auto-logging of customer interactions</li>
            <li>SMS reminders and confirmations</li>
            <li>Emergency protocol detection and handling</li>
            <li>Customer compliance certificate management</li>
            <li>Smart lead scoring and analytics</li>
            <li>Integration with Twilio for SMS and phone services</li>
          </ul>
        </section>

        {/* 3. Subscription & Billing */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>3. Subscription & Billing</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Setup Fee:</strong> £1,197 one-time setup fee (non-refundable) covers initial configuration, voice setup, and system integration.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Monthly Retainer:</strong> £447/month recurring subscription. Billing occurs on the same date each month. A 1-year contract is required.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Payment:</strong> You agree to pay all fees in accordance with the pricing terms. We accept bank transfers and credit cards. Failure to pay will result in suspension of Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Taxes:</strong> All fees are exclusive of VAT and other applicable taxes, which you are responsible for paying.
          </p>
        </section>

        {/* 4. User Responsibilities */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>4. User Responsibilities</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You agree to:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Use the Service only for your legitimate trade business operations</li>
            <li>Provide accurate business information and comply with all applicable UK trade regulations</li>
            <li>Maintain confidentiality of your Twilio phone number and API credentials</li>
            <li>Not use the Service for unlawful, defamatory, or abusive purposes</li>
            <li>Not reverse-engineer, copy, or redistribute the Service</li>
            <li>Not exceed fair usage limits or attempt to overload the system</li>
            <li>Comply with industry-specific regulations (Gas Safe, NICEIC, etc.) for your trade</li>
          </ul>
        </section>

        {/* 5. Data & Privacy */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>5. Data & Privacy</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Ownership:</strong> You own all customer data collected through the Service (call logs, bookings, customer details). We act as a data processor on your behalf.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Processing:</strong> Customer data is stored securely in Google Sheets and Google Calendar (your own accounts). We do not sell or share your data with third parties. Data is encrypted in transit and at rest.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>GDPR Compliance:</strong> We comply with UK GDPR regulations. You are responsible for obtaining customer consent to store and process their data. Please refer to our separate Privacy Policy for full details.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Retention:</strong> Data is retained for the duration of your contract. Upon termination, we will provide 30 days for you to export your data before deletion.
          </p>
        </section>

        {/* 6. AI & Voice Technology */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>6. AI & Voice Technology</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>AI Model:</strong> The Service uses Claude Haiku (Anthropic) for voice AI. The AI is designed to handle UK trade business calls, provide professional customer service, and detect emergencies.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>AI Limitations:</strong> While the AI is highly accurate, it is not infallible. The AI may occasionally misunderstand accents, technical terminology, or complex requests. You are responsible for reviewing critical interactions and verifying emergency protocols.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Voice Quality:</strong> Voice is provided by ElevenLabs custom voice technology. Call quality depends on internet connectivity and phone network reliability. We do not guarantee perfect audio in all conditions.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Emergency Handling:</strong> The AI is programmed to detect emergency keywords (gas leak, flooding, electrical fire, etc.) and alert you immediately via SMS. However, you should have manual call handling procedures as backup.
          </p>
        </section>

        {/* 7. Service Availability & Uptime */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>7. Service Availability & Uptime</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We aim to maintain 99.5% uptime for the Service. However, we do not guarantee uninterrupted service. Downtime may occur due to:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Scheduled maintenance (we will provide 48-hour notice when possible)</li>
            <li>Third-party service failures (Google, Twilio, Anthropic, ElevenLabs)</li>
            <li>Network or internet outages beyond our control</li>
            <li>Security incidents or emergency patches</li>
          </ul>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            During outages, calls may not be answered. We recommend maintaining backup call handling procedures.
          </p>
        </section>

        {/* 8. Warranties & Disclaimers */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>8. Warranties & Disclaimers</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Service Warranty:</strong> We warrant that the Service will perform substantially in accordance with our published documentation. If it does not, we will work to remediate the issue.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Disclaimer:</strong> EXCEPT AS EXPRESSLY STATED ABOVE, THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We do not guarantee that the Service will be error-free, virus-free, or perfectly suited to your business needs. You use the Service at your own risk.
          </p>
        </section>

        {/* 9. Limitation of Liability */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>9. Limitation of Liability</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE FEES YOU PAID IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            IN NO EVENT SHALL WE BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST REVENUE, LOST PROFITS, OR LOSS OF BUSINESS OPPORTUNITIES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This limitation applies to all claims arising under these Terms, including breach of warranty, breach of contract, negligence, or otherwise.
          </p>
        </section>

        {/* 10. Indemnification */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>10. Indemnification</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You agree to indemnify and hold harmless TradesAI Operator, its founders, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Your use of the Service in violation of these Terms</li>
            <li>Your violation of applicable laws or regulations</li>
            <li>Customer complaints or disputes arising from your business operations</li>
            <li>Data breaches resulting from your failure to secure credentials</li>
            <li>Your alleged infringement of third-party intellectual property rights</li>
          </ul>
        </section>

        {/* 11. Termination */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>11. Termination</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Contract Term:</strong> Your subscription is for a 1-year term. At the end of the term, it will automatically renew for another year unless either party provides 30 days' written notice of termination.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Early Termination:</strong> Early termination is not permitted during the 1-year contract period. The setup fee (£1,197) is non-refundable.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Termination for Cause:</strong> We reserve the right to terminate your access immediately if you:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Violate these Terms</li>
            <li>Fail to pay fees for 30 days</li>
            <li>Use the Service for illegal or harmful purposes</li>
            <li>Breach confidentiality or security obligations</li>
          </ul>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Effect of Termination:</strong> Upon termination, your access to the Service will cease immediately. We will provide 30 days for you to export your data from Google Sheets and Google Calendar.
          </p>
        </section>

        {/* 12. Modifications to Terms */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>12. Modifications to Terms</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We may modify these Terms from time to time. If we make material changes, we will notify you via email at least 30 days before the changes take effect. Your continued use of the Service after the changes means you accept the new Terms.
          </p>
        </section>

        {/* 13. Intellectual Property */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>13. Intellectual Property</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Our IP:</strong> All TradesAI Operator software, code, voice models, and AI systems are our proprietary property. You are granted a limited license to use the Service for your business only.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Your IP:</strong> You retain all rights to your customer data, business information, and any content you provide. You grant us a non-exclusive license to process this data to provide the Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Feedback:</strong> Any feedback, suggestions, or improvements you provide to us may be used by us without compensation or attribution.
          </p>
        </section>

        {/* 14. Compliance & Regulations */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>14. Compliance & Regulations</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Trade-Specific Compliance:</strong> You are responsible for ensuring your use of the Service complies with all relevant UK trade regulations, including Gas Safe, NICEIC, NAPIT, TrustMark, and other industry certifications required for your trade.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Customer Data Compliance:</strong> You must obtain proper customer consent before using the Service to log, store, or process their data. You are responsible for GDPR compliance.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Emergency Protocols:</strong> While the Service includes emergency detection, you should maintain independent emergency response procedures and train your team accordingly.
          </p>
        </section>

        {/* 15. Dispute Resolution */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>15. Dispute Resolution</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Governing Law:</strong> These Terms are governed by the laws of England and Wales, without regard to conflict of law principles.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Jurisdiction:</strong> Both parties agree to submit to the exclusive jurisdiction of the courts of England and Wales for any disputes.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Dispute Process:</strong> Before initiating legal action, you agree to attempt to resolve disputes in good faith through direct communication with us at legal@tradesaioperator.uk.
          </p>
        </section>

        {/* 16. Contact Information */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>16. Contact Information</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            For questions about these Terms & Conditions, please contact:
          </p>
          <p style={{ lineHeight: '1.8' }}>
            <strong>TradesAI Operator Ltd</strong><br />
            Raymond Sovereign Ltd (HoldCo)<br />
            Virtual UK Office, London<br />
            Email: legal@tradesaioperator.uk<br />
            Web: https://tradesaioperator.com
          </p>
        </section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(100,180,220,0.2)', paddingTop: '2rem', marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
          <p>These Terms & Conditions are effective as of April 11, 2026. This is a preliminary version. A full legal review will be conducted before the first paying customer is onboarded.</p>
        </div>
      </div>
    </div>
  );
}
