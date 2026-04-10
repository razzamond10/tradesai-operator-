'use client';
import React, { useState, useEffect } from 'react';

const App = () => {
  const [page, setPage] = useState('landing');
  const [clientEmail, setClientEmail] = useState('');
  const [formData, setFormData] = useState({ businessName: '', email: '', phone: '', tradeType: 'Plumbing', password: '' });
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideoDemo, setShowVideoDemo] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({ name: '', email: '', phone: '', businessName: '', tradeType: 'Plumbing' });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    localStorage.setItem('clientEmail', formData.email);
    localStorage.setItem('clientData', JSON.stringify(formData));
    setClientEmail(formData.email);
    setPage('dashboard');
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks ${bookingFormData.name}! We'll be in touch within 24 hours to confirm your free test call.\n\nEmail: ${bookingFormData.email}\nPhone: ${bookingFormData.phone}`);
    setBookingFormData({ name: '', email: '', phone: '', businessName: '', tradeType: 'Plumbing' });
  };

  const handleLogout = () => {
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientData');
    setClientEmail('');
    setPage('landing');
  };

  const features = [
    { icon: '📊', title: 'AUTO CRM', shortDesc: 'Every interaction logged to Google Sheets automatically. Full audit trail. Zero manual data entry. Ever.', details: ['Real-time logging of all calls and interactions', 'Complete audit trail for compliance and review', 'Automatic data organisation by customer and issue type', 'Zero manual data entry — totally automated'] },
    { icon: '📅', title: 'REAL DIARY BOOKING', shortDesc: 'Checks your actual Google Calendar. Confirms slots. Sends SMS. Zero double-bookings, zero chaos.', details: ['Checks your real Google Calendar in real-time', 'Suggests practical slots that actually work for you', 'Automatic SMS/WhatsApp confirmation to customer', 'Zero double-bookings — impossible to happen'] },
    { icon: '📸', title: 'AI PHOTO QUOTES', shortDesc: 'Customer sends a photo. Trade Operator AI returns a realistic UK price range instantly.', details: ['Customer texts or emails a photo of the problem', 'AI instantly analyses severity, materials, location', 'Returns realistic UK trade price range in seconds', 'Leads convert faster when customers see instant quotes'] },
    { icon: '🚨', title: 'EMERGENCY PROTOCOL', shortDesc: 'Gas, flooding, carbon monoxide. Safety first. Team alerted immediately. Handled properly every time.', details: ['Detects emergency keywords (gas, flooding, etc.)', 'Gives safety advice first — before capture', 'Alerts your team immediately with SMS', 'Handles dangerous situations with proper protocols'] }
  ];

  if (page === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0512 0%, #15082a 35%, #1f0f3a 65%, #0f0520 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(200,150,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(25,15,45,0.8) 0%, rgba(15,5,25,0.4) 100%)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/logo.jpg" alt="Trades Ai Operator" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} />
            <h1 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Trades <span style={{ color: '#d4af37' }}>Ai</span> Operator</h1>
          </div>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'fixed', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,180,255,0.12) 0%, rgba(0,212,255,0.06) 30%, transparent 70%)', borderRadius: '50%', top: '-200px', right: '-200px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(180,100,200,0.1) 0%, rgba(150,100,200,0.04) 40%, transparent 70%)', borderRadius: '50%', bottom: '-150px', left: '-150px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(100,50,200,0.08) 0%, transparent 60%)', borderRadius: '50%', top: '50%', right: '5%', pointerEvents: 'none', filter: 'blur(40px)', zIndex: 1 }} />

      {/* Sticky Header with Actual Logo */}
      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'sticky', top: 0, zIndex: 50, background: isScrolled ? 'linear-gradient(180deg, rgba(10,5,20,0.95) 0%, rgba(5,2,15,0.85) 100%)' : 'transparent', backdropFilter: isScrolled ? 'blur(15px)' : 'none', transition: 'all 0.3s ease', borderBottom: isScrolled ? '1px solid rgba(100,180,255,0.15)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src="/logo.jpg" alt="Trades Ai Operator" style={{ height: '50px', width: 'auto', borderRadius: '10px', boxShadow: '0 8px 25px rgba(0,212,255,0.2)' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Trades <span style={{ color: '#d4af37', fontWeight: '800' }}>Ai</span> Operator</h1>
            <p style={{ fontSize: '0.65rem', color: '#888', margin: '0.25rem 0 0 0', letterSpacing: '0.5px' }}>24/7 AI RECEPTIONIST</p>
          </div>
        </div>
        <button onClick={() => setPage('signup')} style={{ padding: '0.65rem 1.6rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 30px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(0,212,255,0.2)'; }}>Sign In</button>
      </header>

      {/* Hero */}
      <section style={{ padding: '4.5rem 2rem 4rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(180deg, #fff 0%, #e0f2ff 50%, #b8d4ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Never Miss Another Job Again
        </h2>
        <p style={{ fontSize: '1.15rem', color: '#c8b8d8', marginBottom: '1.5rem', letterSpacing: '0.3px', fontWeight: '500' }}>24/7 AI receptionist built for every UK trade business.</p>
        <p style={{ fontSize: '1.05rem', color: '#d0d0d0', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '720px', margin: '0 auto 2.5rem', fontWeight: '400' }}>Trades Ai Operator answers every enquiry 24/7 in clear, natural British English – always using your exact business name and tone. Calm, professional and friendly, so no customer ever reaches voicemail again.</p>
        
        {/* Hero CTAs */}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowVideoDemo(!showVideoDemo)} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,212,255,0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 30px 60px rgba(0,212,255,0.45)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 20px 50px rgba(0,212,255,0.3)'; }}>Hear it live in 30 seconds →</button>
          <button onClick={() => window.open('https://www.loom.com/share/sample-booking-demo', '_blank')} style={{ padding: '1rem 2.5rem', background: 'rgba(0,180,255,0.12)', color: '#00d4ff', border: '2px solid rgba(0,180,255,0.4)', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,180,255,0.15)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,180,255,0.18)'; e.target.style.boxShadow = '0 12px 30px rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,180,255,0.12)'; e.target.style.boxShadow = '0 8px 20px rgba(0,180,255,0.15)'; }}>See real-time booking →</button>
        </div>

        {/* Audio Demo Player */}
        {showVideoDemo && (
          <div style={{ marginBottom: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '1px solid rgba(100,180,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>Listen to your 24/7 AI receptionist in action (Charlotte voice):</p>
            <audio controls style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }}>
              <source src="https://cdn.openai.com/API/voice-samples/sample-01.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>This is a sample greeting. Yours will use your business name, location, and tone.</p>
          </div>
        )}
        
        {/* Trust Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', maxWidth: '600px', margin: '0 auto', fontSize: '0.85rem', color: '#aaa', marginTop: '2.5rem' }}>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '1.4rem' }}>🔒</span> <span>Secure & GDPR Compliant</span>
          </div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '1.4rem' }}>🇬🇧</span> <span>UK-Based & Fully Insured</span>
          </div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '1.4rem' }}>✅</span> <span>Gas Safe / NICEIC Compliant</span>
          </div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '1.4rem' }}>💷</span> <span>Transparent Pricing & Guarantee</span>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        {/* Feature 1 */}
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3.5rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite' }}>☎️</div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Never Miss Another Job Again</h2>
            <p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Trades Ai Operator answers every enquiry 24/7 in clear, natural British English – always using your exact business name and tone. Calm, professional and friendly, so no customer ever reaches voicemail again.</p>
            <button onClick={() => setShowVideoDemo(!showVideoDemo)} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,180,255,0.15)'; }}>Hear it live in 30 seconds →</button>
          </div>
        </div>

        {/* Feature 2 */}
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Instant Job Booking</h2>
            <p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>We check your real-time diary automatically and book jobs straight away, suggesting practical slots that actually work for you. Automatic SMS and WhatsApp confirmations go to the customer – all sorted with zero effort.</p>
            <button onClick={() => window.open('https://www.loom.com/share/sample-booking-demo', '_blank')} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,180,255,0.15)'; }}>See real-time booking →</button>
          </div>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite 0.5s' }}>💷</div>
        </div>
      </section>

      {/* Features Grid - Clickable Cards */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: expandedFeature !== null ? '2rem' : '0' }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{ padding: '2.2rem', background: 'linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,80,0.25) 100%)', border: '1px solid rgba(120,100,180,0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', cursor: 'pointer', transform: hoveredFeature === idx ? 'translateY(-10px)' : 'translateY(0)', boxShadow: hoveredFeature === idx ? '0 35px 70px rgba(0,180,255,0.18)' : '0 10px 35px rgba(0,0,0,0.25)' }} onMouseEnter={() => setHoveredFeature(idx)} onMouseLeave={() => setHoveredFeature(null)} onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)}>
              <div style={{ fontSize: '4.5rem', marginBottom: '1rem', transition: 'transform 0.3s ease', transform: hoveredFeature === idx ? 'scale(1.25)' : 'scale(1)' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.9rem', color: '#d4af37' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#bbb', lineHeight: '1.7', margin: '0 0 0.8rem 0' }}>{feature.shortDesc}</p>
              <p style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: '600' }}>Click to learn more →</p>
            </div>
          ))}
        </div>

        {/* Expanded Feature Details */}
        {expandedFeature !== null && (
          <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '1px solid rgba(100,180,255,0.2)', borderRadius: '16px', backdropFilter: 'blur(10px)', animation: 'slideDown 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '3.5rem' }}>{features[expandedFeature].icon}</div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#d4af37' }}>{features[expandedFeature].title}</h2>
              </div>
              <button onClick={() => setExpandedFeature(null)} style={{ background: 'none', border: 'none', color: '#00d4ff', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {features[expandedFeature].details.map((detail, idx) => (
                <div key={idx} style={{ padding: '1.2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#ddd', lineHeight: '1.6', margin: 0 }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Revenue Section */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3.5rem', alignItems: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite 1s' }}>📈</div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Maximise Your Revenue</h2>
            <p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Take deposits during the call, offer sensible upsells when it makes sense, and enjoy complete automatic logging of every lead, quote and booking. More money coming in with zero extra admin for you or your team.</p>
            <button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,180,255,0.15)'; }}>Get your free test call & pricing →</button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem' }}>No hidden fees. No surprise charges. Cancel anytime.</p>
        </div>
        <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '2px solid rgba(0,180,255,0.35)', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,180,255,0.15)' }}>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem', letterSpacing: '1px' }}>SETUP + MONTHLY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#fff' }}>£1,197</p>
              <p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>one-time setup</p>
            </div>
            <span style={{ color: '#666', fontSize: '1.8rem', fontWeight: '300' }}>+</span>
            <div>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#00d4ff' }}>£447</p>
              <p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>per month</p>
            </div>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.95rem', margin: '0' }}>Everything included. Scale with your business. No long contracts.</p>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" style={{ padding: '4.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Your Free Test Call</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem', lineHeight: '1.7' }}>Book a 10-minute call with our team. You'll hear your receptionist in action and get personalised pricing for your trade.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Left: What to Expect */}
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: '#d4af37' }}>What Happens Next</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { num: '1', title: 'Live Demo', desc: 'Hear your receptionist answer a call for your business' },
                { num: '2', title: 'Personalised Setup', desc: 'We tailor your pricing, voice, and workflows' },
                { num: '3', title: 'Your Pricing', desc: 'Get a quote based on your trade and call volume' },
                { num: '4', title: 'Go Live', desc: 'Start taking calls immediately after setup' }
              ].map((step, idx) => (
                <div key={idx} style={{ padding: '1.2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#000', flexShrink: 0 }}>{step.num}</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.3rem 0', color: '#fff' }}>{step.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#bbb', margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Booking Form */}
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,25,80,0.35) 0%, rgba(30,15,60,0.35) 100%)', border: '1px solid rgba(150,120,200,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>Book Your Free Call</h3>
            <form onSubmit={handleBookingSubmit}>
              {[{ key: 'name', placeholder: 'Your Name', type: 'text' }, { key: 'email', placeholder: 'Email Address', type: 'email' }, { key: 'phone', placeholder: 'Phone Number', type: 'tel' }, { key: 'businessName', placeholder: 'Business Name', type: 'text' }].map(field => (
                <input key={field.key} type={field.type} placeholder={field.placeholder} value={bookingFormData[field.key]} onChange={(e) => setBookingFormData({...bookingFormData, [field.key]: e.target.value})} required style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.3s ease' }} onFocus={(e) => { e.target.style.borderColor = 'rgba(150,120,200,0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(150,120,200,0.2)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }} />
              ))}
              <select value={bookingFormData.tradeType} onChange={(e) => setBookingFormData({...bookingFormData, tradeType: e.target.value})} style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}>
                {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman', 'Carpentry'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.35)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>Book Your Call Now</button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>We'll confirm within 24 hours. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '4rem 2rem 3rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <p style={{ color: '#666', fontSize: '0.8rem' }}>© 2026 Trades Ai Operator. All rights reserved.</p>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
