'use client';
import React, { useState } from 'react';

// Premium Carrd-Inspired Landing
const LandingPage = ({ onSignupClick }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)',
    color: '#fff',
    fontFamily: '"Sohne", -apple-system, BlinkMacSystemFont, sans-serif',
    overflowX: 'hidden'
  }}>
    {/* Subtle Background Orbs */}
    <div style={{ position: 'fixed', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', borderRadius: '50%', top: '-100px', right: '-100px', pointerEvents: 'none', zIndex: 1 }} />
    <div style={{ position: 'fixed', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(100,200,255,0.03) 0%, transparent 70%)', borderRadius: '50%', bottom: '-50px', left: '-50px', pointerEvents: 'none', zIndex: 1 }} />

    {/* Navigation */}
    <nav style={{
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
        Trades Ai Operator
      </div>
      <button onClick={onSignupClick} style={{
        padding: '0.6rem 1.2rem',
        background: 'rgba(0,212,255,0.1)',
        color: '#00d4ff',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.2)'; e.target.style.borderColor = 'rgba(0,212,255,0.6)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.1)'; e.target.style.borderColor = 'rgba(0,212,255,0.3)'; }}>
        Sign In
      </button>
    </nav>

    {/* Hero Section */}
    <section style={{ padding: '6rem 2rem 4rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
      <div style={{ marginBottom: '2rem', opacity: '0.7' }}>
        <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '20px', fontSize: '0.85rem', color: '#00d4ff', fontWeight: '500' }}>
          🚀 The future of trade business management
        </span>
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-1px', background: 'linear-gradient(135deg, #ffffff 0%, #c0e0ff 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Never Miss Another Job Again
      </h1>

      <p style={{ fontSize: '1.2rem', color: '#b8c5d6', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: '1.7', fontWeight: '400' }}>
        Trades Ai Operator answers every enquiry 24/7 in clear, natural British English – always using your exact business name and tone. Calm, professional and friendly, so no customer ever reaches voicemail again.
      </p>

      <button onClick={onSignupClick} style={{
        padding: '1rem 2.5rem',
        fontSize: '1rem',
        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(0,212,255,0.2)'
      }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>
        Get Started Free
      </button>
    </section>

    {/* Features Grid */}
    <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
      <h2 style={{ fontSize: '2.2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>What You Get</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {[
          { icon: '📊', title: 'Auto CRM', desc: 'Every interaction logged to Google Sheets automatically. Full audit trail. Zero manual data entry. Ever.' },
          { icon: '📅', title: 'Real Diary Booking', desc: 'Checks your actual Google Calendar. Confirms slots. Sends SMS. Zero double-bookings, zero chaos.' },
          { icon: '📸', title: 'AI Photo Quotes', desc: 'Customer sends a photo. Trade Operator AI returns a realistic UK price range instantly.' },
          { icon: '🚨', title: 'Emergency Protocol', desc: 'Gas leak? Flooding? Carbon monoxide. Safety first. Team alerted immediately. Handled properly every time.' }
        ].map((feature, idx) => (
          <div key={idx} style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.03) 100%)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,100,200,0.06) 100%)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.03) 100%)'; }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.8rem' }}>{feature.title}</h3>
            <p style={{ color: '#8b98ac', lineHeight: '1.6', fontSize: '0.95rem' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Messaging Section */}
    <section style={{ padding: '6rem 2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
      <div style={{
        padding: '3rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,100,200,0.05) 100%)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Maximise Your Revenue</h2>
        <p style={{ fontSize: '1.1rem', color: '#b8c5d6', lineHeight: '1.8', margin: '0' }}>
          Take deposits during the call, offer sensible upsells when it makes sense, and enjoy complete automatic logging of every lead, quote and booking. More money coming in with zero extra admin for you or your team.
        </p>
        <button onClick={onSignupClick} style={{
          marginTop: '2rem',
          padding: '0.9rem 2rem',
          fontSize: '1rem',
          background: 'rgba(0,212,255,0.15)',
          color: '#00d4ff',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }} onMouseEnter={(e) => { e.target.style.background = 'rgba(0,212,255,0.25)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(0,212,255,0.15)'; }}>
          Get your free test call & pricing →
        </button>
      </div>
    </section>

    {/* CTA Footer */}
    <section style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 5 }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Be First to Unlock Trades Ai Operator</h2>
      <p style={{ fontSize: '1.1rem', color: '#b8c5d6', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        Join the small group of UK trade businesses already securing their dedicated 24/7 AI receptionist.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#6b7a8f', marginBottom: '2rem' }}>
        UK-based • Secure • GDPR protected • © 2026 Trades Ai Operator
      </p>
      
      <button onClick={onSignupClick} style={{
        padding: '1rem 2.5rem',
        fontSize: '1rem',
        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(0,212,255,0.2)',
        marginBottom: '3rem'
      }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.3)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.2)'; }}>
        Get Started →
      </button>
    </section>
  </div>
);

// Premium Signup Form
const SignupForm = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    tradeType: 'Plumbing',
    password: ''
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '"Sohne", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.03) 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#fff'
        }}>
          Get Started Free
        </h2>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}>
          {[
            { name: 'businessName', placeholder: 'Business Name', type: 'text' },
            { name: 'email', placeholder: 'Email Address', type: 'email' },
            { name: 'phone', placeholder: 'Phone Number', type: 'tel' }
          ].map(field => (
            <input
              key={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.85rem',
                marginBottom: '1rem',
                borderRadius: '6px',
                border: '1px solid rgba(0,212,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          ))}

          <select
            value={formData.tradeType}
            onChange={(e) => setFormData({...formData, tradeType: e.target.value})}
            style={{
              width: '100%',
              padding: '0.85rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              border: '1px solid rgba(0,212,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '0.95rem',
              boxSizing: 'border-box'
            }}
          >
            {['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Building', 'Gas Engineer', 'Handyman', 'Carpentry', 'Painting', 'Other'].map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '0.85rem',
              marginBottom: '2rem',
              borderRadius: '6px',
              border: '1px solid rgba(0,212,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '0.95rem',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'transparent',
              color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

// Professional Dashboard
const Dashboard = ({ clientEmail, onLogout }) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f3f 100%)',
    color: '#fff',
    fontFamily: '"Sohne", -apple-system, BlinkMacSystemFont, sans-serif'
  }}>
    <header style={{
      background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.03) 100%)',
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Trades AI Operator Dashboard</h1>
      <button onClick={onLogout} style={{
        padding: '0.6rem 1.2rem',
        background: 'rgba(255,100,100,0.1)',
        color: '#ff6464',
        border: '1px solid rgba(255,100,100,0.3)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500'
      }}>
        Logout
      </button>
    </header>

    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <p style={{ color: '#8b98ac' }}>Welcome back, <strong>{clientEmail}</strong></p>
      <p style={{ color: '#6b7a8f' }}>Your 24/7 AI receptionist is live and answering calls.</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {[
          { icon: '📊', title: 'Interactions', value: '0', desc: 'Total calls answered' },
          { icon: '💰', title: 'Revenue', value: '£0', desc: 'Total deposits taken' },
          { icon: '📅', title: 'Bookings', value: '0', desc: 'Jobs scheduled' },
          { icon: '📸', title: 'Quotes', value: '0', desc: 'Photo quotes issued' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,100,200,0.03) 100%)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <p style={{ color: '#8b98ac', fontSize: '0.85rem', margin: 0 }}>{stat.title}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0.5rem 0 0 0' }}>{stat.value}</p>
            <p style={{ color: '#6b7a8f', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main App
export default function App() {
  const [page, setPage] = useState('landing');
  const [clientEmail, setClientEmail] = useState('');

  const handleSignup = (formData) => {
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

  if (page === 'landing') return <LandingPage onSignupClick={() => setPage('signup')} />;
  if (page === 'signup') return <SignupForm onSubmit={handleSignup} onBack={() => setPage('landing')} />;
  return <Dashboard clientEmail={clientEmail} onLogout={handleLogout} />;
}
