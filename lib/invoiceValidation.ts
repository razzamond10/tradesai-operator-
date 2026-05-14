// Shared length validation for invoice POST + PUT routes.
// Defence-in-depth pairing with cleanForSheets write protection (S66+).
// Returns null when valid, or { error: string } on first violation.

export const INVOICE_LIMITS = {
  customerName: 200,
  customerPhone: 20,
  customerAddress: 500,
  bookingRef: 50,
  lineItemDescription: 500,
  notes: 2000,
  maxLineItems: 100,
} as const;

type ValidationError = { error: string };

function tooLong(field: string, value: unknown, max: number): ValidationError | null {
  if (typeof value !== 'string') return null;
  if (value.length > max) return { error: `${field} exceeds max length ${max}` };
  return null;
}

export function validateInvoiceLengths(body: any): ValidationError | null {
  const checks: Array<[string, unknown, number]> = [
    ['customerName', body?.customerName, INVOICE_LIMITS.customerName],
    ['customerPhone', body?.customerPhone, INVOICE_LIMITS.customerPhone],
    ['customerAddress', body?.customerAddress, INVOICE_LIMITS.customerAddress],
    ['bookingRef', body?.bookingRef, INVOICE_LIMITS.bookingRef],
    ['notes', body?.notes, INVOICE_LIMITS.notes],
  ];
  for (const [name, val, max] of checks) {
    const err = tooLong(name, val, max);
    if (err) return err;
  }
  if (Array.isArray(body?.lineItems)) {
    if (body.lineItems.length > INVOICE_LIMITS.maxLineItems) {
      return { error: `lineItems exceeds max count ${INVOICE_LIMITS.maxLineItems}` };
    }
    for (let i = 0; i < body.lineItems.length; i++) {
      const item = body.lineItems[i];
      const err = tooLong(`lineItems[${i}].description`, item?.description, INVOICE_LIMITS.lineItemDescription);
      if (err) return err;
    }
  }
  return null;
}
