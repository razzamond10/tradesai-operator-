'use client';
import React, { useState, useEffect } from 'react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [clientEmail, setClientEmail] = useState('');
  const [formData, setFormData] = useState({ businessName: '', email: '', phone: '', tradeType: 'Plumbing', password: '' });
  const [hoveredFeature, setHoveredFeature] = useState(null);

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0512 0%, #15082a 35%, #1f0f3a 65%, #0f0520 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(200,150,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(25,15,45,0.8) 0%, rgba(15,5,25,0.4) 100%)', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>Trades <span style={{ color: '#d4af37' }}>Ai</span> Operator</h1>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #ff5555 0%, #cc3333 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Logout</button>
        </header>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Welcome back, <strong>{clientEmail}</strong></p>
          <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Your 24/7 AI receptionist is live and answering calls.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[{ icon: '📊', label: 'Total Interactions', value: '0' }, { icon: '💰', label: 'Revenue Tracked', value: '£0' }, { icon: '📅', label: 'Jobs Booked', value: '0' }, { icon: '📸', label: 'Photo Quotes', value: '0' }].map((stat) => (
              <div key={stat.label} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(100,150,200,0.08) 0%, rgba(150,100,200,0.08) 100%)', border: '1px solid rgba(150,120,200,0.15)', borderRadius: '10px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>{stat.icon}</div>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 0.8rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: '#fff' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (page === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0512 0%, #15082a 35%, #1f0f3a 65%, #0f0520 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(50,25,80,0.35) 0%, rgba(30,15,60,0.35) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(150,120,200,0.2)', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Get Started Free</h2>
          <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginBottom: '2rem' }}>Join the fastest-growing trade businesses in the UK.</p>
          <form onSubmit={handleSignup}>
            {[{ key: 'businessName', placeholder: 'Business Name', type: 'text' }, { key: 'email', placeholder: 'Email Address', type: 'email' }, { key: 'phone', placeholder: 'Phone Number', type: 'tel' }].map(field => (
              <input key={field.key} type={field.type} placeholder={field.placeholder} value={formData[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} required style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.3s ease' }} onFocus={(e) => { e.target.style.borderColor = 'rgba(150,120,200,0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(150,120,200,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }} />
            ))}
            <select value={formData.tradeType} onChange={(e) => setFormData({...formData, tradeType: e.target.value})} style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}>
              {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman', 'Carpentry'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '0.9rem', marginBottom: '2rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.35)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>Create Account</button>
            <button type="button" onClick={() => setPage('landing')} style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.borderColor = 'rgba(0,212,255,0.7)'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(0,212,255,0.4)'; }}>Back to Home</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0512 0%, #15082a 35%, #1f0f3a 65%, #0f0520 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', borderRadius: '50%', top: '-150px', right: '-150px', pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(150,100,200,0.06) 0%, transparent 70%)', borderRadius: '50%', bottom: '-100px', left: '-100px', pointerEvents: 'none', filter: 'blur(40px)' }} />

      {/* Header/Nav */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Trades <span style={{ color: '#d4af37', fontWeight: '700' }}>Ai</span> Operator</div>
        <button onClick={() => setPage('signup')} style={{ padding: '0.6rem 1.4rem', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.2)'; e.target.style.borderColor = 'rgba(0,212,255,0.6)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.borderColor = 'rgba(0,212,255,0.3)'; }}>Sign In</button>
      </header>

      {/* Hero */}
      <section style={{ padding: '4rem 2rem 3.5rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', margin: '0 auto 1.5rem', background: 'linear-gradient(135deg, rgba(0,150,200,0.15) 0%, rgba(150,100,200,0.15) 100%)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', border: '2px solid rgba(150,120,200,0.25)', boxShadow: '0 20px 40px rgba(0,212,255,0.1)' }}>
            🔧
          </div>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(180deg, #fff 0%, #d0e8ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Trades <span style={{ color: '#d4af37' }}>Ai</span> Operator
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#b8a8d8', marginBottom: '1.2rem', letterSpacing: '0.3px' }}>24/7 AI receptionist built for every UK trade business.</p>
        <p style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem', fontWeight: '400' }}>Answers every call 24/7. Delivers instant quotes from photos. Books jobs straight into your diary, takes deposits, and never lets a customer reach voicemail again.</p>
        <button onClick={() => setPage('signup')} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,212,255,0.25)', transition: 'all 0.3s ease', marginBottom: '2rem' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 30px 60px rgba(0,212,255,0.4)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 20px 50px rgba(0,212,255,0.25)'; }}>Get Started Free</button>
        
        {/* Trust Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '500px', margin: '0 auto', fontSize: '0.85rem', color: '#888' }}>
          <div style={{ padding: '0.8rem', background: 'rgba(100,150,200,0.05)', border: '1px solid rgba(100,150,200,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🔒</span> <span>Secure & GDPR Compliant</span>
          </div>
          <div style={{ padding: '0.8rem', background: 'rgba(100,150,200,0.05)', border: '1px solid rgba(100,150,200,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🇬🇧</span> <span>UK-Based Support</span>
          </div>
          <div style={{ padding: '0.8rem', background: 'rgba(100,150,200,0.05)', border: '1px solid rgba(100,150,200,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span> <span>Fully Insured & Compliant</span>
          </div>
          <div style={{ padding: '0.8rem', background: 'rgba(100,150,200,0.05)', border: '1px solid rgba(100,150,200,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>💷</span> <span>14-Day Money Back</span>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        {/* Feature 1 */}
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(100,150,200,0.1) 0%, rgba(150,100,200,0.1) 100%)', border: '1px solid rgba(150,120,200,0.15)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '6rem', textAlign: 'center', lineHeight: '1' }}>☎️</div>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Never Miss Another Job Again</h2>
            <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Trades Ai Operator answers every enquiry 24/7 in clear, natural British English – always using your exact business name and tone. Calm, professional and friendly, so no customer ever reaches voicemail again.</p>
            <button onClick={() => setPage('signup')} style={{ padding: '0.8rem 1.6rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.15)'; }}>Hear it live in 30 seconds →</button>
          </div>
        </div>

        {/* Feature 2 */}
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(100,150,200,0.1) 0%, rgba(150,100,200,0.1) 100%)', border: '1px solid rgba(150,120,200,0.15)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)' }}>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Instant Job Booking</h2>
            <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>We check your real-time diary automatically and book jobs straight away, suggesting practical slots that actually work for you. Automatic SMS and WhatsApp confirmations go to the customer – all sorted with zero effort.</p>
            <button onClick={() => setPage('signup')} style={{ padding: '0.8rem 1.6rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.15)'; }}>See real-time booking →</button>
          </div>
          <div style={{ fontSize: '6rem', textAlign: 'center', lineHeight: '1' }}>💷</div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.8rem' }}>
          {[
            { icon: '📊', title: 'AUTO CRM', desc: 'Every interaction logged to Google Sheets automatically. Full audit trail. Zero manual data entry. Ever.' },
            { icon: '📅', title: 'REAL DIARY BOOKING', desc: 'Checks your actual Google Calendar. Confirms slots. Sends SMS. Zero double-bookings, zero chaos.' },
            { icon: '📸', title: 'AI PHOTO QUOTES', desc: 'Customer sends a photo. Trade Operator AI returns a realistic UK price range instantly.' },
            { icon: '🚨', title: 'EMERGENCY PROTOCOL', desc: 'Gas, flooding, carbon monoxide. Safety first. Team alerted immediately. Handled properly every time.' }
          ].map((feature, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(60,40,90,0.25) 0%, rgba(40,20,70,0.25) 100%)', border: '1px solid rgba(150,120,200,0.12)', borderRadius: '12px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', cursor: 'pointer', transform: hoveredFeature === idx ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hoveredFeature === idx ? '0 25px 50px rgba(0,212,255,0.1)' : '0 10px 30px rgba(0,0,0,0.2)' }} onMouseEnter={() => setHoveredFeature(idx)} onMouseLeave={() => setHoveredFeature(null)}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem', transition: 'transform 0.3s ease', transform: hoveredFeature === idx ? 'scale(1.15)' : 'scale(1)' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.8rem', color: '#d4af37' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Section */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(100,150,200,0.1) 0%, rgba(150,100,200,0.1) 100%)', border: '1px solid rgba(150,120,200,0.15)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '6rem', textAlign: 'center', lineHeight: '1' }}>📈</div>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Maximise Your Revenue</h2>
            <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Take deposits during the call, offer sensible upsells when it makes sense, and enjoy complete automatic logging of every lead, quote and booking. More money coming in with zero extra admin for you or your team.</p>
            <button onClick={() => setPage('signup')} style={{ padding: '0.8rem 1.6rem', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.15)'; }}>Get your free test call & pricing →</button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: '#aaa', fontSize: '1.05rem' }}>No hidden fees. No surprise charges. Cancel anytime.</p>
        </div>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(100,150,200,0.12) 0%, rgba(150,100,200,0.12) 100%)', border: '2px solid rgba(0,212,255,0.3)', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem', letterSpacing: '0.5px' }}>SETUP + MONTHLY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'baseline', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.3rem', color: '#aaa' }}>£1,197</span>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>setup</span>
            <span style={{ fontSize: '1.3rem', color: '#aaa', marginLeft: '1rem' }}>£447</span>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>per month</span>
          </div>
          <p style={{ color: '#999', fontSize: '0.95rem', margin: '0' }}>Everything included. Scale with your business. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '4.5rem 2rem 3.5rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Be First to Unlock Trades Ai Operator</h2>
        <p style={{ color: '#aaa', fontSize: '1.05rem', marginBottom: '0.8rem', lineHeight: '1.6' }}>Join the fast-growing group of UK trade businesses securing their dedicated 24/7 AI receptionist.</p>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '2.5rem' }}>Trades Ai Operator – The professional operator every small trade business needs and can rely on.</p>
        <button onClick={() => setPage('signup')} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,212,255,0.25)', transition: 'all 0.3s ease', marginBottom: '2.5rem' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 30px 60px rgba(0,212,255,0.4)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 20px 50px rgba(0,212,255,0.25)'; }}>Start Free Trial</button>
        
        {/* Footer Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#666', marginBottom: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(150,120,200,0.1)' }}>
          <span>🔒 Secure by design</span>
          <span>•</span>
          <span>🇬🇧 UK-based</span>
          <span>•</span>
          <span>✅ GDPR protected</span>
          <span>•</span>
          <span>💷 Money-back guarantee</span>
        </div>
        <p style={{ color: '#555', fontSize: '0.8rem' }}>© 2026 Trades Ai Operator. All rights reserved.</p>
      </section>
    </div>
  );
};

export default App;
