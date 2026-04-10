'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const expandedRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', businessName: '', tradeType: 'Plumbing' });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (expandedFeature !== null && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [expandedFeature]);

  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play error:', err));
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks ${bookingForm.name}! We'll confirm your free test call within 24 hours.\n\nEmail: ${bookingForm.email}\nPhone: ${bookingForm.phone}`);
    setBookingForm({ name: '', email: '', phone: '', businessName: '', tradeType: 'Plumbing' });
  };

  const features = [
    { icon: '📊', title: 'AUTO CRM', shortDesc: 'Every interaction is logged to Google Sheets automatically, with a complete audit trail.', details: ['Every call and enquiry is logged in real-time to your Google Sheets', 'Full audit trail for compliance and customer history review', 'Automatic organisation by customer name, trade type, and issue', 'Zero manual data entry — completely automated, always accurate'] },
    { icon: '📅', title: 'REAL DIARY BOOKING', shortDesc: 'Checks your Google Calendar in real-time and suggests available slots automatically.', details: ['System checks your actual Google Calendar for live availability', 'Suggests practical slots that genuinely work for your schedule', 'Automatic SMS and WhatsApp confirmation sent to customer', 'Your diary stays accurate — no risk of double-bookings'] },
    { icon: '📸', title: 'AI PHOTO QUOTES', shortDesc: 'Customer sends a photo. Our AI analyses it and returns a realistic UK price range instantly.', details: ['Customer texts or emails a photo of the problem', 'AI instantly analyses severity, materials, location and complexity', 'Returns realistic UK price range based on your trade standards', 'Leads convert faster when customers see transparent, instant quotes'] },
    { icon: '🚨', title: 'EMERGENCY PROTOCOL', shortDesc: 'Gas, flooding, or electrical emergencies are detected and handled with proper safety first.', details: ['System detects emergency keywords (gas, flooding, electrical, etc.)', 'Safety guidance is given first — before any personal details are taken', 'Your team is alerted immediately with SMS notification and context', 'Dangerous situations are handled with proper protocols every time'] }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' }}>
      <div style={{ position: 'fixed', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,180,255,0.12) 0%, rgba(0,212,255,0.06) 30%, transparent 70%)', borderRadius: '50%', top: '-200px', right: '-200px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(180,100,200,0.1) 0%, rgba(150,100,200,0.04) 40%, transparent 70%)', borderRadius: '50%', bottom: '-150px', left: '-150px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(100,50,200,0.08) 0%, transparent 60%)', borderRadius: '50%', top: '50%', right: '5%', pointerEvents: 'none', filter: 'blur(40px)', zIndex: 1 }} />

      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'sticky', top: 0, zIndex: 50, background: isScrolled ? 'linear-gradient(180deg, rgba(10,5,20,0.95) 0%, rgba(5,2,15,0.85) 100%)' : 'transparent', backdropFilter: isScrolled ? 'blur(15px)' : 'none', transition: 'all 0.3s ease', borderBottom: isScrolled ? '1px solid rgba(100,180,255,0.15)' : 'none' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', textDecoration: 'none', cursor: 'pointer' }}>
          <img src="/logo.jpg" alt="Trades Ai Operator" style={{ height: '50px', width: 'auto', borderRadius: '10px', boxShadow: '0 8px 25px rgba(0,212,255,0.2)' }} />
          <div><h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', color: '#fff' }}>Trades <span style={{ color: '#d4af37', fontWeight: '800' }}>Ai</span> Operator</h1><p style={{ fontSize: '0.65rem', color: '#888', margin: '0.25rem 0 0 0', letterSpacing: '0.5px' }}>24/7 AI RECEPTIONIST</p></div>
        </Link>
        <button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.65rem 1.6rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,212,255,0.2)'; }}>Get your free test call & pricing</button>
      </header>

      <section style={{ padding: '4.5rem 2rem 4rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(180deg, #fff 0%, #e0f2ff 50%, #b8d4ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Never Miss Another Job Again</h2>
        <p style={{ fontSize: '1.15rem', color: '#c8b8d8', marginBottom: '1.5rem', letterSpacing: '0.3px', fontWeight: '500' }}>24/7 AI receptionist built for every UK trade business.</p>
        <p style={{ fontSize: '1.05rem', color: '#d0d0d0', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '720px', margin: '0 auto 2.5rem', fontWeight: '400' }}>Trades Ai Operator answers every call 24/7 in clear, natural British English — using your exact business name and professional tone. Your customers get a calm, friendly experience. You never miss a lead.</p>
        
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,212,255,0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-3px)'; (e.target as HTMLElement).style.boxShadow = '0 30px 60px rgba(0,212,255,0.45)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,212,255,0.3)'; }}>Hear it live in 30 seconds →</button>
          <button onClick={() => setShowVideo(true)} style={{ padding: '1rem 2.5rem', background: 'rgba(0,180,255,0.12)', color: '#00d4ff', border: '2px solid rgba(0,180,255,0.4)', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,180,255,0.15)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.18)'; (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.12)'; (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,180,255,0.15)'; }}>Watch 42-second demo →</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', maxWidth: '600px', margin: '0 auto', fontSize: '0.85rem', color: '#aaa', marginTop: '2.5rem' }}>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>🔒</span> <span>Secure & GDPR Compliant</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>🇬🇧</span> <span>UK-Based & Fully Insured</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>✅</span> <span>Gas Safe / NICEIC Compliant</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>💷</span> <span>Transparent Pricing & Guarantee</span></div>
        </div>
      </section>

      <section id="demo-section" style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Hear Your 24/7 AI Receptionist</h3>
          <p style={{ color: '#bbb', marginBottom: '1.8rem', fontSize: '1rem', lineHeight: '1.6' }}>This is Charlotte, your professional British AI receptionist. She answers every call with your business name, listens carefully to the customer's issue, and books them in or takes their message.</p>
          
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <button onClick={handleAudioPlay} style={{ marginBottom: '1rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', width: '100%', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 15px 40px rgba(0,212,255,0.35)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>▶ Play Charlotte Demo (ElevenLabs)</button>
            <audio ref={audioRef} style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', display: 'none' }} controls>
              <source src="/api/voice/demo" type="audio/mpeg" />
            </audio>
            <p style={{ fontSize: '0.9rem', color: '#ddd', marginBottom: '0.5rem' }}>"Hello, thanks for calling your plumbing business. How can I help with your boiler issue today?"</p>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Sample greeting (Charlotte voice via ElevenLabs)</p>
          </div>
        </div>
      </section>

      {showVideo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }} onClick={() => setShowVideo(false)}>
          <div style={{ background: '#000', borderRadius: '12px', padding: 0, maxWidth: '800px', width: '90%', boxShadow: '0 30px 60px rgba(0,0,0,0.9)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowVideo(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', zIndex: 101 }}>✕</button>
            <div style={{ padding: '2rem', background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '12px', textAlign: 'center', color: '#bbb' }}>Click the feature cards above to see how Charlotte handles calls, bookings, and emergencies in real-time.</div>
          </div>
        </div>
      )}

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3.5rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite' }}>☎️</div>
          <div><h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Never Miss a Call</h2><p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Every enquiry is answered 24/7, even at 3am on a Sunday. Your customers hear a professional, friendly voice — not a voicemail. No more missed jobs.</p><button onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.15)'; }}>Hear a live demo →</button></div>
        </div>

        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem', alignItems: 'center', marginBottom: '2.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div><h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Instant Booking</h2><p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Your diary stays accurate. The system checks your real Google Calendar and books available slots. Customers get automatic SMS confirmation. No back-and-forth emails.</p><button onClick={() => setShowVideo(true)} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.15)'; }}>Watch how it works →</button></div>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite 0.5s' }}>💷</div>
        </div>
      </section>

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: expandedFeature !== null ? '2rem' : '0' }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{ padding: '2.2rem', background: 'linear-gradient(135deg, rgba(80,40,120,0.25) 0%, rgba(40,20,80,0.25) 100%)', border: '1px solid rgba(120,100,180,0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', cursor: 'pointer', transform: hoveredFeature === idx ? 'translateY(-10px)' : 'translateY(0)', boxShadow: hoveredFeature === idx ? '0 35px 70px rgba(0,180,255,0.18)' : '0 10px 35px rgba(0,0,0,0.25)' }} onMouseEnter={() => setHoveredFeature(idx)} onMouseLeave={() => setHoveredFeature(null)} onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)}>
              <div style={{ fontSize: '4.5rem', marginBottom: '1rem', transition: 'transform 0.3s ease', transform: hoveredFeature === idx ? 'scale(1.25)' : 'scale(1)' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.9rem', color: '#d4af37' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#bbb', lineHeight: '1.7', margin: '0 0 0.8rem 0' }}>{feature.shortDesc}</p>
              <p style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: '600' }}>Click for details →</p>
            </div>
          ))}
        </div>

        {expandedFeature !== null && (
          <div ref={expandedRef} style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '1px solid rgba(100,180,255,0.2)', borderRadius: '16px', backdropFilter: 'blur(10px)', animation: 'slideDown 0.3s ease-out' }}>
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

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3.5rem', alignItems: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '7rem', textAlign: 'center', lineHeight: '1', animation: 'float 3s ease-in-out infinite 1s' }}>📈</div>
          <div><h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Make More Money</h2><p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Every call is logged automatically. Every quote is tracked. You see exactly what's coming in and what's booked. More calls answered = more jobs = more revenue. Simple as that.</p><button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.15)'; }}>Get your free test call & pricing →</button></div>
        </div>
      </section>

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem' }}>No hidden costs. No surprises. Everything is included.</p>
        </div>
        <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '2px solid rgba(0,180,255,0.35)', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,180,255,0.15)' }}>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem', letterSpacing: '1px' }}>SETUP + MONTHLY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#fff' }}>£1,197</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>one-time setup</p></div>
            <span style={{ color: '#666', fontSize: '1.8rem', fontWeight: '300' }}>+</span>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#00d4ff' }}>£447</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>per month</p></div>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.95rem', margin: '0' }}>Setup includes your voice configuration and calendar integration. No contracts. Cancel anytime.</p>
        </div>
      </section>

      <section id="booking-section" style={{ padding: '4.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Your Free Test Call</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem', lineHeight: '1.7' }}>Book a 10-minute call with our team. You'll see your receptionist in action and get personalised pricing for your trade.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: '#d4af37' }}>What Happens</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { num: '1', title: 'Live Demo', desc: 'Hear your receptionist answer a sample call for your business' },
                { num: '2', title: 'Quick Chat', desc: 'We discuss your specific trade type, call patterns, and needs' },
                { num: '3', title: 'Go Live', desc: 'Start taking calls within 48 hours of signing up' }
              ].map((step, idx) => (
                <div key={idx} style={{ padding: '1.2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#000', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,212,255,0.3)' }}>{step.num}</div>
                  <div><h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.3rem 0', color: '#fff' }}>{step.title}</h4><p style={{ fontSize: '0.85rem', color: '#bbb', margin: 0 }}>{step.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,25,80,0.35) 0%, rgba(30,15,60,0.35) 100%)', border: '1px solid rgba(150,120,200,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>Book Your Call</h3>
            <form onSubmit={handleBookingSubmit}>
              {[{ key: 'name', placeholder: 'Your Name', type: 'text' }, { key: 'email', placeholder: 'Email Address', type: 'email' }, { key: 'phone', placeholder: 'Phone Number', type: 'tel' }, { key: 'businessName', placeholder: 'Business Name', type: 'text' }].map(field => (
                <input key={field.key} type={field.type} placeholder={field.placeholder} value={bookingForm[field.key]} onChange={(e) => setBookingForm({...bookingForm, [field.key]: e.target.value})} required style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              ))}
              <select value={bookingForm.tradeType} onChange={(e) => setBookingForm({...bookingForm, tradeType: e.target.value})} style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}>
                {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman', 'Carpentry'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }}>Book Your Call</button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>We'll confirm within 24 hours. No credit card needed.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#666', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(100,180,255,0.15)' }}>
          <span>🔒 GDPR Compliant</span>
          <span>•</span>
          <span>🇬🇧 UK-Based</span>
          <span>•</span>
          <span>✅ Fully Insured</span>
          <span>•</span>
          <span>💷 Transparent Pricing</span>
        </div>
        <p style={{ color: '#555', fontSize: '0.8rem' }}>© 2026 Trades Ai Operator. All rights reserved. | Designed for UK trade businesses only.</p>
      </section>

      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } } @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
// Force rebuild: Fri Apr 10 12:00:56 UTC 2026
