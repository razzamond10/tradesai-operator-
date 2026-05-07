'use client';
import { useRouter } from 'next/navigation';
import { buildInvoiceCreateUrl } from '@/lib/invoiceUrl';

export default function InvoiceButton({ booking }: { booking: { customerName?: string; phone?: string; postcode?: string; bookingId?: string } }) {
  const router = useRouter();
  return (
    <button
      title="Create invoice"
      onClick={e => { e.stopPropagation(); router.push(buildInvoiceCreateUrl({ customerName: booking.customerName, customerPhone: booking.phone, customerAddress: booking.postcode, bookingRef: booking.bookingId })); }}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', background: 'var(--a3b)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px', color: 'var(--a3)', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
      £
    </button>
  );
}
