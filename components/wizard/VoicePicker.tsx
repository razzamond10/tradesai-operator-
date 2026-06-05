'use client';
import { useRef, useState, useEffect } from 'react';

// ── Voice data ────────────────────────────────────────────────────────────────
// NOTE: Retell voice_id is intentionally NOT stored here.
// key → voice_id mapping happens at Phase B provisioning.

export const VOICES = [
  { key: 'chloe',     label: 'Chloe' },
  { key: 'casey',     label: 'Casey' },
  { key: 'juliet',    label: 'Juliet' },
  { key: 'natalie',   label: 'Natalie' },
  { key: 'sebastian', label: 'Sebastian' },
  { key: 'sterling',  label: 'Sterling' },
] as const;

// Mutable shape used in props / answers
export interface VoiceOption {
  key: string;
  label: string;
}

export const DEFAULT_VOICE: VoiceOption = { key: 'chloe', label: 'Chloe' };

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  value: VoiceOption;
  onChange: (v: VoiceOption) => void;
}

export default function VoicePicker({ value, onChange }: Props) {
  // Single shared Audio instance — only one voice ever plays at a time.
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  // Pause + release on unmount (navigating away from Step 1).
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }

  function handlePlayPause(voiceKey: string, e: React.MouseEvent) {
    e.stopPropagation(); // do NOT also select the card

    const audio = getAudio();

    // Toggle off if already playing this voice
    if (playingKey === voiceKey) {
      audio.pause();
      setPlayingKey(null);
      return;
    }

    // Stop whatever was playing
    audio.pause();

    audio.src = `/voices/${voiceKey}.mp3`;
    audio.currentTime = 0;
    audio.onended = () => setPlayingKey(null);

    audio.play().catch(() => setPlayingKey(null));
    setPlayingKey(voiceKey);
  }

  return (
    <div>
      {/* Section heading — matches SectionHeading style used across Step4/Step5 */}
      <div style={{
        fontFamily: '"Inter Tight", sans-serif',
        fontSize: '13px', fontWeight: 700,
        color: 'var(--ink, #1A1A2E)',
        marginBottom: '12px', paddingBottom: '10px',
        borderBottom: '1px solid var(--divider, #E8E8EE)',
      }}>
        Choose your AI receptionist's voice
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
      }}>
        {VOICES.map((voice) => {
          const selected  = value.key === voice.key;
          const isPlaying = playingKey === voice.key;

          return (
            <div
              key={voice.key}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => onChange(voice)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(voice); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${selected ? 'rgba(61,31,168,0.3)' : 'var(--divider, #E8E8EE)'}`,
                background: selected ? 'var(--a1b, #EDE8FF)' : '#FAFAFC',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all .15s',
                outline: 'none',
              }}
            >
              {/* Name row + tick */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                {/* Custom tick box — matches Step4 Checkbox style */}
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${selected ? 'var(--a1, #3D1FA8)' : '#D8D0F0'}`,
                  background: selected ? 'var(--a1, #3D1FA8)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}>
                  {selected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: selected ? 700 : 500,
                  color: selected ? 'var(--a1, #3D1FA8)' : 'var(--ink, #1A1A2E)',
                }}>
                  {voice.label}
                </span>
              </div>

              {/* Play / Pause button */}
              <button
                onClick={(e) => handlePlayPause(voice.key, e)}
                aria-label={isPlaying ? `Pause ${voice.label}` : `Play ${voice.label} sample`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '6px',
                  border: `1px solid ${selected ? 'rgba(61,31,168,0.3)' : 'var(--divider, #E8E8EE)'}`,
                  background: isPlaying ? 'var(--a1, #3D1FA8)' : '#fff',
                  color: isPlaying ? '#fff' : selected ? 'var(--a1, #3D1FA8)' : 'var(--muted, #888)',
                  fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: '"Inter", sans-serif',
                  transition: 'all .15s',
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
