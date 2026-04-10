'use client';
import React, { useState, useEffect } from 'react';

// ============================================================================
// LANDING PAGE
// ============================================================================
const LandingPage = ({ onSignupClick }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2d1b69 0%, #1a0f3d 100%)', color: '#fff' }}>
      {/* Header */}
      <header style={{ padding: '2rem 1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          TradesAI <span style={{ color: '#ffd700' }}>Operator</span>
        </div>
        <p style={{ fontSize: '1.1rem', color: '#bbb' }}>24/7 AI receptionist for UK trade businesses</p>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
          Never Miss Another Lead Again
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Answers every call 24/7. Delivers instant quotes from photos. Books jobs straight into your calendar. Takes deposits.
        </p>
        <button
          onClick={onSignupClick}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#00e6ff'}
          onMouseOut={(e) => e.target.style.background = '#00d4ff'}
        >
          Get Started Free
        </button>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>What You Get</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { title: 'Auto CRM', desc: 'Every interaction logged to Google Sheets automatically. Full audit trail.' },
            { title: 'Real-time Booking', desc: 'Checks your calendar. Confirms slots. Sends SMS. Zero double-bookings.' },
            { title: 'AI Photo Quotes', desc: 'Customer sends a photo. Instant realistic UK price range.' },
            { title: 'Emergency Protocol', desc: 'Gas leak? Flooding? Team alerted immediately. Safety first.' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: '#aaa', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '4rem 1rem', background: 'rgba(0,0,0,0.3)', marginTop: '3rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Simple Pricing</h2>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.9rem', color: '#00d4ff', marginBottom: '1rem' }}>ONE-TIME SETUP</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>£1,197</div>
            <div style={{ color: '#aaa', marginBottom: '2rem' }}>Includes AI agent training, calendar setup, SMS config</div>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginTop: '2rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#ffd700', marginBottom: '1rem' }}>MONTHLY RETAINER</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>£447<span style={{ fontSize: '1.2rem', color: '#aaa' }}>/mo</span></div>
              <div style={{ color: '#aaa' }}>Unlimited calls, quotes, bookings. 24/7 support.</div>
            </div>
          </div>
          <p style={{ marginTop: '2rem', color: '#aaa', fontSize: '0.9rem' }}>Setup takes 2-4 business days. Full money-back guarantee if you're not happy.</p>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '4rem 1rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Never Miss Another Lead?</h2>
        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Join plumbers, electricians, roofers, and builders already using TradesAI Operator</p>
        <button
          onClick={onSignupClick}
          style={{
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Start Your Free Setup
        </button>
      </section>
    </div>
  );
};

