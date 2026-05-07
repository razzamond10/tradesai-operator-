export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withTierGuard } from '@/lib/apiAuth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoiceById } from '@/lib/invoices';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page:      { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1F2937' },
  header:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#3D1FA8' },
  invId:     { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1F2937', marginBottom: 4 },
  badge:     { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', padding: '3 8', borderRadius: 4 },
  section:   { marginBottom: 16 },
  sectionHdr:{ fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#6B7280', letterSpacing: 0.8, marginBottom: 6 },
  row:       { flexDirection: 'row', marginBottom: 3 },
  label:     { width: 90, color: '#6B7280' },
  value:     { flex: 1, color: '#1F2937' },
  tableHdr:  { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: '6 8', borderRadius: 4, marginBottom: 2 },
  tableRow:  { flexDirection: 'row', padding: '7 8', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  col1:      { flex: 3 },
  col2:      { flex: 1, textAlign: 'right' },
  col3:      { flex: 1, textAlign: 'right' },
  col4:      { flex: 1, textAlign: 'right' },
  totalsBox: { marginTop: 12, alignItems: 'flex-end' },
  totalRow:  { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 4 },
  divider:   { width: 200, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB', marginVertical: 4 },
  grandTotal:{ fontSize: 14, fontFamily: 'Helvetica-Bold' },
  notes:     { marginTop: 24, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 },
  footer:    { position: 'absolute', bottom: 28, left: 40, right: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 8 },
});

function fmt(n: number) { return `£${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` }

const STATUS_LABEL: Record<string, string> = { draft: 'DRAFT', sent: 'SENT', paid: 'PAID', overdue: 'OVERDUE' };
const STATUS_COLOR: Record<string, string> = { draft: '#6B7280', sent: '#2563EB', paid: '#16A34A', overdue: '#DC2626' };

export const GET = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const id = req.nextUrl.pathname.split('/').slice(-2)[0];
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return Response.json({ error: 'Not found' }, { status: 404 });

  const invoice = await getInvoiceById(config.sheetId, id);
  if (!invoice) return Response.json({ error: 'Not found' }, { status: 404 });

  const statusColor = STATUS_COLOR[invoice.status] ?? '#6B7280';

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{config.businessName}</Text>
            {config.phone && <Text style={{ color: '#6B7280', marginTop: 4 }}>{config.phone}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invId}>{invoice.invoiceId}</Text>
            <Text style={{ ...styles.badge, color: statusColor }}>{STATUS_LABEL[invoice.status] ?? invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Customer & Dates */}
        <View style={[styles.section, { flexDirection: 'row', gap: 32 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionHdr}>Bill To</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{invoice.customerName}</Text>
            {invoice.customerPhone ? <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{invoice.customerPhone}</Text></View> : null}
            {invoice.customerAddress ? <View style={styles.row}><Text style={styles.label}>Address</Text><Text style={styles.value}>{invoice.customerAddress}</Text></View> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionHdr}>Dates</Text>
            <View style={styles.row}><Text style={styles.label}>Issue Date</Text><Text style={styles.value}>{invoice.issueDate}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Due Date</Text><Text style={{ ...styles.value, color: invoice.status === 'overdue' ? '#DC2626' : '#1F2937', fontFamily: invoice.status === 'overdue' ? 'Helvetica-Bold' : 'Helvetica' }}>{invoice.dueDate}</Text></View>
            {invoice.paidAt ? <View style={styles.row}><Text style={styles.label}>Paid</Text><Text style={{ ...styles.value, color: '#16A34A', fontFamily: 'Helvetica-Bold' }}>{invoice.paidAt.slice(0, 10)}</Text></View> : null}
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.section}>
          <View style={styles.tableHdr}>
            <Text style={[styles.col1, { fontFamily: 'Helvetica-Bold', color: '#6B7280' }]}>Description</Text>
            <Text style={[styles.col2, { fontFamily: 'Helvetica-Bold', color: '#6B7280' }]}>Qty</Text>
            <Text style={[styles.col3, { fontFamily: 'Helvetica-Bold', color: '#6B7280' }]}>Unit Price</Text>
            <Text style={[styles.col4, { fontFamily: 'Helvetica-Bold', color: '#6B7280' }]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.col4, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.quantity * item.unitPrice)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#6B7280' }}>Subtotal</Text>
              <Text>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.vatAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#6B7280' }}>VAT ({invoice.vatRate}%)</Text>
                <Text>{fmt(invoice.vatAmount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotal}>Total</Text>
              <Text style={styles.grandTotal}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.sectionHdr}>Notes</Text>
            <Text style={{ color: '#374151' }}>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Generated by TradesAI Operator · {new Date().toLocaleDateString('en-GB')}</Text>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);

  // Node Buffer → ArrayBuffer slice so BodyInit types accept it
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceId}.pdf"`,
    },
  });
});
