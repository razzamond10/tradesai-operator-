'use client';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1540 100%)', color: '#e0e0e0', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: '#fff' }}>Terms & Conditions</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>Last updated: April 11, 2026</p>

        <div style={{ background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.4)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <p style={{ lineHeight: '1.8', margin: '0', fontWeight: '600' }}>
            <strong>IMPORTANT:</strong> By submitting the signup form, creating an account, or using TradesAI Operator services, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set out below. Your continued use of the Service constitutes acceptance of these Terms.
          </p>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>1. Agreement to Terms & Service Acceptance</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This Terms & Conditions Agreement constitutes a legal and binding contract between you (the "Client" or "Customer") and TradesAI Operator, operated by Raymond Sovereign Ltd ("Company", "we", "us", "our", "Provider"). By completing the signup process, submitting payment information, or accessing the Service in any manner, you represent that you are authorised to enter into this binding contract on behalf of your business and that you accept all terms contained herein without reservation or modification.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>2. Service Description</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            TradesAI Operator provides an artificial intelligence-powered virtual receptionist service for small to medium-sized UK trade businesses. The Service includes: 24/7 AI call reception, voice configuration, Google Calendar integration, auto-logging to Google Sheets, SMS confirmations, emergency detection, compliance certificate management, and intelligent lead scoring.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ff4444' }}>3. Subscription Fees & Billing</h2>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>Setup Fee</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            A one-time, non-refundable setup fee of £1,197.00 GBP is required upon subscription. This covers system configuration, voice customisation, integrations, phone provisioning, and onboarding. The setup fee is non-refundable under all circumstances, including early cancellation or service dissatisfaction.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>Monthly Subscription</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Service costs £447.00 GBP per calendar month, billed in advance on your billing anniversary. Your subscription requires a 12-month Initial Term commitment.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ff4444' }}>4. Cancellation Policy - CRITICAL</h2>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>7-Day Cancellation Window</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You may cancel within 7 calendar days of initial payment by emailing legal@tradesaioperator.uk. A cancellation request must include your business name and account email.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>Non-Refundable Cancellation Fee: £500</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>If you cancel within the 7-day window, a non-refundable £500.00 cancellation fee applies.</strong> This fee covers our costs for bespoke system configuration, Twilio phone provisioning, Google Workspace integration, API setup, team onboarding time, and administrative processing.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Fee Application:</strong> Your £1,197 setup fee is non-refundable. The £500 cancellation fee is deducted from any balance owed. You will receive an itemised statement within 5 business days.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>No Cancellation After Day 7</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            After the 7-day window expires, you are locked into the full 12-month Initial Term with no refunds permitted. Early termination after day 7 is not allowed. All outstanding monthly fees for the remainder of the term become immediately due and payable.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>5. Your Obligations</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You agree to: provide accurate business information, comply with all UK trade regulations (Gas Safe, NICEIC, NAPIT, TrustMark), obtain customer consent before logging their data, maintain confidentiality of credentials, not reverse-engineer the Service, not use it for unlawful purposes, and monitor your account for unauthorised access.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>6. Data Ownership & Privacy</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You own all customer data. The Company processes data on your behalf via Google Sheets and Google Calendar (your own accounts). We comply with UK GDPR. Upon termination, you have 30 days to export data before deletion.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>7. AI & Emergency Limitations</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>AI Limitations:</strong> While highly capable, Claude Haiku AI may misunderstand accents or complex requests. The Company does not guarantee error-free performance.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Emergency Detection:</strong> The AI detects common emergency keywords and alerts you via SMS. However, it may fail to detect some emergencies. You must maintain manual emergency response procedures as backup. We are not liable for failure to detect genuine emergencies.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>8. Service Availability</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We aim for 99.5% uptime but do not guarantee uninterrupted service. Downtime may occur due to maintenance, third-party failures (Google, Twilio, Anthropic, ElevenLabs), or security incidents. No refunds are issued for downtime.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>9. Warranties & Disclaimers</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Limited Warranty:</strong> The Service will perform substantially in accordance with our published documentation. If it materially fails, we will remediate the issue or refund monthly fees for the affected month only.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Disclaimer:</strong> EXCEPT AS ABOVE, THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>10. Limitation of Liability</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Cap on Liability:</strong> Our total liability shall not exceed the fees you paid in the 12 months preceding the claim.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Exclusion of Damages:</strong> WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST REVENUE, LOST PROFITS, OR LOSS OF BUSINESS OPPORTUNITIES.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>11. Termination for Cause</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We may terminate your access immediately if you violate these Terms, fail to pay within 30 days, use the Service for unlawful purposes, or breach security obligations. Upon termination for cause, no refunds are issued.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>12. Governing Law</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            These Terms are governed by English law. Both parties submit to exclusive jurisdiction of English courts. Good faith dispute resolution required before legal action.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>13. Contact</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>TradesAI Operator Ltd</strong><br />
            Email: legal@tradesaioperator.uk<br />
            Web: https://tradesaioperator.com<br />
            Registered Office: Virtual UK Office, London
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>14. Severability</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            If any provision of this Agreement is found to be invalid, unenforceable, or illegal by a court of competent jurisdiction, that provision shall be severed from this Agreement and the remaining provisions shall continue in full force and effect. The parties shall negotiate in good faith to replace the severed provision with a valid provision that achieves the original economic and legal intent.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>15. Entire Agreement</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This Agreement, including all referenced documentation and schedules, constitutes the entire agreement between you and the Company regarding the Service and supersedes all prior negotiations, representations, and agreements, whether written or oral. No additional terms, conditions, or representations shall be effective unless expressly agreed in writing and signed by both parties.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>16. Assignment & Transfer</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You may not assign, transfer, sublicense, or delegate any rights or obligations under this Agreement without the Company's prior written consent. Any attempted assignment without consent is void. The Company may assign this Agreement to any successor, affiliate, or third party in connection with a merger, acquisition, or sale of assets, with written notice to you.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>17. Force Majeure</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Neither party shall be liable for failure to perform its obligations under this Agreement if such failure results from circumstances beyond its reasonable control, including natural disasters, war, terrorism, pandemics, government actions, or infrastructure failures of third-party providers (Google, Twilio, Anthropic, ElevenLabs). The affected party shall notify the other party of the force majeure event and use reasonable efforts to resume performance.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>18. No Third-Party Beneficiaries</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This Agreement is for the sole benefit of you and the Company. No third party, including your customers, employees, or partners, has any rights or claims under this Agreement, except as expressly stated herein.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>19. Notice & Communication</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Any legal notice, demand, or communication required under this Agreement must be sent in writing to the other party. For you to contact the Company, send written notice to: legal@tradesaioperator.uk. For the Company to contact you, we will use your registered email address or phone number on file. Notices are deemed received: (a) upon personal delivery, (b) 3 business days after email transmission if no bounce-back occurs, or (c) 5 business days after postal mail delivery.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>20. Waiver</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The failure of either party to enforce any provision of this Agreement does not constitute a waiver of that provision or any other provision. A waiver must be in writing and signed by the party granting the waiver. No single or partial exercise of a right shall preclude any further exercise of that right or the exercise of any other right under this Agreement.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>21. Survival</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The following provisions survive termination or expiration of this Agreement: Subscription Fees (unpaid fees remain due), Limitation of Liability, Indemnification, Intellectual Property, Governing Law, Dispute Resolution, and any provision that by its nature is intended to survive termination. All other provisions terminate upon the end of your subscription, except as required by law.
          </p>
        </section>

        <div style={{ borderTop: '1px solid rgba(100,180,220,0.2)', paddingTop: '2rem', marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
          <p><strong>NOTICE:</strong> By signing up for TradesAI Operator, you acknowledge that you have read and agree to be bound by all terms contained herein. These are binding legal terms. Preliminary version effective April 11, 2026.</p>
        </div>
      </div>
    </div>
  );
}
