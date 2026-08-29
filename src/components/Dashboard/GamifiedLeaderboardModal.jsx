import React, { useState, useMemo } from 'react';
import { Trophy, Flame, Star, TrendingUp, Crown, Medal, Zap, Target, BookOpen, Calendar, Briefcase, Library, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   RANK TIERS — XP thresholds with badge metadata
   ═══════════════════════════════════════════════════════════════ */
const RANK_TIERS = [
  { name: 'Bronze',   emoji: '🥉', minXP: 0,    color: '#cd7f32', glow: 'rgba(205,127,50,0.4)' },
  { name: 'Silver',   emoji: '🥈', minXP: 500,  color: '#c0c0c0', glow: 'rgba(192,192,192,0.4)' },
  { name: 'Gold',     emoji: '🥇', minXP: 1500, color: '#ffd700', glow: 'rgba(255,215,0,0.4)' },
  { name: 'Platinum', emoji: '💠', minXP: 3000, color: '#00bfff', glow: 'rgba(0,191,255,0.4)' },
  { name: 'Diamond',  emoji: '💎', minXP: 5000, color: '#b9f2ff', glow: 'rgba(185,242,255,0.5)' },
  { name: 'Legend',   emoji: '👑', minXP: 8000, color: '#ff6b6b', glow: 'rgba(255,107,107,0.5)' },
];

function getRank(xp) {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (xp >= tier.minXP) rank = tier;
  }
  return rank;
}

