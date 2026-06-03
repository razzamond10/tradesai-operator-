'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// Idle timeout: 60 min total, warning at 58 min (2 min before logout).
const IDLE_TIMEOUT_MS = 90 * 1000;        // 90s TEMP for S77 live test
const WARNING_BEFORE_MS = 30 * 1000;      // 30s warning TEMP for S77 live test
const TIME_TO_WARNING_MS = IDLE_TIMEOUT_MS - WARNING_BEFORE_MS;

export default function IdleTimer() {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const doLogout = useCallback(async () => {
    clearAllTimers();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore — proceed to redirect regardless
    }
    window.location.href = '/login?reason=idle';
  }, [clearAllTimers]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(120);
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((c) => Math.max(0, c - 1));
      }, 1000);
      logoutTimerRef.current = setTimeout(() => {
        doLogout();
      }, WARNING_BEFORE_MS);
    }, TIME_TO_WARNING_MS);
  }, [clearAllTimers, doLogout]);

  const handleStayLoggedIn = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const onActivity = () => {
      if (!showWarning) startTimers();
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    startTimers();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearAllTimers();
    };
  }, [showWarning, startTimers, clearAllTimers]);

  if (!showWarning) return null;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,10,60,0.55)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter Tight","Inter",sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '28px 32px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 8px 40px rgba(26,10,60,0.25)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏰</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A0A3C', margin: '0 0 8px' }}>
          Still there?
        </h2>
        <p style={{ fontSize: '14px', color: '#54416F', margin: '0 0 6px', lineHeight: 1.5 }}>
          You've been inactive for a while. For your security, we'll log you out automatically in:
        </p>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#D32F2F',
            fontFamily: '"Inter Tight",sans-serif',
            margin: '12px 0 16px',
            letterSpacing: '0.5px',
          }}
        >
          {timeStr}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleStayLoggedIn}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#1A0A3C',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontFamily: '"Inter",sans-serif',
            }}
          >
            Stay logged in
          </button>
          <button
            onClick={doLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#fff',
              color: '#54416F',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid #D8D0F0',
              cursor: 'pointer',
              fontFamily: '"Inter",sans-serif',
            }}
          >
            Log out now
          </button>
        </div>
      </div>
    </div>
  );
}
