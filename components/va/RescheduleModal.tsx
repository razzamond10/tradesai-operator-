'use client';
import { useEffect, useState } from 'react';

export interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { newStart: string; newEnd: string; reason: string }) => Promise<void>;
  bookingTitle?: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  onSubmit,
  bookingTitle,
}: RescheduleModalProps) {
  const [newDateTime, setNewDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewDateTime('');
      setReason('');
      setIsSubmitting(false);
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);
  const maxDateTime = new Date(
    now.getFullYear() + 5,
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  ).toISOString().slice(0, 16);

  const saveDisabled = !newDateTime || isSubmitting;

  async function handleSubmit() {
    if (saveDisabled) return;

    const currentYear = new Date().getFullYear();
    const year = parseInt(newDateTime.split('T')[0].split('-')[0], 10);
    if (isNaN(year) || year < currentYear || year > currentYear + 5) {
      setValidationError('Date must be between now and 5 years from today');
      return;
    }

    const parsed = new Date(newDateTime);
    if (parsed <= new Date()) {
      setValidationError('Cannot reschedule to past');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    const newStart = parsed.toISOString();
    const newEnd = new Date(parsed.getTime() + 60 * 60 * 1000).toISOString();
    try {
      await onSubmit({ newStart, newEnd, reason });
      onClose();
    } catch (e) {
      // Parent shows toast — re-throw to keep modal open per Rule 128
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      onClick={() => { if (!isSubmitting) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reschedule booking"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          fontFamily: '"Inter Tight", sans-serif',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '20px',
        }}>
          Reschedule booking{bookingTitle ? ` — ${bookingTitle}` : ''}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {/* New date & time */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: '"Inter",sans-serif' }}>
              New date &amp; time
            </div>
            <input
              type="datetime-local"
              value={newDateTime}
              min={minDateTime}
              max={maxDateTime}
              onChange={(e) => { setNewDateTime(e.target.value); setValidationError(null); }}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1px solid ${validationError ? '#C01830' : 'var(--divider, #E8E8EE)'}`,
                fontSize: '12px',
                color: 'var(--ink)',
                fontFamily: '"Inter", sans-serif',
                background: isSubmitting ? '#FAFAFC' : '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {validationError && (
              <div style={{ fontSize: '10px', color: '#C01830', fontWeight: 600, marginTop: '4px', fontFamily: '"Inter",sans-serif' }}>
                {validationError}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: '"Inter",sans-serif' }}>
              Reason (optional)
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. customer requested later slot"
              maxLength={500}
              disabled={isSubmitting}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid var(--divider, #E8E8EE)',
                fontSize: '12px',
                color: 'var(--ink)',
                fontFamily: '"Inter", sans-serif',
                background: isSubmitting ? '#FAFAFC' : '#fff',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { if (!isSubmitting) onClose(); }}
            disabled={isSubmitting}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid var(--divider)',
              background: '#fff',
              color: 'var(--ink)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: '"Inter", sans-serif',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveDisabled}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '7px 18px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--a1, #3D1FA8)',
              color: '#fff',
              cursor: saveDisabled ? 'not-allowed' : 'pointer',
              fontFamily: '"Inter", sans-serif',
              opacity: saveDisabled ? 0.4 : 1,
              transition: 'opacity .15s',
            }}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
