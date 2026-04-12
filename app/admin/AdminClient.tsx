'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  tradeType: string;
  contactName: string;
  phone: string;
  clientId: string;
  twilioNumber: string;
}

export default function AdminClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setClients(d.clients || []);
      })
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    !search ||
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.tradeType.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalShell role={user.role} name={user.name}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem' }}>All Clients</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>Pulled live from ClientConfig tab · {clients.length} total</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          style={{
            padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)',
            fontSize: '0.875rem', outline: 'none', width: '240px',
            background: '#fff', color: '#1A0A3C',
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: '12px', color: '#cc3333', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ height: '140px', borderRadius: '16px', background: 'rgba(0,0,0,0.06)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((client) => (
            <button
              key={client.clientId}
              onClick={() => router.push(`/admin/client/${client.clientId}`)}
              style={{
                background: '#fff', borderRadius: '16px', padding: '1.4rem',
                border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                display: 'block', width: '100%',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(201,168,76,0.15)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.06)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ color: '#1A0A3C', margin: '0 0 0.2rem', fontSize: '1rem', fontWeight: '700' }}>
                    {client.businessName || 'Unnamed Client'}
                  </h3>
                  <span style={{
                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px',
                    background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: '0.7rem', fontWeight: '600',
                  }}>
                    {client.tradeType || 'Trade'}
                  </span>
                </div>
                <span style={{ fontSize: '1.5rem' }}>→</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span style={{ color: '#aaa' }}>Contact: </span>{client.contactName || '—'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span style={{ color: '#aaa' }}>Phone: </span>{client.phone || '—'}
                </div>
                {client.twilioNumber && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    <span style={{ color: '#aaa' }}>AI Line: </span>{client.twilioNumber}
                  </div>
                )}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.75rem', color: '#aaa' }}>
                ID: {client.clientId}
              </div>
            </button>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#aaa' }}>
              No clients found
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
}
