export function buildInvoiceCreateUrl(params: {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  bookingRef?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.customerName) qs.set('customerName', params.customerName);
  if (params.customerPhone) qs.set('customerPhone', params.customerPhone);
  if (params.customerAddress) qs.set('customerAddress', params.customerAddress);
  if (params.bookingRef) qs.set('bookingRef', params.bookingRef);
  const query = qs.toString();
  return query ? `/dashboard/invoices/new?${query}` : '/dashboard/invoices/new';
}