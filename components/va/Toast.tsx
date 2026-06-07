'use client';
import { useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToastState {
  msg: string;
  type: 'success' | 'error';
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return { toast, showToast };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ToastProps {
  toast: ToastState | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const bg = toast.type === 'error' ? '#C01830' : 'var(--ink)';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '10px 16px',
      background: bg,
      color: '#fff',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 1000,
      fontFamily: '"Inter", sans-serif',
      maxWidth: '320px',
    }}>
      {toast.msg}
    </div>
  );
}
