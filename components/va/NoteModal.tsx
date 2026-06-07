'use client';
import { useState } from 'react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface NoteModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  maxLength?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NoteModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  maxLength = 2000,
}: NoteModalProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const trimmed = text.trim();
  const overLimit = text.length > maxLength;
  const saveDisabled = submitting || !trimmed || overLimit;

  async function handleSubmit() {
    if (saveDisabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText('');
      onClose();
    } catch {
      // Parent is responsible for showing the error toast.
      // Keep modal open with text intact so VA can retry.
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setText('');
    onClose();
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
          maxWidth: '480px',
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
          marginBottom: '16px',
        }}>
          {title}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
          placeholder="Type your note here…"
          rows={5}
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

        {/* Char counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          fontSize: '10px',
          fontWeight: 600,
          color: overLimit ? '#C01830' : 'var(--muted, #888)',
          marginTop: '4px',
          marginBottom: '16px',
          fontFamily: '"IBM Plex Mono", monospace',
        }}>
          {text.length} / {maxLength}
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