function getNextRank(xp) {
  for (const tier of RANK_TIERS) {
    if (xp < tier.minXP) return tier;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   XP CATEGORIES
   ═══════════════════════════════════════════════════════════════ */
const XP_CATEGORIES = [
  { key: 'attendance',  label: 'Attendance',       icon: Calendar,  xpPer: 10, unit: 'per class', color: '#059669' },
  { key: 'assignments', label: 'Assignments',      icon: BookOpen,  xpPer: 25, unit: 'per submit', color: '#2563eb' },
  { key: 'placement',   label: 'Placement Prep',   icon: Briefcase, xpPer: 50, unit: 'per activity', color: '#7c3aed' },
  { key: 'library',     label: 'Library Usage',    icon: Library,   xpPer: 15, unit: 'per book', color: '#db2777' },
  { key: 'hackathon',   label: 'Hackathons',       icon: Zap,       xpPer: 100,unit: 'per event', color: '#ea580c' },
  { key: 'sports',      label: 'Sports & Fitness', icon: Target,    xpPer: 20, unit: 'per session', color: '#0891b2' },
];

/* ═══════════════════════════════════════════════════════════════
   MOCK LEADERBOARD DATA
   ═══════════════════════════════════════════════════════════════ */
function generateLeaderboard(currentUser) {
  const names = [
    'Aarav Mehta', 'Priya Sharma', 'Rohan Deshmukh', 'Sneha Patil',
    'Vikram Singh', 'Ananya Roy', 'Karan Gupta', 'Ishita Joshi',
    'Arjun Reddy', 'Meera Kulkarni', 'Aditya Patel', 'Riya Nair',
    'Harsh Vardhan', 'Pooja Thakur', 'Nikhil Rao', 'Divya Menon',
    'Saurabh Tiwari', 'Nisha Agarwal', 'Rahul Verma', 'Kavita Bhat'
  ];

  const board = names.map((name, i) => ({
    id: `s_${i}`,
    name,
    xp: Math.floor(Math.random() * 7000) + 1000,
    streak: Math.floor(Math.random() * 30) + 1,
    avatar: name.split(' ').map(n => n[0]).join(''),
    isCurrentUser: false,
  }));

  const userEntry = {
    id: currentUser?.id || 'current',
    name: currentUser?.name || 'You',
    xp: Math.floor(Math.random() * 4000) + 2000,
    streak: Math.floor(Math.random() * 20) + 5,
    avatar: currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U',
    isCurrentUser: true,
  };
  board.push(userEntry);
  board.sort((a, b) => b.xp - a.xp);
  return board;
}

/* ═══════════════════════════════════════════════════════════════
   CONFETTI PARTICLES
   ═══════════════════════════════════════════════════════════════ */
function ConfettiParticles() {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#3b82f6', '#f97316', '#ec4899'];
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const dur = 2 + Math.random() * 3;
        const size = 4 + Math.random() * 8;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-10px',
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: color,
              opacity: 0.8,
              animation: `confettiFall ${dur}s ease-in ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function GamifiedLeaderboardModal({ currentUser, onClose }) {
  const [activeTimeframe, setActiveTimeframe] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);

  const leaderboard = useMemo(() => generateLeaderboard(currentUser), [currentUser]);
  const myEntry = leaderboard.find(e => e.isCurrentUser);
  const myRank = getRank(myEntry?.xp || 0);
  const nextRank = getNextRank(myEntry?.xp || 0);
  const myPosition = leaderboard.findIndex(e => e.isCurrentUser) + 1;

  const progressToNext = nextRank
    ? ((myEntry.xp - myRank.minXP) / (nextRank.minXP - myRank.minXP)) * 100
    : 100;

  const handleLevelUp = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 900, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
          color: '#e2e8f0', position: 'relative', display: 'flex', flexDirection: 'column',
        }}
      >
        {showConfetti && <ConfettiParticles />}

        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'linear-gradient(135deg, #ffd700, #ff6b6b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
              }}>
                <Trophy size={26} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  🎮 XP Leaderboard
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  Earn XP • Climb Ranks • Dominate the Board
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px',
              padding: '8px', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px', position: 'relative', zIndex: 1 }}>

          {/* ── My Profile Card ── */}
          <div style={{
            background: `linear-gradient(135deg, ${myRank.color}15, ${myRank.color}08)`,
            border: `1px solid ${myRank.color}30`,
            borderRadius: '16px', padding: '20px 24px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              borderRadius: '50%', background: myRank.glow, filter: 'blur(40px)',
            }} />

            <div style={{
              width: 64, height: 64, borderRadius: '16px',
              background: `linear-gradient(135deg, ${myRank.color}, ${myRank.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 20px ${myRank.glow}`, flexShrink: 0, position: 'relative',
            }}>
              {currentUser?.photoUrl ? (
                <img src={currentUser.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} />
              ) : (myEntry?.avatar || 'U')}
              <div style={{
                position: 'absolute', bottom: -4, right: -4,
                fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}>
                {myRank.emoji}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {myEntry?.name || 'You'}
                </span>
                <span style={{
                  background: `${myRank.color}25`, color: myRank.color,
                  padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
                  fontWeight: 700, border: `1px solid ${myRank.color}40`,
                }}>
                  {myRank.emoji} {myRank.name}
                </span>
                {myEntry?.streak >= 7 && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'rgba(255,107,107,0.15)', color: '#ff6b6b',
                    padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  }}>
                    <Flame size={12} /> {myEntry.streak} day streak
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  Rank <strong style={{ color: '#ffd700', fontSize: '16px' }}>#{myPosition}</strong>
                </span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  <strong style={{ color: '#fff' }}>{myEntry?.xp?.toLocaleString()}</strong> XP
                </span>
              </div>

              {nextRank ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {myRank.emoji} {myRank.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {nextRank.emoji} {nextRank.name} ({nextRank.minXP.toLocaleString()} XP)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progressToNext}%`, height: '100%', borderRadius: '10px',
                      background: `linear-gradient(90deg, ${myRank.color}, ${nextRank.color})`,
                      transition: 'width 1.5s ease', boxShadow: `0 0 12px ${myRank.glow}`,
                    }} />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#ffd700', fontWeight: 600 }}>
                  👑 Maximum Rank Achieved — LEGENDARY!
                </div>
              )}
            </div>

            <button onClick={handleLevelUp} style={{
              background: 'linear-gradient(135deg, #ffd700, #ff6b6b)',
              border: 'none', borderRadius: '12px', padding: '10px 18px', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: '13px',
              boxShadow: '0 4px 16px rgba(255,215,0,0.3)', transition: 'transform 0.2s, box-shadow 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 24px rgba(255,215,0,0.5)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(255,215,0,0.3)'; }}
            >
              🎉 Celebrate!
            </button>
          </div>

          {/* ── XP Breakdown Cards ── */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#ffd700" /> How You Earn XP
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {XP_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.key} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '14px', textAlign: 'center', transition: 'all 0.3s', cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}15`; e.currentTarget.style.borderColor = `${cat.color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Icon size={18} color={cat.color} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{cat.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: cat.color }}>+{cat.xpPer} XP</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{cat.unit}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Timeframe Tabs ── */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {[
              { key: 'weekly', label: '📅 This Week' },
              { key: 'monthly', label: '📆 This Month' },
              { key: 'all', label: '🏆 All Time' },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTimeframe(t.key)} style={{
                background: activeTimeframe === t.key ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTimeframe === t.key ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '8px 16px',
                color: activeTimeframe === t.key ? '#ffd700' : 'rgba(255,255,255,0.6)',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Leaderboard Table ── */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
            {/* Top 3 Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[1, 0, 2].map(idx => {
                const entry = leaderboard[idx];
                if (!entry) return null;
                const rank = getRank(entry.xp);
                const isFirst = idx === 0;
                const sizes = { 0: 56, 1: 48, 2: 44 };
                const heights = { 0: 100, 1: 80, 2: 65 };
                const positions = { 0: '🥇', 1: '🥈', 2: '🥉' };
                return (
                  <div key={idx} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: sizes[idx], height: sizes[idx], borderRadius: '50%',
                      background: entry.isCurrentUser ? `linear-gradient(135deg, ${rank.color}, ${rank.color}88)` : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isFirst ? '20px' : '16px', fontWeight: 800, color: '#fff',
                      border: `2px solid ${rank.color}60`,
                      boxShadow: isFirst ? `0 4px 24px ${rank.glow}` : 'none', marginBottom: '6px',
                    }}>
                      {entry.avatar}
                    </div>
                    <span style={{ fontSize: '20px' }}>{positions[idx]}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: entry.isCurrentUser ? '#ffd700' : '#fff', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.isCurrentUser ? '⭐ You' : entry.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      {entry.xp.toLocaleString()} XP
                    </span>
                    <div style={{
                      width: 40, height: heights[idx], borderRadius: '6px 6px 0 0',
                      background: `linear-gradient(to top, ${rank.color}30, ${rank.color}08)`,
                      marginTop: '6px', border: `1px solid ${rank.color}20`, borderBottom: 'none',
                    }} />
                  </div>
                );
              })}
            </div>

            {/* Full List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {leaderboard.map((entry, i) => {
                const rank = getRank(entry.xp);
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: entry.isCurrentUser ? 'rgba(255,215,0,0.06)' : 'transparent', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!entry.isCurrentUser) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!entry.isCurrentUser) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? '16px' : '14px', fontWeight: 700, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.4)' }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: entry.isCurrentUser ? `linear-gradient(135deg, ${rank.color}, ${rank.color}88)` : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {entry.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: entry.isCurrentUser ? 700 : 600, color: entry.isCurrentUser ? '#ffd700' : '#fff' }}>
                          {entry.isCurrentUser ? `⭐ ${entry.name} (You)` : entry.name}
                        </span>
                        <span style={{ fontSize: '12px' }}>{rank.emoji}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rank.name} Rank</span>
                    </div>
                    {entry.streak >= 5 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#ff6b6b', fontWeight: 600 }}>
                        <Flame size={12} /> {entry.streak}
                      </div>
                    )}
                    <div style={{ fontSize: '14px', fontWeight: 700, color: entry.isCurrentUser ? '#ffd700' : 'rgba(255,255,255,0.7)', minWidth: 70, textAlign: 'right' }}>
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
