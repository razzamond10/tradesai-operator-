interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent?: string;
}

// Matches V13 .kc style
export default function KPICard({ label, value, sub, icon, accent = '#3D1FA8' }: KPICardProps) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #D8D0F0', borderRadius: '10px',
      padding: '14px 16px 12px', boxShadow: '0 2px 8px rgba(26,10,60,0.10),0 1px 2px rgba(26,10,60,0.05)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent, borderRadius: '10px 10px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: `${accent}18` }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '9px', fontWeight: 700, color: '#7468A0', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '30px', fontWeight: 900, color: '#1A0A3C', lineHeight: 1, letterSpacing: '-1.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', color: '#7468A0', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
