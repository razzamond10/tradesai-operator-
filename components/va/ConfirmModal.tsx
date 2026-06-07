'use client';
import { useState, useEffect } from 'react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  optionalReason?: { label: string; placeholder?: string; maxLength?: number };
  onReasonChange?: (text: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onClose,
  onConfirm,
  optionalReason,
  onReasonChange,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const maxLen = optionalReason?.maxLength ?? 500;
  const overLimit = reason.length > maxLen;
  const confirmDisabled = submitting || overLimit;

  function handleReasonChange(text: string) {
    setReason(text);
    onReasonChange?.(text);
  }

  async function handleConfirm() {
    if (confirmDisabled) return;
    setSubmitting(true);
    try {
      await onConfirm();
      setReason('');
      onClose();
    } catch {
      // Parent is responsible for showing the error toast.
      // Keep modal open so VA can retry.
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setReason('');
    onClose();
  }

  const confirmBg = destructive ? '#C01830' : 'var(--a1, #3D1FA8)';

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
          marginBottom: '8px',
        }}>
          {title}
        </div>

        {/* Message */}
        <p style={{
          fontSize: '12px',
          color: 'var(--muted, #888)',
          lineHeight: 1.5,
          margin: '0 0 20px',
        }}>
          {message}
        </p>

        {/* Optional reason textarea */}
        {optionalReason && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--muted, #888)',
              letterSpacing: '.6px',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              {optionalReason.label}
            </label>
            <textarea
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              disabled={submitting}
              placeholder={optionalReason.placeholder ?? ''}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${overLimit ? '#C01830' : 'var(--divider, #E8E8EE)'}`,
                fontSize: '13px',
                color: 'var(--ink)',
                fontFamily: '"Inter", sans-serif',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                background: submitting ? '#FAFAFC' : '#fff',
                lineHeight: 1.5,
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: '10px',
              fontWeight: 600,
              color: overLimit ? '#C01830' : 'var(--muted, #888)',
              marginTop: '4px',
              fontFamily: '"IBM Plex Mono", monospace',
            }}>
              {reason.length} / {maxLen}
            </div>
          </div>
        )}

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
            disabled={confirmDisabled}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '7px 18px',
              borderRadius: '6px',
              border: 'none',
              background: confirmBg,
              color: '#fff',
              cursor: confirmDisabled ? 'not-allowed' : 'pointer',
              fontFamily: '"Inter", sans-serif',
              opacity: confirmDisabled ? 0.4 : 1,
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
