'use client';
import { useEffect, useState } from 'react';

export interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (values: { required: boolean; dueDate: string; done: boolean }) => Promise<void>;
  initialRequired?: boolean;
  initialDueDate?: string;
  initialDone?: boolean;
}

export function FollowUpModal({
  isOpen,
  onClose,
  onConfirm,
  initialRequired = false,
  initialDueDate = '',
  initialDone = false,
}: FollowUpModalProps) {
  const [required, setRequired] = useState(initialRequired);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [done, setDone] = useState(initialDone);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRequired(initialRequired);
      setDueDate(initialDueDate);
      setDone(initialDone);
      setValidationError(null);
    }
  }, [isOpen, initialRequired, initialDueDate, initialDone]);

  if (!isOpen) return null;

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate())
    .toISOString().split('T')[0];

  const saveDisabled = submitting || (required && !dueDate);

  async function handleSubmit() {
    if (saveDisabled) return;
    if (required && !dueDate) {
      setValidationError('Due date required when follow-up is required');
      return;
    }
    if (dueDate) {
      const year = parseInt(dueDate.split('-')[0], 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < currentYear || year > currentYear + 5) {
        setValidationError('Due date must be between today and 5 years from now');
        return;
      }
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await onConfirm({ required, dueDate, done });
      onClose();
    } catch (e) {
      // Parent already showed toast — re-throw to keep modal open
      throw e;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={() => { if (!submitting) onClose(); }}
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
        aria-label="Follow-up"
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
          Follow-up
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {/* Required checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => { setRequired(e.target.checked); setValidationError(null); }}
              disabled={submitting}
              style={{ width: '15px', height: '15px', cursor: submitting ? 'not-allowed' : 'pointer', accentColor: 'var(--a1)' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', fontFamily: '"Inter",sans-serif' }}>
              Follow-up required
            </span>
          </label>

          {/* Due date */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: '"Inter",sans-serif' }}>
              Due date
            </div>
            <input
              type="date"
              value={dueDate}
              min={todayISO}
              max={maxDate}
              onChange={(e) => { setDueDate(e.target.value); setValidationError(null); }}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1px solid ${validationError ? '#C01830' : 'var(--divider, #E8E8EE)'}`,
                fontSize: '12px',
                color: 'var(--ink)',
                fontFamily: '"Inter", sans-serif',
                background: submitting ? '#FAFAFC' : '#fff',
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

          {/* Done checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
              disabled={submitting}
              style={{ width: '15px', height: '15px', cursor: submitting ? 'not-allowed' : 'pointer', accentColor: 'var(--a1)' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', fontFamily: '"Inter",sans-serif' }}>
              Mark as done
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { if (!submitting) onClose(); }}
            disabled={submitting}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid var(--divider)',
              background: '#fff',
              color: 'var(--ink)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: '"Inter", sans-serif',
              opacity: submitting ? 0.5 : 1,
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
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
