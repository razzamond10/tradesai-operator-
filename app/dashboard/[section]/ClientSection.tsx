'use client';
import { useEffect, useState } from 'react';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';
import DateRangeFilter, { useDateRange } from '@/components/DateRangeFilter';
import {
  AnalyticsSection,
  ScheduleSection,
  PipelineSection,
  EmergenciesSection,
  CommsSection,
  RevenueSection,
  ForecastSection,
  ReviewsSection,
  JobScheduleSection,
  LeadPipelineSection,
  CommunicationsSection,
  ConfigurationSection,
  BookingsSection,
  SECTION_META,
} from '@/app/admin/clients/[id]/[section]/AdminClientSection';
import type { JWTPayload } from '@/lib/auth';

const SECTIONS_WITH_DATE_FILTER = new Set(['analytics', 'revenue', 'forecast', 'forecasting', 'job-schedule', 'communications']);

export default function ClientSection({
  section,
  user,
  isDemoEmpty = false,
}: {
  section: string;
  user: JWTPayload;
  isDemoEmpty?: boolean;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageRange, setPageRange] = useDateRange('month');

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const interactions: any[] = isDemoEmpty ? [] : (data?.interactions || []);
  const bookings: any[]     = isDemoEmpty ? [] : (data?.bookings || []);
  const emergencies: any[]  = isDemoEmpty ? [] : (data?.emergencies || []);
  const config = data?.config || null;
  const businessName: string = config?.businessName || 'client';
  const clientId: string = user.clientId || '';

  const meta = SECTION_META[section] || { label: section, sub: '' };

  function renderSection() {
    if (loading) return (
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
      </div>
    );
    if (error) return (
      <div style={{ padding: '16px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px' }}>⚠ {error}</div>
    );
    switch (section) {
      case 'analytics':      return <AnalyticsSection interactions={interactions} bookings={bookings} pageRange={pageRange} />;
      case 'schedule':       return <ScheduleSection bookings={bookings} />;
      case 'pipeline':       return <PipelineSection interactions={interactions} bookings={bookings} />;
      case 'emergencies':    return <EmergenciesSection emergencies={emergencies} clientId={clientId} businessName={businessName} isClientView />;
      case 'comms':          return <CommsSection interactions={interactions} />;
      case 'revenue':        return <RevenueSection bookings={bookings} businessName={businessName} pageRange={pageRange} />;
      case 'forecast':
      case 'forecasting':    return <ForecastSection interactions={interactions} bookings={bookings} pageRange={pageRange} />;
      case 'reviews':        return <ReviewsSection interactions={interactions} />;
      case 'job-schedule':   return <JobScheduleSection bookings={bookings} pageRange={pageRange} />;
      case 'lead-pipeline':  return <LeadPipelineSection interactions={interactions} bookings={bookings} />;
      case 'communications': return <CommunicationsSection interactions={interactions} businessName={businessName} pageRange={pageRange} />;
      case 'configuration':  return <ConfigurationSection config={config} isClientView />;
      case 'bookings':       return <BookingsSection bookings={bookings} businessName={businessName} />;
      default:               return null;
    }
  }

  return (
    <ClientShell
      businessName={config?.businessName}
      tradeType={config?.tradeType}
      userName={user.name}
    >
      <Topbar
        breadcrumb={config?.businessName || 'My Business'}
        page={meta.label}
        sub={meta.sub}
      />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        {SECTIONS_WITH_DATE_FILTER.has(section) && !loading && !error && (
          <DateRangeFilter value={pageRange} onChange={setPageRange} />
        )}
        {renderSection()}
        <style>{`
          @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
          @media (max-width: 768px) {
            .sched-table-wrap { display: none !important; }
            .sched-cards-wrap { display: block !important; }
            .comms-table-wrap { display: none !important; }
            .comms-cards-wrap { display: block !important; }
            .rev-table-wrap { display: none !important; }
            .rev-cards-wrap { display: block !important; }
            .lead-table-wrap { display: none !important; }
            .lead-cards-wrap { display: block !important; }
          }
        `}</style>
      </div>
    </ClientShell>
  );
}
