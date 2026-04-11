'use client';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1540 100%)', color: '#e0e0e0', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: '#fff' }}>Terms & Conditions</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>Last updated: April 11, 2026</p>

        {/* CRITICAL: Acceptance Banner */}
        <div style={{ background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.4)', borderRadius: '10px', padding: '1.5rem', marginBottom: '2.5rem' }}>
          <p style={{ lineHeight: '1.8', margin: '0', fontWeight: '600' }}>
            <strong>IMPORTANT:</strong> By submitting the signup form, creating an account, or using TradesAI Operator services, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set out below. Your continued use of the Service constitutes acceptance of these Terms. If you do not accept these Terms in their entirety, you must not proceed with signup or use the Service.
          </p>
        </div>

        {/* 1. Agreement to Terms */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>1. Agreement to Terms & Service Acceptance</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This Terms & Conditions Agreement ("Agreement") constitutes a legal and binding contract between you (the "Client" or "Customer") and TradesAI Operator, operated by Raymond Sovereign Ltd ("Company", "we", "us", "our", "Provider"). By completing the signup process, submitting payment information, or accessing the Service in any manner, you represent that you are authorised to enter into this binding contract on behalf of your business and that you accept all terms contained herein without reservation or modification.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            If you do not agree to any provision of this Agreement, you must decline the Service and refrain from using it. Any unauthorised use of the Service constitutes a material breach of this Agreement and will result in immediate termination of your account without refund of the setup fee.
          </p>
        </section>

        {/* 2. Service Description */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>2. Service Description & Scope</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            TradesAI Operator provides an artificial intelligence-powered virtual receptionist service designed specifically for small to medium-sized UK trade businesses, including but not limited to plumbers, electricians, HVAC engineers, roofers, builders, and 40+ additional trades. The Service operates on a Software-as-a-Service (SaaS) model delivered via cloud-based infrastructure.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Service includes the following core functionality:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>24-hour, 7-day-per-week artificial intelligence-driven call reception and customer interaction</li>
            <li>Natural language voice processing via Claude Haiku AI model (Anthropic)</li>
            <li>Custom voice configuration via ElevenLabs voice synthesis technology</li>
            <li>Seamless integration with Google Calendar for appointment scheduling and availability management</li>
            <li>Automated data logging to Google Sheets for customer interaction records and audit trails</li>
            <li>SMS notification and confirmation messaging via Twilio infrastructure</li>
            <li>Automated emergency detection and alert protocols with immediate notification to business owner</li>
            <li>Customer compliance certificate management and storage per service delivered</li>
            <li>Intelligent lead scoring and prioritisation algorithms</li>
            <li>Real-time analytics dashboard accessible via Google Sheets</li>
          </ul>
        </section>

        {/* 3. Subscription & Billing - EXPANDED */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>3. Subscription Terms, Fees & Billing</h2>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.1 Setup Fee</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            A one-time, non-refundable setup fee of £1,197.00 GBP is required upon subscription. This fee is payable immediately upon signup and covers: initial system configuration, voice model training and customisation, Google Calendar and Google Sheets integration, Twilio phone number provisioning, API credential setup and security configuration, initial onboarding consultation, and system testing prior to go-live.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1.5rem' }}>
            <strong>The setup fee is non-refundable under any circumstances, including early cancellation, service dissatisfaction, or technical issues.</strong> This fee represents the Company's direct costs and labour in configuring your bespoke system.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.2 Monthly Subscription Fee</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Service is provided on a subscription basis at £447.00 GBP per calendar month, payable in advance on the same day each month (the "Billing Anniversary"). This recurring fee grants you unlimited access to all Service features during the subscription period.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.3 Contract Term</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Your subscription is for an initial term of 12 months from the date of first payment ("Initial Term"). Following expiry of the Initial Term, the subscription will automatically renew for successive 12-month periods unless either party provides written notice of non-renewal at least 30 days prior to the expiry date.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.4 Taxes & Additional Charges</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            All fees stated are exclusive of Value Added Tax (VAT) and all other applicable taxes, duties, levies, and governmental charges. You are solely responsible for paying all such taxes. The Company reserves the right to charge additional fees for any third-party services required to deliver the Service, including but not limited to charges from Google, Anthropic, ElevenLabs, or Twilio if such providers increase their rates.
          </p>
        </section>

        {/* 4. CANCELLATION POLICY - NEW SECTION */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#ff4444' }}>4. Cancellation Policy & Termination Rights</h2>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>4.1 Cancellation Window</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Clients may request cancellation of their subscription within seven (7) calendar days of the date of initial payment ("Cancellation Window"). Cancellation requests must be submitted in writing via email to legal@tradesaioperator.uk with the subject line "Cancellation Request" and must include your registered business name and account email address.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>4.2 Non-Refundable Cancellation Fee</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>If you exercise your right to cancel within the 7-day Cancellation Window, a non-refundable cancellation fee of £500.00 GBP is payable.</strong> This fee covers the Company's costs associated with: bespoke system configuration and customisation; Twilio phone number provisioning and activation; Google Workspace integration setup; API credential generation and security hardening; team time dedicated to your onboarding; and administrative processing of your account setup.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>In the event of cancellation, the following funds will be applied:</strong> Your setup fee of £1,197.00 is non-refundable in all circumstances. Any monthly fees paid in advance are non-refundable. The £500.00 cancellation fee is deducted from any remaining balance owed. You will receive an itemised statement detailing the application of all fees within 5 business days of your cancellation request.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>4.3 No Cancellation After Cancellation Window</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            After the expiry of the 7-day Cancellation Window, you are locked into the full 12-month Initial Term. No refunds, credits, or cancellation fees apply to cancellations requested after this window. Early termination of the subscription after day 7 is not permitted, and all outstanding monthly fees for the remainder of the Initial Term become immediately due and payable.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>4.4 Termination for Cause</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Company reserves the right to terminate your access to the Service immediately and without notice if you: violate these Terms; use the Service for unlawful or fraudulent purposes; fail to pay any fees within 30 days of invoice; breach confidentiality or security obligations; engage in harassment or abusive conduct toward Company staff; reverse-engineer or attempt to copy the Service; or use the Service in any manner that damages the Company's reputation or infrastructure.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Upon termination for cause, no refunds are issued regardless of remaining subscription period. All outstanding fees become immediately due and payable.
          </p>
        </section>

        {/* 5. User Responsibilities */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>5. Your Obligations & Permitted Use</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You agree to use the Service solely for your legitimate trade business operations and in compliance with all applicable UK laws. You specifically agree to:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Provide accurate, complete, and current business information during signup and maintain accuracy throughout the subscription period</li>
            <li>Obtain explicit consent from all customers before their personal information is logged, stored, or processed by the Service</li>
            <li>Comply with all applicable UK trade regulations, including Gas Safe Register, NICEIC, NAPIT, TrustMark, and other industry-specific certifications relevant to your trade</li>
            <li>Maintain strict confidentiality of your Twilio API credentials, Google account access tokens, and all authentication information</li>
            <li>Not permit third parties to access or use your credentials without explicit written authorisation from the Company</li>
            <li>Not attempt to reverse-engineer, decompile, disassemble, or otherwise extract source code from the Service</li>
            <li>Not copy, reproduce, distribute, republish, or resell the Service or any portion thereof</li>
            <li>Not use the Service to send unsolicited communications, spam, or harassing messages to customers</li>
            <li>Not use the Service for unlawful, defamatory, obscene, threatening, or abusive purposes</li>
            <li>Not attempt to access the Service by unauthorised means or bypass security controls</li>
            <li>Not deliberately overload or damage the infrastructure supporting the Service</li>
            <li>Monitor your account regularly and report any unauthorised access or suspicious activity immediately to support@tradesaioperator.uk</li>
          </ul>
        </section>

        {/* 6. Data & Privacy */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>6. Data Ownership, Processing & Privacy</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Ownership:</strong> You retain full ownership of all customer data, including call logs, customer contact information, appointment schedules, and communications. The Company acts as a data processor on your behalf and has no ownership rights to your data.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Location & Security:</strong> All customer data is stored securely in cloud infrastructure controlled by you: Google Sheets and Google Calendar (accessed via your own Google Workspace accounts). Data is encrypted in transit via TLS 1.2 or higher. The Company does not store copies of your data on its own servers except for transient processing logs required to operate the Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Processing Agreement:</strong> The Company complies with UK GDPR regulations and acts as a Data Processor under Article 28 of GDPR. A formal Data Processing Agreement is available upon request and will be executed prior to processing of any personal data.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Customer Consent:</strong> You are solely responsible for obtaining valid, informed consent from all customers before their personal data is processed by the Service. The Company will not process any personal data without your explicit instruction and the customer's documented consent.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Retention & Deletion:</strong> Data is retained for the duration of your active subscription. Upon cancellation or termination, you will be provided 30 days to export and download all your data from Google Sheets and Google Calendar. After 30 days, the Company will not maintain any copies of your data. Please note that Google retains deleted data according to its own retention policies, which are beyond the Company's control.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Data Breach Notification:</strong> In the event of a confirmed data breach affecting your data, the Company will notify you by email within 72 hours and provide details of the affected data, the nature of the breach, and remedial actions taken.
          </p>
        </section>

        {/* 7. AI & Voice Technology */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>7. Artificial Intelligence & Voice Technology</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>AI Model & Limitations:</strong> The Service uses Claude Haiku, an artificial intelligence language model developed by Anthropic. While the model is highly capable, it is not infallible and may occasionally misunderstand accents, unfamiliar terminology, or complex technical requests. The Company does not guarantee error-free performance.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Voice Technology:</strong> Voice output is provided by ElevenLabs custom voice synthesis. Voice quality depends on your internet connection speed, phone network quality, and the caller's audio equipment. The Company does not guarantee perfect audio clarity in all network conditions.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Emergency Detection Limitations:</strong> The AI is programmed to detect common emergency keywords (gas leak, flooding, electrical fire, etc.) and will alert you immediately via SMS. However, the AI may fail to detect some emergencies or may generate false alarms. You must maintain independent, manual call handling procedures as backup. The Company is not liable for any failure to detect or respond to genuine emergencies.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Responsibility for Emergency Response:</strong> You are solely responsible for ensuring that a real person receives emergency alerts and can respond appropriately. Do not rely solely on the Service for emergency response. Train your team on emergency protocols and maintain alternative means of emergency contact.
          </p>
        </section>

        {/* 8. Service Availability & Uptime */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>8. Service Availability, Uptime & Maintenance</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Company aims to maintain 99.5% uptime for the Service, but does not guarantee continuous, uninterrupted service. Downtime may occur due to: scheduled maintenance (notice provided when possible); third-party service failures from Google, Twilio, Anthropic, or ElevenLabs; network or internet outages; security incidents or emergency patches; or factors beyond the Company's reasonable control.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            During service outages, incoming calls may not be answered by the AI receptionist. You are responsible for maintaining backup call handling procedures to ensure customers can reach you during outages. The Company will not issue refunds or credits for downtime.
          </p>
        </section>

        {/* 9. Warranties & Disclaimers */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>9. Warranties & Disclaimers</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Limited Warranty:</strong> The Company warrants that the Service will perform substantially in accordance with its published documentation and feature descriptions. If the Service materially fails to conform to the Documentation, the Company will, at its sole discretion, either remediate the issue or refund your monthly fees for the month in which the issue occurred (not including setup fees).
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Disclaimer of Other Warranties:</strong> EXCEPT AS EXPRESSLY STATED ABOVE, THE SERVICE IS PROVIDED "AS IS" WITHOUT ANY OTHER WARRANTIES, CONDITIONS, OR REPRESENTATIONS, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, TITLE, ACCURACY, COMPLETENESS, OR PERFORMANCE.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Company does not warrant that the Service will be error-free, virus-free, uninterrupted, or perfectly suited to your specific business needs. You use the Service at your own risk and assume all responsibility for ensuring it meets your requirements before committing to a 12-month contract.
          </p>
        </section>

        {/* 10. Limitation of Liability */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>10. Limitation of Liability & Damages</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Cap on Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY ENGLISH LAW, THE COMPANY'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THIS AGREEMENT OR THE SERVICE SHALL NOT EXCEED THE TOTAL FEES YOU PAID TO THE COMPANY IN THE 12 MONTHS PRECEDING THE CLAIM. If you paid no fees, liability is capped at £0.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Exclusion of Consequential Damages:</strong> IN NO EVENT SHALL THE COMPANY BE LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO: LOST REVENUE, LOST PROFITS, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF CUSTOMERS, LOSS OF DATA, REPUTATIONAL HARM, OR BUSINESS INTERRUPTION, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This limitation applies to all claims arising under this Agreement, including breach of warranty, breach of contract, tort, negligence, strict liability, or any other cause of action, and applies even if any remedy fails in its essential purpose.
          </p>
        </section>

        {/* 11. Indemnification */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>11. Indemnification</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            You agree to indemnify, defend, and hold harmless the Company, its owners, directors, employees, agents, and representatives from and against all claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising from or related to: your use of the Service in violation of this Agreement; your violation of any applicable laws or regulations; claims arising from your customers or third parties regarding your business operations; data breaches resulting from your failure to secure credentials or maintain confidentiality; your alleged infringement of third-party intellectual property rights; or any unlawful or fraudulent use of the Service by you or persons authorised by you.
          </p>
        </section>

        {/* 12. Intellectual Property Rights */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>12. Intellectual Property Rights</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Company IP:</strong> All software, code, algorithms, voice models, AI systems, documentation, trademarks, logos, and intellectual property relating to TradesAI Operator are the exclusive property of the Company. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Service solely for your internal business purposes during your subscription term.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Your Data & IP:</strong> You retain all ownership rights to your customer data, business information, and any content you provide to the Service. You grant the Company a non-exclusive, royalty-free license to process, store, and transmit your data as necessary to provide the Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Feedback:</strong> Any feedback, suggestions, ideas, or improvement recommendations you provide to the Company may be used by the Company without restriction, compensation, or attribution.
          </p>
        </section>

        {/* 13. Compliance & Legal Obligations */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>13. Industry Compliance & Legal Obligations</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Trade-Specific Compliance Your Responsibility:</strong> You are solely responsible for ensuring your use of the Service complies with all relevant UK trade regulations, industry certifications, and professional standards specific to your trade. This includes, without limitation: Gas Safe Register (for gas engineers), NICEIC registration (for electricians), NAPIT membership (for plumbing), TrustMark accreditation, and any other certifications required by law or industry practice.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Customer Data Compliance Your Responsibility:</strong> You are solely responsible for obtaining documented consent from all customers before their personal data is stored or processed by the Service. You must maintain records of such consent and ensure your processing complies with UK GDPR, Data Protection Act 2018, and all applicable privacy laws.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Emergency Response Your Responsibility:</strong> While the Service includes emergency detection, you must maintain independent, manual emergency response procedures and train your team accordingly. Do not rely solely on automated systems for emergency handling.
          </p>
        </section>

        {/* 14. Term & Termination */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>14. Termination & Effect of Termination</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Subscription Term:</strong> Your subscription is for an initial 12-month term. Automatic renewal applies unless either party provides written notice of non-renewal 30 days prior to the renewal date. Cancellation within the 7-day window incurs a £500 non-refundable fee. Cancellation after day 7 is not permitted; early termination is considered a material breach.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Effect of Termination:</strong> Upon termination for any reason, your access to the Service ceases immediately. You will have 30 days to export and download your data from Google Sheets and Google Calendar. After 30 days, the Company will not maintain any copies of your data. All fees owed become immediately due and payable.
          </p>
        </section>

        {/* 15. Modifications & Updates */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>15. Modifications to Terms & Service Updates</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Company may update these Terms from time to time. Material changes will be communicated via email at least 30 days in advance. Your continued use of the Service following the effective date of changes constitutes acceptance of the updated Terms. If you do not accept changes, you may request cancellation within the provided notice period (subject to the 7-day cancellation window rules if applicable).
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Company may also update, modify, add, or remove Service features at any time without notice. No refunds or credits are issued for feature changes.
          </p>
        </section>

        {/* 16. Dispute Resolution */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>16. Dispute Resolution & Governing Law</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Governing Law:</strong> This Agreement is governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law principles. All legal proceedings must be conducted in English.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Jurisdiction:</strong> Both parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales for resolution of any disputes arising from this Agreement or the Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Good Faith Resolution:</strong> Before initiating formal legal proceedings, both parties agree to attempt to resolve disputes in good faith through direct written communication. Disputes should be escalated to legal@tradesaioperator.uk with detailed explanation of the issue and requested remedy.
          </p>
        </section>

        {/* 17. Contact & Legal Information */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>17. Contact Information & Company Details</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            For all inquiries regarding these Terms, billing, or account matters, contact:
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>TradesAI Operator Ltd</strong><br />
            (Operating under Raymond Sovereign Ltd)<br />
            Email: legal@tradesaioperator.uk<br />
            Web: https://tradesaioperator.com<br />
            Registered Office: Virtual UK Office, London<br />
            Company Registration: [To be completed]<br />
            VAT Registration: [To be completed]
          </p>
        </section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(100,180,220,0.2)', paddingTop: '2rem', marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
          <p><strong>NOTICE:</strong> These Terms & Conditions constitute a binding legal agreement. By signing up for TradesAI Operator, you acknowledge that you have read, understood, and agree to be bound by all terms contained herein. This is a preliminary version effective April 11, 2026. A formal legal review will be conducted prior to onboarding of the first paying customer. Any updates will be communicated in accordance with Section 15.</p>
        </div>
      </div>
    </div>
  );
}


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