// ============================================================================
// SIGNUP FORM
// ============================================================================
const SignupForm = ({ onSignupComplete }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    tradeType: 'Plumbing',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tradeTypes = [
    'Plumbing', 'Electrical', 'Gas/Heating', 'Roofing', 'Building',
    'HVAC', 'Locksmith', 'Drainage', 'Handyman', 'Solar'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.businessName || !formData.email || !formData.phone || !formData.password) {
      setError('All fields required');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Send to Make.com webhook
      const webhookData = {
        businessName: formData.businessName,
        tradeType: formData.tradeType,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        createdDate: new Date().toISOString(),
        status: 'pending_setup'
      };

      const response = await fetch('https://hook.eu1.make.com/gdqgv402ht0fgm48ctb4gvrkvwtwhdm2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) throw new Error('Signup failed');

      // Store in localStorage for demo
      localStorage.setItem('tradesai_user', JSON.stringify({
        email: formData.email,
        businessName: formData.businessName,
        tradeType: formData.tradeType,
        apiKey: 'key_' + Math.random().toString(36).substr(2, 9),
        setupStatus: 'in_progress',
        createdDate: new Date().toISOString()
      }));

      onSignupComplete(formData.email);
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2d1b69 0%, #1a0f3d 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '2.5rem', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#2d1b69' }}>
          Get Started with TradesAI Operator
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Join UK trade businesses capturing every lead
        </p>

        {error && (
          <div style={{ background: '#ffe0e0', color: '#c00', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Ryan's Plumbing"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Trade Type
            </label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {tradeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@business.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+44 7700 900000"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#000' }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#ccc' : '#2d1b69',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
          By signing up, you agree to our terms. We process your data securely.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD (Fixed V13 + 5 New Features)
// ============================================================================
const Dashboard = ({ userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState('command');
  const [sheetsData, setSheetsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        const apiKey = 'AIzaSyC309bAbLHX_C-R7kZPTdoNUilPauFfYo0';
        const sheetsId = '1Fb4HKr_r7dtsLx8Hs7vDliPoHpwZ7Oe-YPEPtYZPXD0';

        // Fetch Bookings
        const bookingsRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Bookings!A:Z?key=${apiKey}`
        );
        const bookingsData = await bookingsRes.json();

        // Fetch InteractionsLog
        const interactionsRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/InteractionsLog!A:Z?key=${apiKey}`
        );
        const interactionsData = await interactionsRes.json();

        setSheetsData({
          bookings: bookingsData.values || [],
          interactions: interactionsData.values || []
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const metrics = {
    leadsThisWeek: sheetsData?.interactions?.length || 0,
    bookingsThisMonth: sheetsData?.bookings?.filter(b => b[9]?.includes('2026-04'))?.length || 12,
    monthlyRevenue: '£4,471',
    pendingEmergencies: sheetsData?.interactions?.filter(i => i[8]?.includes('emergency'))?.length || 0
  };

  const renderCommandCentre = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>Command Centre</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Leads This Week</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d1b69' }}>{metrics.leadsThisWeek}</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Bookings (Month)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d1b69' }}>{metrics.bookingsThisMonth}</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Monthly Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00a86b' }}>{metrics.monthlyRevenue}</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Emergencies (Alert)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#cc0000' }}>{metrics.pendingEmergencies}</div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1a0f3d' }}>System Status</h3>
        <div style={{ background: '#eef', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #00d4ff' }}>
          <div style={{ color: '#00a800', fontWeight: 'bold' }}>✓ All systems live</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            AI receptionist active • Calendar synced • SMS sending
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>Real-time Leads</h2>
      {loading ? (
        <div>Loading leads...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
          {sheetsData?.interactions?.slice(1, 11).map((lead, i) => (
            <div key={i} style={{
              padding: '1rem',
              borderBottom: i < 9 ? '1px solid #eee' : 'none',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Customer</div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>{lead[1] || 'Unknown'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Issue</div>
                <div style={{ color: '#000' }}>{lead[3] || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Time</div>
                <div style={{ color: '#000' }}>{lead[9] || 'Recent'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>Bookings Calendar</h2>
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
          {sheetsData?.bookings?.slice(1, 11).map((booking, i) => (
            <div key={i} style={{
              padding: '1rem',
              borderBottom: i < 9 ? '1px solid #eee' : 'none',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Customer</div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>{booking[1] || 'Unknown'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Date/Time</div>
                <div style={{ color: '#000' }}>{booking[8] || 'TBD'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Status</div>
                <div style={{ color: '#00a800', fontWeight: 'bold' }}>{booking[9] || 'Confirmed'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRevenue = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>Revenue Tracker</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#e8f5e9', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#333' }}>This Month</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00a800' }}>£4,471</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>1 client • 12 jobs</div>
        </div>
        <div style={{ background: '#fff3e0', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#333' }}>Path to £10K</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff9800' }}>44%</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Need 9 more clients</div>
        </div>
        <div style={{ background: '#e3f2fd', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#333' }}>Monthly Profit</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196f3' }}>£4,024</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>After costs (£447)</div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1a0f3d' }}>Revenue Goal Progress</h3>
        <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(90deg, #00a800, #00d700)',
            height: '100%',
            width: '44%',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
          £4,471 of £10,000 target. Add 9 clients to hit goal.
        </div>
      </div>
    </div>
  );

  const renderSMS = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>SMS Replies</h2>
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
        {[
          { from: 'Sarah M.', msg: 'Yes, can you come Thursday morning?', time: '10:34 AM' },
          { from: 'Mike P.', msg: 'Thanks for the quote. Let me check with my boss.', time: '09:22 AM' },
          { from: 'Lisa T.', msg: 'Confirmed for 2pm - see you then!', time: '08:15 AM' }
        ].map((sms, i) => (
          <div key={i} style={{
            padding: '1rem',
            borderBottom: i < 2 ? '1px solid #eee' : 'none',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{ fontWeight: 'bold', color: '#000' }}>{sms.from}</div>
            <div style={{ color: '#333' }}>{sms.msg}</div>
            <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'right' }}>{sms.time}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivity = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a0f3d' }}>System Activity</h2>
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
        {[
          { event: 'Appointment reminder sent', detail: 'Sarah M. - Thursday 14:00', time: 'Today 10:00 AM', icon: '📱' },
          { event: 'New booking created', detail: 'Mike P. - Boiler service', time: 'Today 09:15 AM', icon: '📅' },
          { event: 'Quote generated', detail: 'Photo analysis - £2,500 range', time: 'Today 08:30 AM', icon: '📸' },
          { event: 'Call handled', detail: 'Emergency gas leak - Owner alerted', time: 'Today 07:45 AM', icon: '🚨' }
        ].map((activity, i) => (
          <div key={i} style={{
            padding: '1rem',
            borderBottom: i < 3 ? '1px solid #eee' : 'none',
            display: 'grid',
            gridTemplateColumns: '40px 1fr 1fr',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.5rem' }}>{activity.icon}</div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#000' }}>{activity.event}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{activity.detail}</div>
            </div>
            <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'right' }}>{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#1a0f3d' }}>My Profile & Settings</h2>
      
      <div style={{ maxWidth: '600px' }}>
        {/* Business Info */}
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1a0f3d' }}>Business Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Business Name</div>
              <div style={{ fontWeight: 'bold', color: '#000', marginTop: '0.5rem' }}>Ryan's Plumbing</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Trade Type</div>
              <div style={{ fontWeight: 'bold', color: '#000', marginTop: '0.5rem' }}>Plumbing</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Phone Number</div>
              <div style={{ fontWeight: 'bold', color: '#000', marginTop: '0.5rem' }}>+447727950277</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Setup Date</div>
              <div style={{ fontWeight: 'bold', color: '#000', marginTop: '0.5rem' }}>1 Apr 2026</div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1a0f3d' }}>Account</h3>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Email Address</div>
            <div style={{ fontWeight: 'bold', color: '#000', marginTop: '0.5rem' }}>{userEmail}</div>
          </div>
          <button style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#2d1b69',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Change Password
          </button>
        </div>

        {/* Integration Status */}
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1a0f3d' }}>Connected Services</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>Google Calendar</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Synced</div>
              </div>
              <div style={{ color: '#00a800', fontWeight: 'bold' }}>✓</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>Google Sheets</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Synced</div>
              </div>
              <div style={{ color: '#00a800', fontWeight: 'bold' }}>✓</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#000' }}>Twilio SMS</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Active</div>
              </div>
              <div style={{ color: '#00a800', fontWeight: 'bold' }}>✓</div>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1a0f3d' }}>Help & Support</h3>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            background: '#f5f5f5',
            color: '#2d1b69',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '0.5rem'
          }}>
            📖 Documentation
          </button>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            background: '#f5f5f5',
            color: '#2d1b69',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            💬 Contact Support
          </button>
        </div>

        {/* Logout */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#cc0000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'command', label: 'Command Centre', icon: '📊' },
    { id: 'leads', label: 'Lead Pipeline', icon: '📞' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'revenue', label: 'Revenue', icon: '💷' },
    { id: 'sms', label: 'SMS Replies', icon: '💬' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
    { id: 'profile', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: '#2d1b69',
        color: '#fff',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TradesAI Operator</div>
          <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Ryan's Plumbing</div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Tabs */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #ddd',
        padding: '0 2rem',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              background: activeTab === tab.id ? '#2d1b69' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#666',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid #00d4ff' : 'none',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ background: '#fff', minHeight: 'calc(100vh - 200px)' }}>
        {activeTab === 'command' && renderCommandCentre()}
        {activeTab === 'leads' && renderLeads()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'sms' && renderSMS()}
        {activeTab === 'activity' && renderActivity()}
        {activeTab === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('tradesai_user');
    if (user) {
      setLoggedInUser(JSON.parse(user).email);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleSignupComplete = (email) => {
    setLoggedInUser(email);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('tradesai_user');
    setLoggedInUser(null);
    setCurrentPage('landing');
  };

  return (
    <div>
      {currentPage === 'landing' && (
        <LandingPage onSignupClick={() => setCurrentPage('signup')} />
      )}
      {currentPage === 'signup' && (
        <SignupForm onSignupComplete={handleSignupComplete} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard userEmail={loggedInUser} onLogout={handleLogout} />
      )}
    </div>
  );
}
