'use client';
import { useState, useEffect } from 'react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SelectModalOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  options: SelectModalOption[];
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: (value: string) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SelectModal({
  isOpen,
  title,
  message,
  options,
  initialValue,
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
}: SelectModalProps) {
  const [selected, setSelected] = useState(initialValue ?? '');
  const [submitting, setSubmitting] = useState(false);

  // Sync initialValue when modal opens
  useEffect(() => {
    if (isOpen) setSelected(initialValue ?? '');
  }, [isOpen, initialValue]);

  // Esc key closes when not submitting
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const noChange = initialValue !== undefined
    ? selected === initialValue
    : selected === '';
  const saveDisabled = submitting || noChange;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleConfirm() {
    if (saveDisabled) return;
    setSubmitting(true);
    try {
      await onConfirm(selected);
      onClose();
    } catch {
      // Parent is responsible for showing the error toast.
      // Keep modal open so VA can retry.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={handleClose}
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
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Title */}
        <div style={{
          fontFamily: '"Inter Tight", sans-serif',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: message ? '8px' : '16px',
        }}>
          {title}
        </div>

        {/* Optional message */}
        {message && (
          <p style={{
            fontSize: '12px',
            color: 'var(--muted, #888)',
            lineHeight: 1.5,
            margin: '0 0 16px',
          }}>
            {message}
          </p>
        )}

        {/* Radio list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => !submitting && setSelected(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? 'var(--a1, #3D1FA8)' : 'var(--divider, #E8E8EE)'}`,
                  background: isSelected ? 'var(--a1b, #EDE8FF)' : '#fff',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'border-color .1s, background .1s',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {/* Radio dot */}
                <div style={{
                  marginTop: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--a1, #3D1FA8)' : 'var(--divider, #ccc)'}`,
                  background: isSelected ? 'var(--a1, #3D1FA8)' : '#fff',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {isSelected && (
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#fff',
                    }} />
                  )}
                </div>

                {/* Label + description */}
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--a1, #3D1FA8)' : 'var(--ink)',
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--muted, #888)',
                      marginTop: '2px',
                      lineHeight: 1.4,
                    }}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
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
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
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
            {submitting ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
