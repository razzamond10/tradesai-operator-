'use client';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1540 100%)', color: '#e0e0e0', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: '#fff' }}>Privacy Policy</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>Last updated: April 11, 2026</p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>1. Introduction & Scope</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            This Privacy Policy describes how TradesAI Operator Ltd ("Company", "we", "us", "our") collects, uses, processes, and protects personal information in connection with the TradesAI Operator service ("Service"). This Policy applies to all users of the Service, including business owners ("Customers") and their end-customers ("Customer End Users"). We are committed to protecting your privacy and complying with UK GDPR, UK Data Protection Act 2018, and all applicable UK and international privacy laws.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>2. Data Controller vs. Data Processor</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>For Business Customers:</strong> You (the Customer) are the "data controller" and TradesAI Operator is a "data processor". This means you determine how and why customer data is collected and processed. We process customer data only on your written instructions and in accordance with this Privacy Policy and your Data Processing Agreement (DPA).
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>For Customer End Users:</strong> If you are a customer of one of our Customers' businesses, please refer to that business's privacy policy for information about how they collect and use your personal data. If you have questions, contact the business directly.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>For Direct Service Users:</strong> When you interact directly with TradesAI Operator (e.g., during signup, support requests, or website visits), we are the data controller and are responsible for your personal data.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>3. Information We Collect</h2>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.1 Information You Provide Directly</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            When you sign up for the Service or interact with us, we may collect: business name, owner name, email address, phone number, business address, postcode, business type/trade, bank account information for billing, credit card or payment method details, company registration number, tax identification number, and any other information you voluntarily provide in communications with our support team.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.2 Customer End-User Data</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            When you use TradesAI Operator to receive calls and manage bookings, we automatically collect and log customer information on your behalf, including: caller name, phone number, email address, postcode, service type requested, appointment details, call duration and timing, voice call transcripts (via AI processing), customer quotes provided, compliance certifications uploaded, and any other information callers provide during interactions. This data is stored in your Google Calendar and Google Sheets accounts (which you own and control).
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.3 Automatically Collected Information</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            When you use the Service, we automatically collect: IP address, browser type and version, device type and identifiers, operating system, referring and exit pages, pages and features accessed, time spent on pages, clickstream data, error logs, geographic location (inferred from IP), call metadata (duration, timestamp, caller ID, callee ID), API usage patterns, and performance analytics. This information is collected via server logs, cookies, and similar technologies.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.8rem', color: '#d4af37' }}>3.4 Third-Party Data</h3>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We may receive personal data about you from third parties, including: payment processors (for billing verification), Twilio (telephony metadata), Google (calendar and sheet integration data), Anthropic (anonymised AI usage patterns), and ElevenLabs (voice synthesis logs). We use this information only in accordance with this Privacy Policy and applicable agreements.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>4. How We Use Your Information</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We use personal data for the following purposes:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Service Provision:</strong> To provide, maintain, and improve the TradesAI Operator Service, including AI call reception, scheduling, logging, and SMS notifications.</li>
            <li><strong>Billing & Payment:</strong> To process subscription fees, handle refunds, and manage your account billing.</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations, respond to law enforcement requests, and enforce our Terms & Conditions.</li>
            <li><strong>Customer Support:</strong> To respond to your support requests, troubleshoot issues, and provide technical assistance.</li>
            <li><strong>Analytics & Improvement:</strong> To analyse Service usage patterns, improve features, optimise performance, and develop new functionality.</li>
            <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, security incidents, and technical issues.</li>
            <li><strong>Marketing & Communications:</strong> To send you service updates, promotional emails, newsletters, and product announcements (with your consent).</li>
            <li><strong>Legitimate Business Interests:</strong> To conduct business analysis, improve our services, protect our rights, and manage our operations.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>5. Legal Basis for Processing (GDPR)</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Under UK GDPR, we process personal data based on the following legal grounds:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Contract:</strong> Processing is necessary to provide the Service and fulfil our contractual obligations to you.</li>
            <li><strong>Legal Obligation:</strong> Processing is necessary to comply with UK law, tax requirements, or regulatory obligations.</li>
            <li><strong>Legitimate Interests:</strong> We have a legitimate business interest in using your data to improve our Service, conduct analytics, and protect against fraud.</li>
            <li><strong>Consent:</strong> Where required by law, we rely on your explicit consent to send marketing communications or collect sensitive data.</li>
            <li><strong>Vital Interests:</strong> In emergency situations, we may process data to protect your health and safety or that of others.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>6. Data Sharing & Third Parties</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We share personal data with the following third parties only when necessary to provide the Service:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Google:</strong> Calendar and Sheets integration (your data is stored in your own Google accounts)</li>
            <li><strong>Twilio:</strong> Telephony and SMS delivery (call metadata and SMS logs)</li>
            <li><strong>Anthropic:</strong> AI processing via Claude Haiku (anonymised conversation logs for model improvement, with option to opt-out)</li>
            <li><strong>ElevenLabs:</strong> Voice synthesis technology (voice parameters and processing logs)</li>
            <li><strong>Payment Processors:</strong> Stripe, Wise, or other payment providers for billing</li>
            <li><strong>Law Enforcement:</strong> If legally required to comply with valid court orders or government requests</li>
            <li><strong>Business Partners:</strong> Service providers who assist us in operating the Service (under confidentiality agreements)</li>
          </ul>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We do NOT sell, rent, or trade your personal data to third parties for marketing purposes. We do NOT disclose your data to unrelated businesses without your explicit consent.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>7. Data Retention</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Active Subscription:</strong> We retain your data for the duration of your active subscription to provide the Service.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>After Cancellation:</strong> Upon subscription termination or cancellation, you have 30 days to export and download all your data from Google Sheets and Google Calendar. After 30 days, we do not maintain copies of your data. Please note that Google may retain deleted data according to its own retention policies.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Backup Data:</strong> We may retain anonymised or aggregated data for analytics, legal compliance, or fraud prevention purposes indefinitely.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Legal Holds:</strong> If required by law, court order, or government request, we may retain data longer than normal periods.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>8. Data Security</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We implement industry-standard security measures to protect your personal data from unauthorised access, disclosure, alteration, and destruction. These include: encryption in transit via TLS 1.2 or higher, secure API authentication, restricted access controls, regular security audits, and incident response procedures.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            However, no system is completely secure. While we take reasonable precautions, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your login credentials and notifying us immediately of any unauthorised access.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>9. Your Privacy Rights (GDPR & UK DPA)</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Under UK GDPR and the Data Protection Act 2018, you have the following rights regarding your personal data:
          </p>
          <ul style={{ lineHeight: '1.8', marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You can correct inaccurate or incomplete personal data.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request deletion of your personal data (subject to legal retention obligations).</li>
            <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data.</li>
            <li><strong>Right to Data Portability:</strong> You can request your data in a portable, machine-readable format.</li>
            <li><strong>Right to Object:</strong> You can object to marketing communications and certain forms of processing.</li>
            <li><strong>Right to Lodge a Complaint:</strong> You can file a complaint with the UK Information Commissioner's Office (ICO).</li>
          </ul>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            To exercise any of these rights, contact us at admin@tradesaioperator.uk with your request. We will respond within 30 days or as required by law.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>10. Cookies & Tracking Technologies</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We use cookies and similar technologies (beacons, pixels, scripts) to: authenticate users, remember preferences, analyse Service usage, prevent fraud, and improve performance. Cookies may be session-based (deleted when you close your browser) or persistent (stored on your device).
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            Most browsers allow you to control or delete cookies through your settings. However, disabling cookies may limit certain Service functionality. We do not use cookies for targeted advertising or cross-site tracking.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>11. Children's Privacy</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If we become aware that a minor has provided personal data, we will delete it immediately. Parents or guardians who believe a child has provided data to us should contact us at admin@tradesaioperator.uk.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>12. International Data Transfers</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The TradesAI Operator Service is provided from the United Kingdom and EU. If you access the Service from outside the UK or EU, your data may be transferred to and processed in the UK, which may have different data protection laws than your home jurisdiction. By using the Service, you consent to such transfers.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            For international transfers, we implement Standard Contractual Clauses (SCCs) and other safeguards as required by UK GDPR and applicable law.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>13. AI & Automated Decision-Making</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            The TradesAI Operator Service uses artificial intelligence (Claude Haiku by Anthropic) to process voice calls and customer interactions. The AI makes automated decisions about call handling, emergency detection, and lead scoring based on customer data and call patterns.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>Your Rights:</strong> Under UK GDPR Article 22, you have the right to request human review of automated decisions that produce legal or similarly significant effects. If you wish to opt-out of AI processing for non-essential features (e.g., lead scoring), contact admin@tradesaioperator.uk.
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>AI Data Usage:</strong> Anthropic may use anonymised, aggregated conversation logs to improve the Claude Haiku model. We do not allow Anthropic to use your personally identifiable customer data for model training without explicit opt-in consent.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>14. Data Breach Notification</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            In the event of a confirmed data breach affecting your personal data, we will notify you by email within 72 hours (as required by UK GDPR Article 34). The notification will include: the nature of the breach, the categories of data affected, the likely consequences, and the measures we are taking to address the breach and prevent recurrence.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>15. Data Processing Agreement (DPA)</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            For Customers who process personal data of EU residents or are subject to UK GDPR requirements, we provide a formal Data Processing Agreement (DPA) compliant with Article 28 of UK GDPR. The DPA is available upon request and must be executed before processing any customer data subject to GDPR.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>16. Changes to This Privacy Policy</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            We may update this Privacy Policy from time to time. Material changes will be communicated via email at least 30 days in advance. Your continued use of the Service following the effective date of changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#00d4ff' }}>17. Contact Information & ICO</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            For privacy questions, concerns, or to exercise your rights, contact:
          </p>
          <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
            <strong>TradesAI Operator Ltd</strong><br />
            Email: admin@tradesaioperator.uk<br />
            Web: https://tradesaioperator.com<br />
            <br />
            <strong>UK Information Commissioner's Office (ICO)</strong><br />
            If you are unsatisfied with our privacy practices, you can file a complaint with the ICO: https://www.ico.org.uk
          </p>
        </section>

        <div style={{ borderTop: '1px solid rgba(100,180,220,0.2)', paddingTop: '2rem', marginTop: '3rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
          <p><strong>NOTICE:</strong> This Privacy Policy is effective April 11, 2026. We are committed to transparency and compliance with UK GDPR and UK Data Protection laws. A formal Data Processing Agreement is available upon request.</p>
        </div>
      </div>
    </div>
  );
}
