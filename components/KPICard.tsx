interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent?: string;
}

export default function KPICard({ label, value, sub, icon, accent = '#C9A84C' }: KPICardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            {label}
          </p>
          <p style={{ color: '#1A0A3C', fontSize: '2rem', fontWeight: '800', margin: '0', lineHeight: 1, letterSpacing: '-1px' }}>
            {value}
          </p>
          {sub && (
            <p style={{ color: '#aaa', fontSize: '0.75rem', margin: '0.35rem 0 0' }}>{sub}</p>
          )}
        </div>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `rgba(201,168,76,0.1)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem',
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
