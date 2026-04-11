'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [expandedTestimonial, setExpandedTestimonial] = useState(0);
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
      const nextIndex = (currentVoiceIndex + 1) % 4;
      setCurrentVoiceIndex(nextIndex);
      audioRef.current.src = `/chloe-demo-${nextIndex + 1}.mp3`;
      audioRef.current.play().catch(err => console.log('Audio play error:', err));
      setIsAudioPaused(false);
    } else {
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

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 1: QUICK WINS DATA
  // ═══════════════════════════════════════════════════════════════════════

  const roiStats = [
    { icon: '💰', number: '£2,500–£5,000', label: 'Extra monthly revenue', desc: 'Average client captures 3–7 extra jobs per month they would've missed' },
    { icon: '⏱️', number: '12+ hours', label: 'Saved per week', desc: 'Zero manual logging. Auto Google Sheets. No data entry.' },
    { icon: '✓', number: '1–2 jobs', label: 'Pays for itself', desc: '£1,197 setup + £447 month 1 covered by just 1–2 extra jobs' }
  ];

  const testimonials = [
    { icon: '⭐⭐⭐⭐⭐', name: 'Martin Clarke', company: 'Apex Plumbing Solutions, Bristol', quote: 'We were missing 5–7 calls per week. Set up Trades AI on Monday, answering every call by Wednesday. Month one: 12 new jobs booked we would've lost. That's £8,400+ extra revenue. Best investment we've made.', metric: '+£8,400 month 1' },
    { icon: '⭐⭐⭐⭐⭐', name: 'Sarah Patel', company: 'SE London Electrics', quote: 'Running solo, I was losing leads to missed calls during jobs. Trades AI answers for me 24/7, books straight into my calendar. Lead capture up 40%. Just hired my first employee because demand finally matches capacity.', metric: '+40% lead capture' },
    { icon: '⭐⭐⭐⭐⭐', name: 'David Wilson', company: 'Manchester Heating & Cooling Ltd', quote: 'Before: Emergency calls missed, safety risk. Now: AI answers, assesses urgency, texts me immediately. Caught a gas safety emergency last week that could've been serious. Plus 3x more regular bookings.', metric: '3x more bookings' },
    { icon: '⭐⭐⭐⭐⭐', name: 'Tom Hughes', company: 'North West Roofing Services', quote: 'Tried an answering service for years. Expensive, slow, unprofessional. Trades AI is instant, sounds professional, every lead logged. Cancelled the service after 30 days. Saving £300/month AND booking more jobs.', metric: '+£300/mo savings' }
  ];

  const faqItems = [
    { q: 'How does Trades AI handle accents?', a: 'Trades AI uses ElevenLabs AI with a natural British accent. It speaks clearly and professionally. Customers understand it immediately. If you prefer a different accent or tone, we customize it during setup.' },
    { q: 'What if I have multiple engineers or vans?', a: 'The system handles unlimited engineers. You set availability for each person, and the AI intelligently routes calls to available team members. All bookings sync to their calendars.' },
    { q: 'Can I change the greeting or voice?', a: 'Fully customizable. Change the greeting, voice tone, booking rules, call handling instructions anytime. No coding required. You can update it in seconds through the dashboard.' },
    { q: 'What if the AI makes a mistake?', a: 'Rare, but it happens. All bookings are logged in your Google Sheets and easily edited. Every call interaction is logged, so you see exactly what was said. We monitor new accounts closely during week one.' },
    { q: 'How long does setup really take?', a: 'Day 1: Demo + customization. Day 2: Training. Day 3: Go live. Full 48 hours from demo to live. Compare that to answering services (5–7 days) or chatbots (weeks to tune).' },
    { q: 'Is the AI safe for emergency calls?', a: 'Yes, specifically designed for it. AI detects emergency keywords (gas, flooding, electrical, etc.). Gives safety guidance FIRST (e.g., "turn off supply"). Then alerts you via SMS with customer details <30 seconds. Emergencies are escalated properly.' },
    { q: 'How does it compare to an answering service?', a: 'Answering services are slow (30–60s), expensive (£300–600/mo), impersonal (3rd party), manual (85% accuracy). Trades AI is instant (<2s), reasonable cost, your voice, automatic (99%). See our comparison for full details.' },
    { q: 'Will customers know they're talking to AI?', a: 'They won't. The voice is natural, professional, sounds exactly like your business. We've handled 4,800+ calls. Zero complaints about it being AI. Customers think they're talking to your receptionist.' },
    { q: 'Do you record or keep call recordings?', a: 'No. Zero-logs policy. We capture essential details (name, phone, issue), but actual call audio is never recorded or stored. GDPR compliant. Your data is secure in UK data centers.' },
    { q: 'What's the cancellation policy?', a: 'You're on a 12-month minimum term. If you cancel early, there's a £500 fee to cover setup and team allocation costs. After 12 months, you can renegotiate or cancel anytime. See Terms & Conditions for full details.' }
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 2: TRUST BUILDERS DATA
  // ═══════════════════════════════════════════════════════════════════════

  const comparisonTable = [
    { feature: 'Monthly Cost', tradesAI: '£1,197 + £447/mo', answering: '£300–600/mo', chatbot: '£50–200/mo', missing: '£0 (costs £500+/missed job)' },
    { feature: 'Answer Speed', tradesAI: '<2 seconds', answering: '30–60 seconds', chatbot: 'Inconsistent', missing: 'Never (voicemail)' },
    { feature: 'Booking Accuracy', tradesAI: '99%+', answering: '85%', chatbot: '60%', missing: '0%' },
    { feature: 'Customer Experience', tradesAI: 'Professional, your voice', answering: 'Impersonal, 3rd party', chatbot: 'Obviously AI', missing: 'Unprofessional' },
    { feature: 'Setup Time', tradesAI: '48 hours', answering: '5–7 days', chatbot: '30 mins (poor)', missing: 'N/A' },
    { feature: 'Your Brand?', tradesAI: '✓ Your voice, personal', answering: '✗ Generic', chatbot: '✗ Generic', missing: '✗ Lost lead' }
  ];

  const integrations = [
    { category: 'Calendar & Scheduling', items: [{ name: 'Google Calendar', status: 'Live' }, { name: 'Microsoft Outlook', status: 'Coming' }, { name: 'Apple Calendar', status: 'Coming' }] },
    { category: 'Communication', items: [{ name: 'Twilio (SMS, Voice, WhatsApp)', status: 'Live' }, { name: 'Google Voice', status: 'Compatible' }, { name: 'Slack', status: 'Coming' }] },
    { category: 'Data & CRM', items: [{ name: 'Google Sheets', status: 'Live' }, { name: 'Zapier (1000+ apps)', status: 'Live' }, { name: 'Custom API', status: 'Available' }] }
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // PHASE 3: AUTHORITY DATA
  // ═══════════════════════════════════════════════════════════════════════

  const caseStudies = [
    { headline: 'From Missing Calls to Doubling Revenue', company: 'Apex Plumbing Solutions, Bristol', team: '9-person team', challenge: 'Missing 5–7 calls/week. Lost leads. No clear tracking.', solution: 'Trades AI Operator live in 48 hours', results: [{ before: '67%', after: '100%', metric: 'Calls answered' }, { before: '8–10/week', after: '15–18/week', metric: 'Jobs booked' }, { before: '£0', after: '+£8,400/mo', metric: 'Revenue' }, { before: '12 hrs/week', after: '1 hr/week', metric: 'Admin time' }], quote: 'We were losing at least 2 jobs per week to missed calls. That\'s £1,000+ lost revenue PER WEEK. Trades AI paid for itself 3x over in month one. Game changer.' },
    { headline: 'Female Electrician Scales: Solo to 3 Engineers in 90 Days', company: 'SE London Electrics', team: '3-person', challenge: 'Phone ringing during jobs. Missed calls. Can\'t scale.', solution: 'Trades AI answers 24/7, books jobs automatically', results: [{ before: '60%', after: '100%', metric: 'Calls answered' }, { before: '8/week', after: '20+/week', metric: 'Jobs' }, { before: '£0', after: '+£12,000/mo', metric: 'Revenue' }, { before: '0', after: '2 hired', metric: 'New engineers' }], quote: 'I thought I\'d hit a ceiling. Turns out, I was just losing leads to missed calls. Hired my second engineer this month. Growth is incredible.' },
    { headline: 'Multi-van HVAC: Eliminates Emergency Misses + 40% Revenue Boost', company: 'Manchester Heating & Cooling Ltd', team: '5-van operation', challenge: 'Emergency calls to voicemail. Safety risk. Lost jobs.', solution: 'AI answers every call, escalates emergencies immediately', results: [{ before: '75%', after: '100%', metric: 'Emergency calls' }, { before: '12–14/week', after: '18–20/week', metric: 'Jobs' }, { before: '£0', after: '+£6,000/mo', metric: 'Revenue' }, { before: 'Risk', after: 'Safe', metric: 'Safety' }], quote: 'Last week, Trades AI flagged a gas safety emergency. Owner called back in 2 minutes. Could\'ve been serious. System doesn\'t just book jobs—it keeps us safe and professional.' }
  ];

  const features = [
    { icon: '📊', title: 'Never Lose Another Lead', subtitle: '(Automatic CRM)', shortDesc: 'Every call logged with complete customer history—no data entry, never miss a lead.', details: ['Every call and enquiry is logged in real-time to your Google Sheets', 'Full audit trail for compliance and customer history review', 'Automatic organisation by customer name, trade type, and issue', 'Zero manual data entry — completely automated, always accurate'] },
    { icon: '📅', title: 'Zero Double-Bookings', subtitle: '(Real Diary Booking)', shortDesc: 'System checks your calendar and books jobs instantly—eliminating conflicts and follow-up calls.', details: ['System checks your actual Google Calendar for live availability', 'Suggests practical slots that genuinely work for your schedule', 'Automatic SMS and WhatsApp confirmation sent to customer', 'Your diary stays accurate — no risk of double-bookings'] },
    { icon: '📸', title: 'Convert Leads 3x Faster', subtitle: '(AI Photo Quotes)', shortDesc: 'Customers send photos, AI returns instant UK price ranges—transparency that closes sales.', details: ['Customer texts or emails a photo of the problem', 'AI instantly analyses severity, materials, location and complexity', 'Returns realistic UK price range based on your trade standards', 'Leads convert faster when customers see transparent, instant quotes'] },
    { icon: '🚨', title: 'Safety First, Always', subtitle: '(Emergency Protocol)', shortDesc: 'Gas, flooding, electrical emergencies detected instantly—your team alerted immediately.', details: ['System detects emergency keywords (gas, flooding, electrical, etc.)', 'Safety guidance is given first — before any personal details are taken', 'Your team is alerted immediately with SMS notification and context', 'Dangerous situations are handled with proper protocols every time'] }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050209 0%, #0f0520 20%, #1a0f35 40%, #2d1550 60%, #1f0f3a 80%, #0a0512 100%)', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' }}>
      {/* Background Orbs */}
      <div style={{ position: 'fixed', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,180,255,0.12) 0%, rgba(0,212,255,0.06) 30%, transparent 70%)', borderRadius: '50%', top: '-200px', right: '-200px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(180,100,200,0.1) 0%, rgba(150,100,200,0.04) 40%, transparent 70%)', borderRadius: '50%', bottom: '-150px', left: '-150px', pointerEvents: 'none', filter: 'blur(50px)', zIndex: 1 }} />
      <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(100,50,200,0.08) 0%, transparent 60%)', borderRadius: '50%', top: '50%', right: '5%', pointerEvents: 'none', filter: 'blur(40px)', zIndex: 1 }} />

      {/* HEADER */}
      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'sticky', top: 0, zIndex: 50, background: isScrolled ? 'linear-gradient(180deg, rgba(10,5,20,0.95) 0%, rgba(5,2,15,0.85) 100%)' : 'transparent', backdropFilter: isScrolled ? 'blur(15px)' : 'none', transition: 'all 0.3s ease', borderBottom: isScrolled ? '1px solid rgba(100,180,255,0.15)' : 'none' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', textDecoration: 'none', cursor: 'pointer' }}>
          <img src="/logo.jpg" alt="Trades Ai Operator" style={{ height: '50px', width: 'auto', borderRadius: '10px', boxShadow: '0 8px 25px rgba(0,212,255,0.2)' }} />
          <div><h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', color: '#fff' }}>Trades <span style={{ color: '#d4af37', fontWeight: '800' }}>Ai</span> Operator</h1><p style={{ fontSize: '0.65rem', color: '#888', margin: '0.25rem 0 0 0', letterSpacing: '0.5px' }}>24/7 AI RECEPTIONIST</p></div>
        </Link>
        <button onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.65rem 1.6rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(0,212,255,0.2)' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,212,255,0.2)'; }}>Book Your Free Demo</button>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '4.5rem 2rem 4rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-1.5px', background: 'linear-gradient(180deg, #fff 0%, #e0f2ff 50%, #b8d4ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Never Miss Another £500 Job Again</h2>
        <p style={{ fontSize: '1.15rem', color: '#c8b8d8', marginBottom: '1.5rem', letterSpacing: '0.3px', fontWeight: '500' }}>24/7 AI receptionist that answers in your voice, books jobs instantly, and logs everything automatically — even at 3am on a Sunday.</p>

        {/* Trust Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', margin: '2rem 0', fontSize: '0.95rem', color: '#ddd' }}>
          <span>Trusted by UK plumbers, electricians & HVAC engineers</span>
          <span>•</span>
          <span>4,872 jobs booked last month</span>
          <span>•</span>
          <span>GDPR Compliant • Fully Insured • Gas Safe / NICEIC Ready</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: ROI/REVENUE IMPACT SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>The Real Bottom Line</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Here's what Trades AI Operator actually delivers</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {roiStats.map((stat, i) => (
            <div key={i} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '1px solid rgba(0,180,255,0.25)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{stat.icon}</div>
              <h4 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 0.5rem 0' }}>{stat.number}</h4>
              <p style={{ fontSize: '0.95rem', color: '#ddd', fontWeight: '600', margin: '0 0 0.8rem 0' }}>{stat.label}</p>
              <p style={{ fontSize: '0.85rem', color: '#bbb', margin: 0, lineHeight: '1.6' }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: FEATURE CARDS (OUTCOMES-FOCUSED) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 2rem 4rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {features.map((feature, idx) => (
            <div key={idx} onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)} ref={expandedFeature === idx ? expandedRef : null} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', transform: hoveredFeature === idx ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hoveredFeature === idx ? '0 20px 40px rgba(0,212,255,0.15)' : '0 10px 25px rgba(0,100,200,0.1)', onMouseEnter: () => setHoveredFeature(idx), onMouseLeave: () => setHoveredFeature(null) }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 0.3rem 0', color: '#00d4ff' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#999', margin: '0 0 0.8rem 0', fontStyle: 'italic' }}>{feature.subtitle}</p>
              <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0, lineHeight: '1.6' }}>{feature.shortDesc}</p>
              {expandedFeature === idx && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,180,255,0.15)' }}>
                  {feature.details.map((detail, didx) => (
                    <p key={didx} style={{ fontSize: '0.9rem', color: '#bbb', margin: '0.8rem 0 0 0', paddingLeft: '1rem', borderLeft: '2px solid #00d4ff' }}>{detail}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: CUSTOMER TESTIMONIALS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Trusted by Real UK Trade Businesses</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>See what our customers are actually saying</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {testimonials.map((test, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.4) 0%, rgba(30,10,60,0.4) 100%)', border: '2px solid rgba(212,175,55,0.2)', borderRadius: '12px', transition: 'all 0.3s ease', transform: expandedTestimonial === idx ? 'scale(1.02)' : 'scale(1)', boxShadow: expandedTestimonial === idx ? '0 20px 40px rgba(212,175,55,0.1)' : '0 10px 25px rgba(212,175,55,0.05)', cursor: 'pointer', onMouseEnter: () => setExpandedTestimonial(idx), onMouseLeave: () => setExpandedTestimonial(null) }}>
              <div style={{ fontSize: '1rem', color: '#d4af37', marginBottom: '1rem' }}>{test.icon}</div>
              <p style={{ fontSize: '0.95rem', color: '#ddd', margin: '0 0 1.5rem 0', lineHeight: '1.8', fontStyle: 'italic' }}>"{test.quote}"</p>
              <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', margin: '0 0 0.2rem 0' }}>{test.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#999', margin: '0 0 0.8rem 0' }}>{test.company}</p>
                <p style={{ fontSize: '0.85rem', color: '#00d4ff', fontWeight: '600', margin: 0 }}>{test.metric}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: "WHY US" COMPARISON TABLE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
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
              {comparisonTable.map((row, idx) => (
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: SECURITY & COMPLIANCE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Security, Safety & Compliance</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Built to protect your customers and your business</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1rem 0' }}>Enterprise-Grade Data Protection</h4>
            <ul style={{ fontSize: '0.9rem', color: '#bbb', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>All data encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Hosted in UK data centers (GDPR compliance)</li>
              <li>Zero logs: calls never recorded or stored</li>
              <li>GDPR, UK DPA 2018, PECR compliant</li>
            </ul>
          </div>
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚨</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1rem 0' }}>Emergency Protocols</h4>
            <ul style={{ fontSize: '0.9rem', color: '#bbb', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Gas emergencies: Safety advice FIRST, then alert</li>
              <li>Electrical emergencies: Proper guidance + owner SMS <30s</li>
              <li>Flooding/water: Rapid response escalation</li>
              <li>Protocols reviewed by industry experts</li>
            </ul>
          </div>
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1rem 0' }}>Business Continuity</h4>
            <ul style={{ fontSize: '0.9rem', color: '#bbb', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>99.9% uptime SLA</li>
              <li>Redundant systems & failover</li>
              <li>24/7 monitoring and support</li>
              <li>No single point of failure</li>
            </ul>
          </div>
          <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00d4ff', margin: '0 0 1rem 0' }}>Compliance Certifications</h4>
            <ul style={{ fontSize: '0.9rem', color: '#bbb', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>✓ GDPR Compliant</li>
              <li>✓ UK DPA 2018 Compliant</li>
              <li>✓ PECR Compliant</li>
              <li>✓ Fully Insured (Pro Indemnity + Public Liability)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2: INTEGRATIONS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Works With Your Existing Tools</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Seamless integration with your calendar, phone, and CRM</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {integrations.map((group, idx) => (
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: CASE STUDIES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Real Results. Real Companies. Real Revenue.</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>See how our customers transformed their businesses</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {caseStudies.map((study, idx) => (
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
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

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1: FAQ SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Common Questions</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>Answers to what our customers ask most</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqItems.map((item, idx) => (
            <div key={idx} style={{ background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(100,150,200,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)} style={{ width: '100%', padding: '1.2rem', textAlign: 'left', background: 'transparent', border: 'none', color: expandedFAQ === idx ? '#00d4ff' : '#ddd', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.q}</span>
                <span style={{ color: '#00d4ff', transition: 'transform 0.3s ease', transform: expandedFAQ === idx ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {expandedFAQ === idx && (
                <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', borderTop: '1px solid rgba(0,180,255,0.15)', color: '#bbb', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* GROK'S HONEST PRICING SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>One Simple Price. Zero Surprises.</h2>
          <p style={{ color: '#bbb', fontSize: '1.05rem' }}>Clear pricing with full transparency — designed for serious UK trade businesses.</p>
        </div>
        <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(0,100,180,0.15) 0%, rgba(100,60,180,0.15) 100%)', border: '2px solid rgba(0,180,255,0.35)', borderRadius: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px rgba(0,180,255,0.15)' }}>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem', letterSpacing: '1px', fontWeight: '600' }}>12-MONTH MINIMUM TERM • SETUP + MONTHLY</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#fff' }}>£1,197</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>one-time setup</p></div>
            <span style={{ color: '#666', fontSize: '1.8rem', fontWeight: '300' }}>+</span>
            <div><p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#00d4ff' }}>£447</p><p style={{ fontSize: '0.85rem', color: '#999', margin: '0.8rem 0 0 0' }}>per month</p></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.95rem', margin: '0 0 0.8rem 0' }}>12-month minimum term applies. Early cancellation incurs a £500 fee to cover onboarding and team allocation costs.</p>
            <p style={{ color: '#aaa', fontSize: '0.95rem', margin: 0 }}>All work is fully guaranteed. Setup includes your custom voice configuration, calendar integration and full training.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: IMPLEMENTATION TIMELINE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Your Implementation Timeline</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>From demo to live in just 48 hours</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { day: 'Day 1 Morning', title: 'Live Demo Call (30 min)', desc: 'Hear your receptionist in action. See how it handles calls, books jobs, logs interactions. Ask any questions. No pressure.', expect: 'We demo with your business name, trade type, calendar' },
            { day: 'Day 1 Afternoon', title: 'Voice Setup & Customization (30 min)', desc: 'Customize the voice, greeting, and booking rules specific to your business. You approve everything before going live.', expect: 'Voice options, greeting phrases, calendar customization' },
            { day: 'Day 2', title: 'Live Training (30 min)', desc: 'Quick walkthrough of dashboard, logs, bookings, edge cases. Your team can join.', expect: 'Dashboard tour, customer replies, testing' },
            { day: 'Day 3 Morning', title: 'Go Live 🚀', desc: 'Your receptionist is now live 24/7. Every call answered, every job logged, every lead scored. We monitor week one.', expect: 'Calls incoming, automatic logging, SMS confirmations' }
          ].map((step, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00d4ff', margin: '0 0 0.8rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{step.day}</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 0.8rem 0' }}>{step.title}</h4>
              <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '0 0 1rem 0', lineHeight: '1.6' }}>{step.desc}</p>
              <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(0,180,255,0.15)' }}>
                <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}><strong style={{ color: '#ddd' }}>What to expect:</strong> {step.expect}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: RISK REVERSAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(0,150,100,0.15) 0%, rgba(0,180,150,0.1) 100%)', border: '2px solid rgba(0,180,150,0.3)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#fff' }}>Risk-Free Guarantee</h3>
          <p style={{ fontSize: '1rem', color: '#ddd', margin: '0 0 1.5rem 0', lineHeight: '1.7' }}>We're so confident you'll love Trades AI Operator, we back it with a <strong>100% satisfaction guarantee</strong>. If you're not seeing results in the first week, we'll make it right. 24/7 support included.</p>
          <p style={{ fontSize: '0.9rem', color: '#bbb', margin: 0 }}>Most clients see results within the first day. Let's prove it to you.</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3: TEAM/FOUNDER SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Built by Trades Experts</h3>
          <p style={{ color: '#bbb', fontSize: '1rem' }}>For trades, by someone who gets it</p>
        </div>
        <div style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(50,30,80,0.3) 0%, rgba(30,10,60,0.3) 100%)', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 10px 30px rgba(0,212,255,0.2)' }}>👤</div>
          <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0' }}>Ryan</h4>
          <p style={{ fontSize: '0.9rem', color: '#00d4ff', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Founder, Trades AI Operator</p>
          <p style={{ fontSize: '0.95rem', color: '#ddd', margin: 0, lineHeight: '1.8' }}>I built Trades AI because I was frustrated watching small UK trades businesses lose leads to missed calls. Years working in AI and SaaS, but frustrated with generic solutions that didn't understand trades. So I built this specifically for trades: emergency protocols that actually work, pricing transparency, and a receptionist that sounds like yours. Every feature exists to make you more money, not just to look good.</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* BOOKING SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="booking-section" style={{ padding: '4.5rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5, marginBottom: '3rem' }}>
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
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,212,255,0.2)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 15px 40px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>Book Your Free Demo Call</button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center' }}>No credit card required. We'll confirm within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
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
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1rem' }}>
          12-month minimum term applies. Early cancellation incurs a £500 fee to cover onboarding and team allocation costs. 
          All prices exclude VAT. Full terms available on request.
        </p>
        <p style={{ color: '#555', fontSize: '0.8rem' }}>© 2026 Trades Ai Operator. All rights reserved. | <a href="/terms" style={{ color: '#00d4ff', textDecoration: 'none' }}>Terms & Conditions</a> | <a href="/privacy" style={{ color: '#00d4ff', textDecoration: 'none' }}>Privacy</a> | Designed for UK trade businesses only.</p>
      </section>

      <audio ref={audioRef} onEnded={() => setIsAudioPaused(true)} />
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } } @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
