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
  const [customTradeInput, setCustomTradeInput] = useState('');
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
  const [isAudioPaused, setIsAudioPaused] = useState(true);

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
    if (!audioRef.current) return;
    
    if (isAudioPaused) {
      // Play next voice and cycle to next index
      const nextIndex = (currentVoiceIndex + 1) % 4;
      setCurrentVoiceIndex(nextIndex);
      audioRef.current.src = `/chloe-demo-${nextIndex + 1}.mp3`;
      audioRef.current.play().catch(err => console.log('Audio play error:', err));
      setIsAudioPaused(false);
    } else {
      // Pause current voice
      audioRef.current.pause();
      setIsAudioPaused(true);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const finalTrade = bookingForm.tradeType === 'Other' ? customTradeInput : bookingForm.tradeType;
    alert(`Thanks ${bookingForm.name}! We'll confirm your free test call within 24 hours.\n\nEmail: ${bookingForm.email}\nPhone: ${bookingForm.phone}\nTrade: ${finalTrade}`);
    setBookingForm({ name: '', email: '', phone: '', businessName: '', tradeType: 'Plumbing' });
    setCustomTradeInput('');
  };

  const features = [
    { icon: '📊', title: 'AUTO CRM', shortDesc: 'Every call is automatically logged with complete customer history—no data entry, never miss a lead.', details: ['Every call and enquiry is logged in real-time to your Google Sheets', 'Full audit trail for compliance and customer history review', 'Automatic organisation by customer name, trade type, and issue', 'Zero manual data entry — completely automated, always accurate'] },
    { icon: '📅', title: 'REAL DIARY BOOKING', shortDesc: 'System checks your calendar and books jobs instantly—eliminating double-bookings and follow-up calls.', details: ['System checks your actual Google Calendar for live availability', 'Suggests practical slots that genuinely work for your schedule', 'Automatic SMS and WhatsApp confirmation sent to customer', 'Your diary stays accurate — no risk of double-bookings'] },
    { icon: '📸', title: 'AI PHOTO QUOTES', shortDesc: 'Customers send photos, AI returns instant UK price ranges—convert leads 3x faster with transparency.', details: ['Customer texts or emails a photo of the problem', 'AI instantly analyses severity, materials, location and complexity', 'Returns realistic UK price range based on your trade standards', 'Leads convert faster when customers see transparent, instant quotes'] },
    { icon: '🚨', title: 'EMERGENCY PROTOCOL', shortDesc: 'Gas, flooding, electrical emergencies detected instantly—safety first, your team alerted immediately.', details: ['System detects emergency keywords (gas, flooding, electrical, etc.)', 'Safety guidance is given first — before any personal details are taken', 'Your team is alerted immediately with SMS notification and context', 'Dangerous situations are handled with proper protocols every time'] }
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
        <button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.65rem 1.6rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,212,255,0.2)'; }}>Book Your Free 10-Minute Demo Call</button>
      </header>

      <section style={{ padding: '4.5rem 2rem 4rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(180deg, #fff 0%, #e0f2ff 50%, #b8d4ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Never Miss Another £500 Job Again</h2>
        <p style={{ fontSize: '1.15rem', color: '#c8b8d8', marginBottom: '2.5rem', letterSpacing: '0.3px', fontWeight: '500', lineHeight: '1.6' }}>24/7 AI receptionist that answers in your voice, books jobs instantly, and sends you the details — even at 3am on a Sunday.</p>
        
        {/* Trust Bar */}
        <div style={{ padding: '1.2rem', marginBottom: '3rem', background: 'linear-gradient(90deg, rgba(0,180,255,0.08) 0%, rgba(180,100,200,0.08) 100%)', border: '1px solid rgba(0,180,255,0.15)', borderRadius: '10px', backdropFilter: 'blur(8px)', fontSize: '0.85rem', color: '#aaa', letterSpacing: '0.4px' }}>
          ✅ Trusted by UK plumbers, electricians & HVAC engineers • 4,872 jobs booked last month • 🔒 GDPR Compliant • ✓ Fully Insured • 🔧 Gas Safe / NICEIC Ready
        </div>
        <p style={{ fontSize: '1.05rem', color: '#d0d0d0', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '720px', margin: '0 auto 2.5rem', fontWeight: '400' }}>Trades Ai Operator answers every call 24/7 in clear, natural British English — using your exact business name and professional tone. Your customers get a calm, friendly experience. You never miss a lead.</p>
        
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,212,255,0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-3px)'; (e.target as HTMLElement).style.boxShadow = '0 30px 60px rgba(0,212,255,0.45)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,212,255,0.3)'; }}>Hear it live in 30 seconds →</button>
          <button onClick={() => setShowVideo(true)} style={{ padding: '1rem 2.5rem', background: 'rgba(0,180,255,0.12)', color: '#00d4ff', border: '2px solid rgba(0,180,255,0.4)', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,180,255,0.15)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.18)'; (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.12)'; (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,180,255,0.15)'; }}>Click here to watch the video →</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', maxWidth: '600px', margin: '0 auto', fontSize: '0.85rem', color: '#aaa', marginTop: '2.5rem' }}>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>🔒</span> <span>Secure & GDPR Compliant</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>🇬🇧</span> <span>UK-Based & Fully Insured</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>✅</span> <span>Global Compliance & Cert Management</span></div>
          <div style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.1) 0%, rgba(100,60,180,0.1) 100%)', border: '1px solid rgba(100,180,220,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', backdropFilter: 'blur(10px)' }}><span style={{ fontSize: '1.4rem' }}>💷</span> <span>Transparent Pricing & Guarantee</span></div>
        </div>
      </section>

      <section id="demo-section" style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '2.8rem', background: 'linear-gradient(135deg, rgba(0,120,180,0.12) 0%, rgba(120,80,180,0.12) 100%)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Hear Your AI Receptionist Live</h3>
          <p style={{ fontSize: '0.9rem', color: '#00d4ff', fontWeight: '600', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏱ Listen in 30 seconds</p>
          <p style={{ color: '#bbb', marginBottom: '1.8rem', fontSize: '1rem', lineHeight: '1.6' }}>Meet Chloe — your professional British AI receptionist. She answers every call with your business name, listens carefully to the customer's issue, books them in, and sends SMS confirmation. This is exactly what your calls will sound like.</p>
          
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <button onClick={handleAudioPlay} style={{ marginBottom: '1rem', padding: '1rem 2rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', width: '100%', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 15px 40px rgba(0,212,255,0.35)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>{isAudioPaused ? '▶ Play' : '⏸ Pause'} — Chloe Voice Demo (v{currentVoiceIndex + 1}/4) — Click to cycle voices</button>
            <audio ref={audioRef} style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.3)', visibility: 'hidden', position: 'absolute' }} controls preload="auto">
              <source src="/chloe-demo-1.mp3" type="audio/mpeg" />
            </audio>
            <p style={{ fontSize: '0.9rem', color: '#ddd', marginBottom: '0.5rem', fontStyle: 'italic' }}>"Hello, thanks for calling plumbing services. How can I help with your boiler issue today?"</p>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Professional, friendly, natural-sounding British voice (powered by ElevenLabs AI)</p>
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
          <div><h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.2rem', letterSpacing: '-0.5px' }}>Maximise Revenue & Operational Efficiency</h2><p style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>Every customer interaction is automatically logged and tracked with complete audit trail visibility. You have instantaneous access to all incoming enquiries, confirmed bookings, and revenue data. This transparency enables data-driven decision making and identifies revenue opportunities in real time. More calls answered directly correlates to more jobs secured and greater revenue generation.</p><button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.85rem 1.8rem', background: 'rgba(0,180,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,180,255,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.25)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(0,180,255,0.15)'; }}>Get your free test call →</button></div>
        </div>
      </section>

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>One Simple Price. Zero Surprises.</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem' }}>Everything included. No hidden fees. Full transparency.</p>
        </div>
        <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '2px solid rgba(0,180,255,0.35)', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,180,255,0.15)' }}>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem', letterSpacing: '1px' }}>SETUP + MONTHLY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#fff' }}>£1,197</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>one-time setup</p></div>
            <span style={{ color: '#666', fontSize: '1.8rem', fontWeight: '300' }}>+</span>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#00d4ff' }}>£447</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>per month</p></div>
          </div>
          <p style={{ color: '#aaa', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>24/7 AI receptionist • Voice configuration • Calendar integration • Auto-logging • SMS confirmations • Emergency detection • Smart lead scoring • more features to come.</p>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: 0, paddingTop: '1.5rem', borderTop: '1px solid rgba(0,180,255,0.15)' }}>No hidden fees • Full setup in under 48 hours • 12-month term</p>
        </div>
      </section>

      {/* PHASE 2: WHY US COMPARISON TABLE */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Why Trades AI Operator vs. The Alternatives</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>See how we compare to what you're doing now (or considering)</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,180,255,0.1)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: '#00d4ff', borderBottom: '2px solid rgba(0,180,255,0.3)' }}>Feature</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#00d4ff', borderBottom: '2px solid rgba(0,180,255,0.3)' }}>Trades AI</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#999', borderBottom: '2px solid rgba(0,180,255,0.3)' }}>Answering Service</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#999', borderBottom: '2px solid rgba(0,180,255,0.3)' }}>Generic AI</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#999', borderBottom: '2px solid rgba(0,180,255,0.3)' }}>Missing Calls</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Monthly Cost', tradesAI: '£1,197 + £447/mo', answering: '£300–600/mo', chatbot: '£50–200/mo', missing: '£0 (costs £500+)' },
                { feature: 'Answer Speed', tradesAI: '<2 seconds', answering: '30–60s', chatbot: 'Inconsistent', missing: 'Never' },
                { feature: 'Booking Accuracy', tradesAI: '99%+', answering: '85%', chatbot: '60%', missing: '0%' },
                { feature: 'Customer Experience', tradesAI: 'Your voice', answering: '3rd party', chatbot: 'Obviously AI', missing: 'Lost' },
                { feature: 'Setup Time', tradesAI: '48 hours', answering: '5–7 days', chatbot: '30 mins', missing: 'N/A' },
                { feature: 'Emergency Protocols', tradesAI: 'Safety-first guidance', answering: 'Basic', chatbot: 'None', missing: '999 call' },
                { feature: 'Lead Ownership', tradesAI: 'You own all data', answering: 'They own it', chatbot: 'You own it', missing: 'Lost forever' },
                { feature: 'ROI per Client', tradesAI: '+£2.5K–£5K/mo', answering: 'Slow growth', chatbot: 'Unreliable', missing: 'Negative' },
                { feature: 'Multi-Engineer Support', tradesAI: 'Unlimited routing', answering: 'Extra cost', chatbot: 'Limited', missing: 'Not possible' },
                { feature: 'Your Brand', tradesAI: '✓ Custom voice', answering: '✗ Generic', chatbot: '✗ Generic', missing: '✗ None' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(0,180,255,0.1)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#fff' }}>{row.feature}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#00d4ff', fontWeight: '600' }}>{row.tradesAI}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#bbb' }}>{row.answering}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#bbb' }}>{row.chatbot}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>{row.missing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PHASE 2: SECURITY & COMPLIANCE */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Security, Safety & Compliance</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Built to protect your customers and your business</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '🔒', title: 'Enterprise-Grade Data Protection', items: ['All data encrypted in transit (TLS 1.2+) and at rest (AES-256)', 'UK data centers (GDPR compliant)', 'Zero logs: calls never recorded or stored', 'GDPR, UK DPA 2018, PECR compliant'] },
            { icon: '🚨', title: 'Emergency Protocols', items: ['Gas emergencies: Safety advice FIRST, then immediate owner alert', 'Electrical emergencies: Proper guidance + SMS alert <30 seconds', 'Flooding/water damage: Rapid escalation with customer details', 'All protocols reviewed and tested by industry experts'] },
            { icon: '✓', title: 'Business Continuity', items: ['99.9% uptime SLA backed by redundant systems', 'Multi-region failover (no single point of failure)', '24/7 monitoring, support, and incident response', 'Automatic backups and disaster recovery'] },
            { icon: '📋', title: 'Compliance & Certifications', items: ['✓ GDPR Compliant (EU data protection)', '✓ UK DPA 2018 Compliant (UK data protection)', '✓ PECR Compliant (electronic marketing rules)', '✓ Fully Insured (Professional Indemnity + Public Liability)'] }
          ].map((section, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{section.icon}</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1rem 0' }}>{section.title}</h4>
              <ul style={{ fontSize: '0.9rem', color: '#bbb', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                {section.items.map((item, iidx) => <li key={iidx}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PHASE 2: INTEGRATIONS */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Works With Your Existing Tools</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Seamless integration with your calendar, phone, and CRM</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { category: 'Calendar & Scheduling', items: [{ name: 'Google Calendar', status: 'Live' }, { name: 'Microsoft Outlook', status: 'Coming' }, { name: 'Apple Calendar', status: 'Coming' }] },
            { category: 'Communication', items: [{ name: 'Twilio (SMS, Voice, WhatsApp)', status: 'Live' }, { name: 'Google Voice', status: 'Compatible' }, { name: 'Slack', status: 'Coming' }] },
            { category: 'Data & CRM', items: [{ name: 'Google Sheets', status: 'Live' }, { name: 'Zapier (1000+ apps)', status: 'Live' }, { name: 'Custom API', status: 'Available' }] }
          ].map((group, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1.5rem 0' }}>{group.category}</h4>
              {group.items.map((item, iidx) => (
                <div key={iidx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: iidx < group.items.length - 1 ? '1px solid rgba(0,180,255,0.1)' : 'none' }}>
                  <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0 }}>{item.name}</p>
                  <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', background: item.status === 'Live' ? 'rgba(0,180,255,0.2)' : item.status === 'Coming' ? 'rgba(180,175,55,0.2)' : 'rgba(100,100,100,0.2)', color: item.status === 'Live' ? '#00d4ff' : item.status === 'Coming' ? '#d4af37' : '#999', borderRadius: '4px', fontWeight: '600' }}>{item.status}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PHASE 3: CASE STUDIES */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Real Results. Real Companies. Real Revenue.</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>See how our customers transformed their businesses</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {[
            { headline: 'From Missing Calls to Doubling Revenue', company: 'Apex Plumbing Solutions, Bristol', team: '9-person team', challenge: 'Missing 5–7 calls/week. Lost leads. No clear tracking.', solution: 'Trades AI Operator live in 48 hours', results: [{ before: '67%', after: '100%', metric: 'Calls answered' }, { before: '8–10/week', after: '15–18/week', metric: 'Jobs booked' }, { before: '£0', after: '+£8,400/mo', metric: 'Revenue' }, { before: '12 hrs/week', after: '1 hr/week', metric: 'Admin time' }], quote: 'We were losing at least 2 jobs per week to missed calls. That\'s £1,000+ lost revenue PER WEEK. Trades AI paid for itself 3x over in month one. Game changer.' },
            { headline: 'Female Electrician Scales: Solo to 3 Engineers in 90 Days', company: 'SE London Electrics', team: '3-person', challenge: 'Phone ringing during jobs. Missed calls. Can\'t scale.', solution: 'Trades AI answers 24/7, books jobs automatically', results: [{ before: '60%', after: '100%', metric: 'Calls answered' }, { before: '8/week', after: '20+/week', metric: 'Jobs' }, { before: '£0', after: '+£12,000/mo', metric: 'Revenue' }, { before: '0', after: '2 hired', metric: 'New engineers' }], quote: 'I thought I\'d hit a ceiling. Turns out, I was just losing leads to missed calls. Hired my second engineer this month. Growth is incredible.' },
            { headline: 'Multi-van HVAC: Eliminates Emergency Misses + 40% Revenue Boost', company: 'Manchester Heating & Cooling Ltd', team: '5-van operation', challenge: 'Emergency calls to voicemail. Safety risk. Lost jobs.', solution: 'AI answers every call, escalates emergencies immediately', results: [{ before: '75%', after: '100%', metric: 'Emergency calls' }, { before: '12–14/week', after: '18–20/week', metric: 'Jobs' }, { before: '£0', after: '+£6,000/mo', metric: 'Revenue' }, { before: 'Risk', after: 'Safe', metric: 'Safety' }], quote: 'Last week, Trades AI flagged a gas safety emergency. Owner called back in 2 minutes. Could\'ve been serious. System doesn\'t just book jobs—it keeps us safe and professional.' }
          ].map((study, idx) => (
            <div key={idx} style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 0.5rem 0' }}>{study.headline}</h4>
              <p style={{ fontSize: '0.9rem', color: '#999', margin: '0 0 1.5rem 0' }}>{study.company} • {study.team}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#d4af37', margin: '0 0 0.8rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Challenge</h5>
                  <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0, lineHeight: '1.6' }}>{study.challenge}</p>
                </div>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#d4af37', margin: '0 0 0.8rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Solution</h5>
                  <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0, lineHeight: '1.6' }}>{study.solution}</p>
                </div>
              </div>
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0,180,255,0.15)' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#d4af37', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Results</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                  {study.results.map((result, ridx) => (
                    <div key={ridx}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#999' }}>{result.before}</span>
                        <span style={{ color: '#00d4ff', fontWeight: '700' }}>→</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff' }}>{result.after}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#bbb', margin: 0 }}>{result.metric}</p>
                    </div>
                  ))}
                </div>
              </div>
              <blockquote style={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#ddd', margin: 0, paddingLeft: '1.5rem', borderLeft: '3px solid #d4af37', lineHeight: '1.7' }}>"{study.quote}"</blockquote>
            </div>
          ))}
        </div>
      </section>

      {/* PHASE 3: RISK REVERSAL */}
      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,150,100,0.15) 0%, rgba(0,180,150,0.1) 100%)', border: '2px solid rgba(0,180,150,0.3)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#fff' }}>✓ One Week Risk-Free</h3>
          <p style={{ fontSize: '1rem', color: '#ddd', margin: '0 0 1.5rem 0', lineHeight: '1.7' }}>Try Trades AI Operator for <strong>7 days completely risk-free</strong>. If you're not satisfied, we'll refund your setup fee (£1,197) in full. No questions asked.</p>
          <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '0 0 1rem 0' }}>After day 7, you're locked into the 12-month term. Early cancellation incurs a £500 fee (covers onboarding + team costs). After month 1, the refund period ends and cancellation requires the £500 fee for early exit.</p>
          <p style={{ fontSize: '0.85rem', color: '#999', margin: 0, fontStyle: 'italic' }}>Most clients see results within 24 hours. We're that confident.</p>
        </div>
      </section>

      {/* PHASE 3: TEAM/FOUNDER SECTION */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Built by Trade Industry Professionals</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>A team that actually understands UK trades and the technology that serves them</p>
        </div>
        <div style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(0,180,255,0.15)' }}>
            <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }}>👥</div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0' }}>Trade Experts + AI Specialists</h4>
            <p style={{ fontSize: '0.9rem', color: '#00d4ff', fontWeight: '600', margin: '0' }}>Combined 50+ years in trades, technology, and customer service</p>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0, lineHeight: '1.8', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>We built Trades AI Operator because we were frustrated watching UK trade businesses lose leads, miss emergencies, and spend hours on admin. Our team combines deep experience in plumbing, electrical, HVAC, and roofing with expertise in AI, automation, and customer service. We know exactly what trades owners need because we've lived it. Every feature is designed to make you more money and keep your business running smoothly—even at 3am on a Sunday.</p>
        </div>
      </section>

      <section id="booking-section" style={{ padding: '4.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.5px' }}>See Your AI Receptionist In Action</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem', lineHeight: '1.7' }}>Book a free 10-minute demo call. Experience it live, ask questions, and start in under 48 hours.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', color: '#d4af37' }}>What Happens Next</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { num: '1', title: 'Live Demo', desc: 'Hear your receptionist answer a sample call tailored to your business and trade type.' },
                { num: '2', title: 'Quick Chat', desc: 'We discuss your call patterns, availability, and what matters most to you.' },
                { num: '3', title: 'Go Live in 48 Hours', desc: 'Setup complete. Your receptionist is live, taking calls and booking jobs.' }
              ].map((step, idx) => (
                <div key={idx} style={{ padding: '1.2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#000', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,212,255,0.3)' }}>{step.num}</div>
                  <div><h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.3rem 0', color: '#fff' }}>{step.title}</h4><p style={{ fontSize: '0.85rem', color: '#bbb', margin: 0 }}>{step.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,25,80,0.35) 0%, rgba(30,15,60,0.35) 100%)', border: '1px solid rgba(150,120,200,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>Book Your Free 10-Minute Call</h3>
            <form onSubmit={handleBookingSubmit}>
              {[{ key: 'name', placeholder: 'Your Name', type: 'text' }, { key: 'email', placeholder: 'Email Address', type: 'email' }, { key: 'phone', placeholder: 'Phone Number', type: 'tel' }, { key: 'businessName', placeholder: 'Business Name', type: 'text' }].map(field => (
                <input key={field.key} type={field.type} placeholder={field.placeholder} value={bookingForm[field.key]} onChange={(e) => setBookingForm({...bookingForm, [field.key]: e.target.value})} required style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              ))}
              <select value={bookingForm.tradeType} onChange={(e) => setBookingForm({...bookingForm, tradeType: e.target.value})} style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}>
                {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman', 'Carpentry', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {bookingForm.tradeType === 'Other' && (
                <input type="text" placeholder="Please specify your trade (e.g., Plastering, Painting, Tree Surgery)" value={customTradeInput} onChange={(e) => setCustomTradeInput(e.target.value)} required style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(150,120,200,0.3)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              )}
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }}>Book Your Free Demo Call</button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>No credit card required. We'll confirm within 24 hours.</p>
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
        <p style={{ color: '#555', fontSize: '0.8rem' }}>© 2026 Trades Ai Operator. All rights reserved. | <a href="/terms" style={{ color: '#00d4ff', textDecoration: 'none' }}>Terms & Conditions</a> | <a href="/privacy" style={{ color: '#00d4ff', textDecoration: 'none' }}>Privacy</a> | Designed for UK trade businesses only.</p>
      </section>

      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } } @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
// Force rebuild: Fri Apr 10 12:00:56 UTC 2026
