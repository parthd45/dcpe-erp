import React from 'react';

/**
 * Official HVPM DCPE College Crest & Seal Logo Component
 * High-definition vector emblem for Hanuman Vyayam Prasarak Mandal's
 * Degree College of Physical Education, Amravati (Autonomous)
 */
export function OfficialHVPMLogo({ size = 44, showTitle = true, isLight = false, className = '' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }} className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
      >
        <defs>
          <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>

          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>

        {/* Outer Gold Border Ring */}
        <circle cx="60" cy="60" r="58" fill="url(#goldRingGrad)" stroke="#78350f" strokeWidth="1.5" />

        {/* Inner Navy Ring */}
        <circle cx="60" cy="60" r="50" fill="url(#shieldGrad)" stroke="#fbbf24" strokeWidth="2" />

        {/* Decorative Laurel Wreath Left */}
        <path d="M 28 68 C 24 50 34 34 46 26" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="34" cy="46" r="3" fill="#fbbf24" />
        <circle cx="28" cy="56" r="3" fill="#fbbf24" />
        <circle cx="42" cy="34" r="3" fill="#fbbf24" />

        {/* Decorative Laurel Wreath Right */}
        <path d="M 92 68 C 96 50 86 34 74 26" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="86" cy="46" r="3" fill="#fbbf24" />
        <circle cx="92" cy="56" r="3" fill="#fbbf24" />
        <circle cx="78" cy="34" r="3" fill="#fbbf24" />

        {/* Central Shield Outline */}
        <path
          d="M 60 28 L 80 38 V 64 C 80 78 60 92 60 92 C 60 92 40 78 40 64 V 38 Z"
          fill="#1e1b4b"
          stroke="#f59e0b"
          strokeWidth="2.5"
        />

        {/* Torch (Mashal) Base & Handle */}
        <rect x="57" y="66" width="6" height="18" rx="2" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
        <path d="M 52 64 L 68 64 L 64 68 L 56 68 Z" fill="#b45309" />

        {/* Torch Bowl */}
        <path d="M 50 56 L 70 56 L 64 66 L 56 66 Z" fill="url(#goldRingGrad)" />

        {/* Flame of Knowledge & Athletics */}
        <path
          d="M 60 32 C 66 40 68 44 64 54 C 60 50 54 50 52 44 C 52 44 56 42 60 32 Z"
          fill="url(#flameGrad)"
        />
        <path
          d="M 60 38 C 63 43 64 46 62 52 C 60 50 56 50 54 46 Z"
          fill="#fef08a"
        />

        {/* Top Arc Text Simulation — HVPM DCPE */}
        <path id="textArc" d="M 22 60 A 38 38 0 1 1 98 60" fill="none" />
        <text fill="#ffffff" fontSize="9" fontWeight="800" letterSpacing="1.2">
          <textPath href="#textArc" startOffset="50%" textAnchor="middle">
            HVPM • DCPE AMRAVATI
          </textPath>
        </text>

        {/* Bottom Year Star */}
        <text x="60" y="104" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="800">
          ESTD. 1967 • AUTONOMOUS
        </text>
      </svg>

      {showTitle && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: isLight ? '#ffffff' : 'var(--text-heading)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.3px',
            lineHeight: 1.25,
          }}>
            DCPE HVPM
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
            lineHeight: 1.2,
          }}>
            Degree College of Physical Education, Amravati
          </span>
        </div>
      )}
    </div>
  );
}
