import Link from 'next/link';
import Footer from '@/components/Footer';
import ManageCookiesButton from './ManageCookiesButton';

const BG   = 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)';
const CYAN = '#00d4ff';
const GOLD = '#d4af37';

const sections = [
  { id: 'what-are-cookies', title: '1. What Are Cookies' },
  { id: 'how-we-use',       title: '2. How We Use Cookies' },
  { id: 'types',            title: '3. Types of Cookies' },
  { id: 'your-choices',     title: '4. Your Choices' },
  { id: 'contact',          title: '5. Contact' },
];

const H2 = { fontSize: '1.35rem', fontWeight: '700', color: CYAN, margin: '2.5rem 0 1rem', scrollMarginTop: '5rem' } as const;
const P  = { color: '#ccc', lineHeight: '1.8', marginBottom: '1rem' } as const;
const LI = { color: '#ccc', lineHeight: '1.8', marginBottom: '0.4rem' } as const;
const TH = { textAlign: 'left' as const, padding: '0.55rem 0.75rem', color: CYAN, fontWeight: '600', whiteSpace: 'nowrap' as const };
const TD = { padding: '0.6rem 0.75rem', color: '#bbb', verticalAlign: 'top' as const, borderBottom: '1px solid rgba(255,255,255,0.05)' } as const;

export default function CookiesPage() {
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
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Cookie Policy</h1>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Last updated: {updated} · TradesAI Operator Ltd (Companies House 17114582)</p>

          <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
            <p style={{ ...P, marginBottom: 0, fontSize: '0.88rem' }}>
              This policy explains how TradesAI Operator uses cookies and similar technologies on our website and platform, and how you can control them.
            </p>
          </div>

          {/* 1. What Are Cookies */}
          <h2 id="what-are-cookies" style={H2}>1. What Are Cookies</h2>
          <p style={P}>
            Cookies are small text files stored on your device when you visit a website. They allow websites to recognise your device, remember preferences, and understand how you interact with pages. Some cookies are essential for the site to work; others are optional and used for functionality or analytics.
          </p>
          <p style={P}>
            We also use <strong style={{ color: '#fff' }}>localStorage</strong> — a browser storage mechanism similar to cookies — to store your cookie preferences on this site.
          </p>

          {/* 2. How We Use Cookies */}
          <h2 id="how-we-use" style={H2}>2. How We Use Cookies</h2>
          <p style={P}>
            TradesAI Operator uses a minimal set of cookies. We do not use advertising cookies, cross-site tracking, or any third-party analytics cookies at this time. Our use is limited to what is strictly necessary to run the platform securely.
          </p>

          {/* 3. Types of Cookies */}
          <h2 id="types" style={H2}>3. Types of Cookies We Use</h2>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.75rem' }}>Essential cookies (always active)</p>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.2)' }}>
                  <th style={TH}>Name</th>
                  <th style={TH}>Purpose</th>
                  <th style={TH}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['tradesai_token', 'Authentication — keeps you logged in to the portal', 'Session / 7 days'],
                  ['tao_cookie_consent', 'Stores your cookie preference (localStorage, not a cookie)', 'Until cleared'],
                ].map(([name, purpose, duration]) => (
                  <tr key={name}>
                    <td style={{ ...TD, color: '#fff', fontWeight: '500', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{name}</td>
                    <td style={TD}>{purpose}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap', color: '#777' }}>{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.75rem' }}>Functional cookies (optional)</p>
          <p style={P}>
            We may set functional cookies to remember your display preferences within the portal (e.g. selected date ranges, collapsed sidebar state). These do not track you across other sites and are not shared with third parties.
          </p>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.75rem' }}>Analytics cookies</p>
          <p style={P}>
            We do not currently use any analytics cookies or third-party tracking scripts (e.g. Google Analytics, Meta Pixel). If we introduce analytics in the future, this policy will be updated and you will be asked for consent before any such cookies are set.
          </p>

          <p style={{ ...P, fontWeight: '600', color: '#e0e0e0', marginBottom: '0.75rem' }}>Third-party cookies</p>
          <p style={P}>
            Our platform integrates with third-party services (Vercel for hosting, Twilio for telephony). These providers may set their own cookies on sub-domains or APIs. We do not control third-party cookies and recommend reviewing their respective privacy and cookie policies:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={LI}><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>Vercel Privacy Policy</a></li>
            <li style={LI}><a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>Twilio Privacy Policy</a></li>
            <li style={LI}><a href="https://www.retellai.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>Retell AI Privacy Policy</a></li>
          </ul>

          {/* 4. Your Choices */}
          <h2 id="your-choices" style={H2}>4. Your Choices</h2>
          <p style={P}>
            You can manage your cookie preferences at any time using the button below. Withdrawing consent for non-essential cookies will not affect the core functionality of the portal — only essential cookies required for login and security will remain active.
          </p>

          <div style={{ margin: '1.5rem 0' }}>
            <ManageCookiesButton />
          </div>

          <p style={P}>
            You can also control cookies through your browser settings. Most browsers allow you to view, block, and delete cookies. Note that blocking essential cookies will prevent you from logging in to the portal. For guidance on managing cookies in your browser, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" style={{ color: CYAN }}>aboutcookies.org</a>.
          </p>
          <p style={P}>
            To clear your stored cookie preference on this site, simply clear your browser's localStorage for this domain, or use the &quot;Manage Cookies&quot; button above.
          </p>

          {/* 5. Contact */}
          <h2 id="contact" style={H2}>5. Contact</h2>
          <p style={P}>
            If you have questions about how we use cookies, contact us at:
          </p>
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
