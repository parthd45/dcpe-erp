import React, { useState } from 'react';

/**
 * Official DCPE Amravati College Emblem Component
 * Uses the exact official seal image of Degree College of Physical Education, Amravati (M.S.)
 * featuring the "H" arrow emblem, "बलम् उपास्व" motto, spiked crown ring & "AMRAVATI (M.S.)" scroll ribbon.
 */
export function OfficialHVPMLogo({ size = 44, showTitle = true, isLight = false, className = '' }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }} className={className}>
      {!imgError ? (
        <img
          src="/dcpe-official-logo.png"
          alt="Degree College of Physical Education, Amravati (M.S.) Official Emblem"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: 'contain',
            flexShrink: 0,
            filter: isLight
              ? 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(255,255,255,0.4))'
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            transition: 'transform 0.2s ease',
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Exact Vector SVG Replica of Official Emblem */
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          {/* Spiked Crown Outer Ring */}
          <circle cx="60" cy="55" r="48" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="2.5" />

          {/* Inner Circle */}
          <circle cx="60" cy="55" r="38" fill="#ffffff" stroke="#1e1b4b" strokeWidth="2" />

          {/* Central H with Spear Arrow */}
          <text x="60" y="54" textAnchor="middle" fill="#1e1b4b" fontSize="22" fontWeight="900" fontFamily="serif">
            H
          </text>
          <line x1="38" y1="52" x2="82" y2="52" stroke="#1e1b4b" strokeWidth="3" />
          <polygon points="82,48 90,52 82,56" fill="#1e1b4b" />
          <polygon points="38,48 32,52 38,56" fill="#1e1b4b" />

          {/* Sanskrit Motto: बलम् उपास्व */}
          <text x="60" y="68" textAnchor="middle" fill="#1e1b4b" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">
            बलम् उपास्व
          </text>

          {/* Outer Ring Text */}
          <path id="ringText" d="M 24 55 A 36 36 0 1 1 96 55" fill="none" />
          <text fill="#ffffff" fontSize="7" fontWeight="800" letterSpacing="0.8">
            <textPath href="#ringText" startOffset="50%" textAnchor="middle">
              DEGREE COLLEGE OF PHYSICAL EDUCATION
            </textPath>
          </text>

          {/* Bottom Ribbon Scroll: AMRAVATI (M.S.) */}
          <rect x="25" y="94" width="70" height="16" rx="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
          <text x="60" y="105" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="900">
            AMRAVATI (M.S.)
          </text>
        </svg>
      )}

      {showTitle && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: isLight ? '#ffffff' : 'var(--text-heading)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
          }}>
            DCPE HVPM
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
            lineHeight: 1.2,
          }}>
            Degree College of Physical Education, Amravati (M.S.)
          </span>
        </div>
      )}
    </div>
  );
}
