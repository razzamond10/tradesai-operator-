'use client';
import React, { useState } from 'react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [clientEmail, setClientEmail] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    tradeType: 'Plumbing',
    password: ''
  });

  const handleSignup = (e) => {
    e.preventDefault();
    localStorage.setItem('clientEmail', formData.email);
    localStorage.setItem('clientData', JSON.stringify(formData));
    setClientEmail(formData.email);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientData');
    setClientEmail('');
    setPage('landing');
  };

  if (page === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Trades AI Operator</h1>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
        </header>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>Welcome, <strong>{clientEmail}</strong></p>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your 24/7 AI receptionist is live.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[{ icon: '📊', label: 'Interactions', value: '0' }, { icon: '💰', label: 'Revenue', value: '£0' }, { icon: '📅', label: 'Bookings', value: '0' }, { icon: '📸', label: 'Quotes', value: '0' }].map((stat) => (
              <div key={stat.label} style={{ padding: '1.5rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <p style={{ fontSize: '0.9rem', color: '#888', margin: '0 0 0.5rem 0' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (page === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: '700', color: '#fff', marginBottom: '2rem' }}>Get Started</h2>
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="Business Name" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            <select value={formData.tradeType} onChange={(e) => setFormData({...formData, tradeType: e.target.value})} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}>
              {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem' }}>Create Account</button>
            <button type="button" onClick={() => setPage('landing')} style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.5)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Back</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      {/* Hero Section 1 */}
      <section style={{ padding: '5rem 2rem 4rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <img src="/logo.jpg" alt="Trades AI Operator" style={{ width: '140px', height: 'auto', margin: '0 auto', borderRadius: '12px' }} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-1px' }}>Trades AI Operator</h1>
        <p style={{ fontSize: '1rem', color: '#aaa', marginBottom: '1.5rem' }}>24/7 AI receptionist built for every UK trade business.</p>
        <p style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '650px', margin: '0 auto 2rem' }}>Answers every call. Delivers instant quotes from photos. Books jobs straight into your diary, and takes deposits.</p>
        <button onClick={() => setPage('signup')} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }}>Get Started Free</button>
      </section>

      {/* Feature 1 */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,100,200,0.05) 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ fontSize: '4rem', textAlign: 'center' }}>☎️</div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Never Miss Another Job Again</h2>
            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>Trades Ai Operator answers every enquiry 24/7 in clear, natural British English – always using your exact business name and tone. Calm, professional and friendly, so no customer ever reaches voicemail again.</p>
            <button onClick={() => setPage('signup')} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Hear it live in 30 seconds →</button>
          </div>
        </div>
      </section>

      {/* Feature 2 */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,100,200,0.05) 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Instant Job Booking</h2>
            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>We check your real-time diary automatically and book jobs straight away, suggesting practical slots that actually work for you. Automatic SMS and WhatsApp confirmations go to the customer – all sorted with zero effort.</p>
            <button onClick={() => setPage('signup')} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>See real-time booking in action →</button>
          </div>
          <div style={{ fontSize: '4rem', textAlign: 'center' }}>💷</div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          {[
            { icon: '📊', title: 'AUTO CRM', desc: 'Every interaction logged to Google Sheets automatically. Full audit trail. Zero manual data entry. Ever.' },
            { icon: '📅', title: 'REAL DIARY BOOKING', desc: 'Checks your actual Google Calendar. Confirms slots. Sends SMS. Zero double-bookings, zero chaos.' },
            { icon: '📸', title: 'AI PHOTO QUOTES', desc: 'Customer sends a photo. Trade Operator AI returns a realistic UK price range instantly.' },
            { icon: '🚨', title: 'EMERGENCY PROTOCOL', desc: 'Gas, flooding, carbon monoxide. Safety first. Team alerted immediately. Handled properly every time.' }
          ].map((feature, idx) => (
            <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem', color: '#00d4ff' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#999', lineHeight: '1.5' }}>{feature.desc}</p>
              <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', color: '#00d4ff', border: 'none', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>Button →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,100,200,0.05) 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ fontSize: '4rem', textAlign: 'center' }}>📈</div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Maximise Your Revenue</h2>
            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>Take deposits during the call, offer sensible upsells when it makes sense, and enjoy complete automatic logging of every lead, quote and booking. More money coming in with zero extra admin for you or your team.</p>
            <button onClick={() => setPage('signup')} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Get your free test call & pricing →</button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>Be First to Unlock Trades Ai Operator</h2>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.6' }}>Join the small group of UK trade businesses already securing their dedicated 24/7 AI receptionist.</p>
        <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '2rem' }}>Trades Ai Operator – The professional operator every small trade business needs and can rely on.</p>
        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '2rem' }}>UK-based • Secure • GDPR protected • © 2026 Trades Ai Operator</p>
        <button onClick={() => setPage('signup')} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,212,255,0.2)', marginBottom: '2rem' }}>Get Started</button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: '0.4', fontSize: '1.2rem' }}>
          <a href="#" style={{ color: '#00d4ff', textDecoration: 'none' }}>𝕏</a>
          <a href="#" style={{ color: '#00d4ff', textDecoration: 'none' }}>P</a>
          <a href="#" style={{ color: '#00d4ff', textDecoration: 'none' }}>◯</a>
          <a href="#" style={{ color: '#00d4ff', textDecoration: 'none' }}>✉</a>
        </div>
      </section>
    </div>
  );
};

export default App;
