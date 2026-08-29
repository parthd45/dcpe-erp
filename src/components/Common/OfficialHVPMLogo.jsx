import React, { useState } from 'react';

/**
 * Official DCPE Amravati College Emblem Component
 * Renders both "DCPE HVPM" and "Degree College of Physical Education, Amravati (M.S.)"
 * in bold, vibrant high-visibility Crimson Red for maximum legibility.
 */
export function OfficialHVPMLogo({ size = 58, showTitle = true, isLight = false, className = '' }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }} className={className}>
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
              ? 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(255,255,255,0.4))'
              : 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            transition: 'transform 0.2s ease',
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Vector SVG Replica of Official Emblem */
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <circle cx="60" cy="55" r="48" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="60" cy="55" r="38" fill="#ffffff" stroke="#1e1b4b" strokeWidth="2" />
          <text x="60" y="54" textAnchor="middle" fill="#1e1b4b" fontSize="22" fontWeight="900" fontFamily="serif">
            H
          </text>
          <line x1="38" y1="52" x2="82" y2="52" stroke="#1e1b4b" strokeWidth="3" />
          <polygon points="82,48 90,52 82,56" fill="#1e1b4b" />
          <polygon points="38,48 32,52 38,56" fill="#1e1b4b" />
          <text x="60" y="68" textAnchor="middle" fill="#1e1b4b" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">
            बलम् उपास्व
          </text>
          <path id="ringText" d="M 24 55 A 36 36 0 1 1 96 55" fill="none" />
          <text fill="#ffffff" fontSize="7" fontWeight="800" letterSpacing="0.8">
            <textPath href="#ringText" startOffset="50%" textAnchor="middle">
              DEGREE COLLEGE OF PHYSICAL EDUCATION
            </textPath>
          </text>
          <rect x="25" y="94" width="70" height="16" rx="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
          <text x="60" y="105" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="900">
            AMRAVATI (M.S.)
          </text>
        </svg>
      )}

      {showTitle && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Main Title in High-Visibility Bold Crimson Red */}
          <span style={{
            fontSize: '19px',
            fontWeight: 900,
            color: '#ef4444', // High-visibility bright crimson red!
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.2px',
            lineHeight: 1.2,
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
          }}>
            DCPE HVPM
          </span>
          {/* Subtitle also in High-Visibility Vibrant Red */}
          <span style={{
            fontSize: '11.5px',
            fontWeight: 800,
            color: '#f87171', // Bright vibrant red!
            lineHeight: 1.25,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
          }}>
            Degree College of Physical Education, Amravati (M.S.)
          </span>
        </div>
      )}
    </div>
  );
}
