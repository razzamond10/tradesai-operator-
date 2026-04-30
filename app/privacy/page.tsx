import Link from 'next/link';
import Footer from '@/components/Footer';

const BG   = 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)';
const CYAN = '#00d4ff';

const sections = [
  { id: 'who-we-are',       title: '1. Who We Are' },
  { id: 'data-collected',   title: '2. What Data We Process' },
  { id: 'lawful-basis',     title: '3. Lawful Basis' },
  { id: 'retention',        title: '4. Retention Periods' },
  { id: 'your-rights',      title: '5. Your Rights' },
  { id: 'sub-processors',   title: '6. Sub-Processors' },
  { id: 'international',    title: '7. International Transfers' },
  { id: 'exercise-rights',  title: '8. Exercising Your Rights' },
  { id: 'complaints',       title: '9. Complaints' },
  { id: 'contact',          title: '10. Contact' },
];

const H2  = { fontSize: '1.35rem', fontWeight: '700', color: CYAN, margin: '2.5rem 0 1rem', scrollMarginTop: '5rem' } as const;
const P   = { color: '#ccc', lineHeight: '1.8', marginBottom: '1rem' } as const;
const LI  = { color: '#ccc', lineHeight: '1.8', marginBottom: '0.4rem' } as const;
const TH  = { textAlign: 'left' as const, padding: '0.55rem 0.75rem', color: CYAN, fontWeight: '600', whiteSpace: 'nowrap' as const };
const TD  = { padding: '0.6rem 0.75rem', color: '#bbb', verticalAlign: 'top' as const, borderBottom: '1px solid rgba(255,255,255,0.05)' } as const;

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <img src="/logo.jpg" alt="TradesAI Operator" style={{ height: '36px', borderRadius: '6px' }} />
          <span style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>Trades <span style={{ color: '#d4af37' }}>Ai</span> Operator</span>
        </Link>
        <Link href="/" style={{ color: CYAN, fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </header>

      {/* TOC + Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>

        {/* Sticky TOC — shown only on wide screens via CSS class */}
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
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Privacy Policy</h1>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Last updated: {updated} · TradesAI Operator Ltd (Companies House 17114582)</p>

          <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
            <p style={{ ...P, marginBottom: 0, fontSize: '0.88rem' }}>
              This policy explains how TradesAI Operator Ltd collects, uses, and protects personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </div>

          {/* 1. Who We Are */}
          <h2 id="who-we-are" style={H2}>1. Who We Are</h2>
          <p style={P}>
            <strong style={{ color: '#fff' }}>TradesAI Operator Ltd</strong> is the data controller for personal data processed through our platform. We are registered in England and Wales under Companies House number <strong style={{ color: '#fff' }}>17114582</strong>, registered office at <strong style={{ color: '#fff' }}>5 Brayford Square, London, E1 0SG</strong>.
          </p>
          <p style={P}>
            ICO registration number: registration pending — to be updated on receipt.
          </p>
          <p style={P}>Data protection contact: <a href="mailto:admin@tradesaioperator.uk" style={{ color: CYAN }}>admin@tradesaioperator.uk</a></p>

          {/* 2. What Data We Process */}
          <h2 id="data-collected" style={H2}>2. What Data We Process</h2>
          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Data about your customers (End Users — callers to your business):</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            {['Full name and phone number', 'Postcode and job type', 'Call recordings processed via Retell AI', 'Call transcripts and intent classification', 'SMS message content (via Twilio)', 'Booking details, scheduled dates, and job status', 'Emergency severity flags'].map(i => <li key={i} style={LI}>{i}</li>)}
          </ul>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' }}>Data about you (the trade business operator / Customer):</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            {['Name, email address, and phone number', 'Business name, trade type, and address', 'Google Calendar ID and Google Sheets ID', 'Twilio number allocated to your account', 'Booking and revenue records', 'Payment data via Stripe (when payment functionality is live)'].map(i => <li key={i} style={LI}>{i}</li>)}
          </ul>

          {/* 3. Lawful Basis */}
          <h2 id="lawful-basis" style={H2}>3. Lawful Basis for Processing</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}><strong style={{ color: '#fff' }}>Art. 6(1)(b) — Contract performance:</strong> Processing necessary to deliver the AI receptionist service you have subscribed to.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Art. 6(1)(f) — Legitimate interests:</strong> Processing call recordings and transcripts to detect emergencies, improve service quality, and ensure platform security, balanced against data subject rights.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Art. 6(1)(c) — Legal obligation:</strong> Retaining financial records for 6 years as required by HMRC.</li>
          </ul>

          {/* 4. Retention */}
          <h2 id="retention" style={H2}>4. Retention Periods</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}><strong style={{ color: '#fff' }}>Active service data</strong> (call logs, bookings, transcripts): 12 months from creation, then purged.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Account and billing records:</strong> 6 years from the end of the relevant tax year (HMRC requirement).</li>
            <li style={LI}><strong style={{ color: '#fff' }}>Call recordings:</strong> Subject to Retell AI's own retention policy — see <a href="https://www.retellai.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>retellai.com/legal/privacy-policy</a>.</li>
            <li style={LI}><strong style={{ color: '#fff' }}>GDPR request logs:</strong> 3 years to demonstrate compliance.</li>
          </ul>

          {/* 5. Your Rights */}
          <h2 id="your-rights" style={H2}>5. Your Rights Under UK GDPR</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              ['Right of access (Art. 15)', 'Request a copy of all personal data we hold about you.'],
              ['Right to rectification (Art. 16)', 'Ask us to correct inaccurate or incomplete data.'],
              ['Right to erasure (Art. 17)', 'Request deletion where there is no overriding legal basis for retention.'],
              ['Right to data portability (Art. 20)', 'Receive your data in a structured, machine-readable format.'],
              ['Right to object (Art. 21)', 'Object to processing based on legitimate interests.'],
              ['Right to restrict processing (Art. 18)', 'Ask us to limit how we use your data while a dispute is resolved.'],
              ['Right to withdraw consent', 'Where processing is consent-based, withdraw at any time without affecting prior processing.'],
            ].map(([r, d]) => <li key={r} style={LI}><strong style={{ color: '#fff' }}>{r}:</strong> {d}</li>)}
          </ul>
          <p style={P}>We will respond to all requests within one calendar month. See Section 8 for how to submit a request.</p>

          {/* 6. Sub-Processors */}
          <h2 id="sub-processors" style={H2}>6. Sub-Processors</h2>
          <p style={P}>We share data with the following sub-processors only as necessary to provide the service:</p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.2)' }}>
                  <th style={TH}>Sub-processor</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Location</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Retell AI', 'Voice agent — call routing and transcription', 'USA'],
                  ['Twilio Inc.', 'Telephony (calls + SMS delivery)', 'USA'],
                  ['Make.com (Celonis SE)', 'Workflow automation — booking triggers and notifications', 'Germany / USA'],
                  ['Google Workspace', 'Calendar (booking), Sheets (data store), Drive', 'USA (SCCs)'],
                  ['Vercel Inc.', 'Platform hosting and edge delivery', 'USA'],
                  ['Stripe Inc.', 'Payment processing (not yet live)', 'USA'],
                  ['ElevenLabs', 'Voice synthesis (via Retell AI)', 'USA'],
                ].map(([name, purpose, loc]) => (
                  <tr key={name}>
                    <td style={{ ...TD, color: '#fff', fontWeight: '500', whiteSpace: 'nowrap' }}>{name}</td>
                    <td style={TD}>{purpose}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap', color: '#777' }}>{loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 7. International Transfers */}
          <h2 id="international" style={H2}>7. International Transfers</h2>
          <p style={P}>
            Several sub-processors are based in the United States. Transfers are protected by Standard Contractual Clauses (SCCs) adopted under the UK International Data Transfer Agreement (IDTA) framework. You may request a copy of applicable transfer safeguards by emailing <a href="mailto:admin@tradesaioperator.uk" style={{ color: CYAN }}>admin@tradesaioperator.uk</a>.
          </p>

          {/* 8. Exercising Rights */}
          <h2 id="exercise-rights" style={H2}>8. Exercising Your Rights</h2>
          <p style={P}>Portal account holders can exercise rights directly:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}>
              <strong style={{ color: '#fff' }}>Data export (Art. 15 / Art. 20):</strong> Call{' '}
              <code style={{ background: 'rgba(0,212,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.82rem' }}>GET /api/account/export</code>{' '}
              while authenticated to download all your data as JSON.
            </li>
            <li style={LI}>
              <strong style={{ color: '#fff' }}>Account deletion (Art. 17):</strong> Call{' '}
              <code style={{ background: 'rgba(0,212,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.82rem' }}>DELETE /api/account</code>{' '}
              while authenticated. Your account is soft-deleted and permanently purged after a 30-day grace period, subject to HMRC retention obligations.
            </li>
          </ul>
          <p style={P}>
            For other requests or if you are an End User (caller) whose data was processed, email <a href="mailto:admin@tradesaioperator.uk" style={{ color: CYAN }}>admin@tradesaioperator.uk</a>. We will respond within one calendar month.
          </p>

          {/* 9. Complaints */}
          <h2 id="complaints" style={H2}>9. Complaints</h2>
          <p style={P}>
            If you believe your data has been mishandled you may lodge a complaint with the UK supervisory authority:
          </p>
          <div style={{ paddingLeft: '1rem', borderLeft: `2px solid rgba(0,212,255,0.3)`, marginBottom: '1.5rem' }}>
            <p style={{ ...P, marginBottom: '0.25rem' }}><strong style={{ color: '#fff' }}>Information Commissioner's Office (ICO)</strong></p>
            <p style={{ ...P, marginBottom: '0.25rem' }}><a href="https://ico.org.uk/concerns/" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>ico.org.uk/concerns</a></p>
            <p style={{ ...P, marginBottom: 0 }}>0303 123 1113</p>
          </div>
          <p style={P}>We would appreciate the opportunity to address concerns directly before an ICO referral.</p>

          {/* 10. Contact */}
          <h2 id="contact" style={H2}>10. Contact Us</h2>
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
