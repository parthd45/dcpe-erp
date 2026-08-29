import React, { useState } from 'react';
import { Award, Trophy, Code, Palette, Dumbbell, Wrench, Download, Share2, X, Star, Lock } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ACHIEVEMENT DATA
   ═══════════════════════════════════════════════════════════════ */
const ACHIEVEMENT_CATEGORIES = [
  { key: 'all', label: '🏆 All', color: '#ffd700' },
  { key: 'academic', label: '📚 Academic', color: '#3b82f6' },
  { key: 'sports', label: '🏅 Sports', color: '#059669' },
  { key: 'hackathon', label: '💻 Hackathon', color: '#8b5cf6' },
  { key: 'cultural', label: '🎭 Cultural', color: '#ec4899' },
  { key: 'workshop', label: '🔧 Workshop', color: '#f97316' },
];

const ACHIEVEMENTS = [
  { id: 'a1', title: 'Dean\'s List — Semester I', category: 'academic', date: '2026-01-15', icon: '📚', rarity: 'legendary', earned: true, description: 'Achieved SGPA 9.0+ in Semester I examinations', issuer: 'DCPE Academic Office' },
  { id: 'a2', title: 'HackMatrix 2026 — Winner', category: 'hackathon', date: '2026-02-20', icon: '💻', rarity: 'epic', earned: true, description: '1st place in 48-hour national hackathon with AI project', issuer: 'DCPE Tech Committee' },
  { id: 'a3', title: 'Inter-Dept Cricket Champion', category: 'sports', date: '2026-03-05', icon: '🏏', rarity: 'rare', earned: true, description: 'Won the inter-department cricket tournament 2026', issuer: 'DCPE Sports Committee' },
  { id: 'a4', title: 'AWS Cloud Practitioner', category: 'workshop', date: '2026-01-28', icon: '☁️', rarity: 'epic', earned: true, description: 'Completed AWS Cloud Practitioner certification', issuer: 'Amazon Web Services' },
  { id: 'a5', title: 'Cultural Fest - Best Performer', category: 'cultural', date: '2026-04-01', icon: '🎭', rarity: 'rare', earned: true, description: 'Best individual performer at Utsav Cultural Fest', issuer: 'DCPE Cultural Committee' },
  { id: 'a6', title: 'Perfect Attendance — Month', category: 'academic', date: '2026-02-01', icon: '✅', rarity: 'common', earned: true, description: '100% attendance for an entire month', issuer: 'DCPE Academic Office' },
  { id: 'a7', title: 'Library Champion', category: 'academic', date: '2026-03-10', icon: '📖', rarity: 'common', earned: true, description: 'Borrowed 20+ books in a single semester', issuer: 'Central Library' },
  { id: 'a8', title: 'Open Source Contributor', category: 'hackathon', date: '2026-04-15', icon: '🐙', rarity: 'rare', earned: true, description: 'Contributed to 3+ open-source projects on GitHub', issuer: 'DCPE Tech Committee' },
  { id: 'a9', title: 'Marathon Finisher', category: 'sports', date: '2026-03-20', icon: '🏃', rarity: 'rare', earned: false, description: 'Complete the annual college marathon (10km)', issuer: 'DCPE Sports Committee' },
  { id: 'a10', title: 'Research Paper Published', category: 'academic', date: '', icon: '📝', rarity: 'legendary', earned: false, description: 'Publish a research paper in a recognized journal', issuer: 'DCPE Research Cell' },
  { id: 'a11', title: 'Full-Stack Project Deployed', category: 'hackathon', date: '', icon: '🚀', rarity: 'epic', earned: false, description: 'Deploy a full-stack web application to production', issuer: 'DCPE Tech Committee' },
  { id: 'a12', title: 'Dance Competition Winner', category: 'cultural', date: '', icon: '💃', rarity: 'rare', earned: false, description: 'Win a dance competition at college or inter-college level', issuer: 'DCPE Cultural Committee' },
];

const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.2)', border: 'rgba(148,163,184,0.2)' },
  rare:      { label: 'Rare',      color: '#3b82f6', glow: 'rgba(59,130,246,0.3)',  border: 'rgba(59,130,246,0.3)' },
  epic:      { label: 'Epic',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)',  border: 'rgba(139,92,246,0.3)' },
  legendary: { label: 'Legendary', color: '#ffd700', glow: 'rgba(255,215,0,0.3)',   border: 'rgba(255,215,0,0.3)' },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AchievementWalletModal({ currentUser, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const earnedCount = ACHIEVEMENTS.filter(a => a.earned).length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPct = (earnedCount / totalCount) * 100;

  const filtered = activeCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === activeCategory);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: 880, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #ffd700, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
            }}>
              <Trophy size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>🏆 Achievement Wallet</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                Your digital certificates & badges
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* Progress Ring */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px',
            background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)',
            borderRadius: '14px', padding: '16px 20px',
          }}>
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx={32} cy={32} r={26} fill="none" stroke="#ffd700" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - progressPct / 100)}
                  style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#ffd700' }}>
                {earnedCount}/{totalCount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                {earnedCount} Achievements Earned
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                {totalCount - earnedCount} more to unlock • {progressPct.toFixed(0)}% complete
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {Object.entries(RARITY_CONFIG).map(([key, cfg]) => {
                  const count = ACHIEVEMENTS.filter(a => a.rarity === key && a.earned).length;
                  return count > 0 ? (
                    <span key={key} style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                      borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      {count} {cfg.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {ACHIEVEMENT_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                background: activeCategory === cat.key ? `${cat.color}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCategory === cat.key ? `${cat.color}30` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
                color: activeCategory === cat.key ? cat.color : 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Achievement Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {filtered.map(ach => {
              const rarity = RARITY_CONFIG[ach.rarity];
              return (
                <div
                  key={ach.id}
                  onClick={() => ach.earned && setSelectedAchievement(ach)}
                  style={{
                    background: ach.earned ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${ach.earned ? rarity.border : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '14px', padding: '18px',
                    cursor: ach.earned ? 'pointer' : 'default',
                    transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                    opacity: ach.earned ? 1 : 0.5,
                  }}
                  onMouseEnter={e => {
                    if (ach.earned) {
                      e.currentTarget.style.transform = 'translateY(-3px) rotateY(2deg)';
                      e.currentTarget.style.boxShadow = `0 8px 30px ${rarity.glow}`;
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) rotateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Holographic shine */}
                  {ach.earned && ach.rarity === 'legendary' && (
                    <div style={{
                      position: 'absolute', top: -30, right: -30, width: 80, height: 80,
                      borderRadius: '50%', background: 'rgba(255,215,0,0.1)', filter: 'blur(20px)',
                    }} />
                  )}

                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>
                      {ach.earned ? ach.icon : <Lock size={28} color="rgba(255,255,255,0.2)" />}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '4px', lineHeight: 1.3 }}>
                      {ach.earned ? ach.title : '???'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                        borderRadius: '6px', background: `${rarity.color}15`, color: rarity.color,
                      }}>
                        {rarity.label}
                      </span>
                    </div>
                    {ach.earned && ach.date && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '6px' }}>
                        Earned: {new Date(ach.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {!ach.earned && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '6px' }}>
                        🔒 Not yet earned
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Modal */}
          {selectedAchievement && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} onClick={() => setSelectedAchievement(null)}>
              <div onClick={e => e.stopPropagation()} style={{
                maxWidth: 420, width: '90vw', borderRadius: '20px',
                background: 'linear-gradient(145deg, #1a1a3e, #24243e)',
                border: `1px solid ${RARITY_CONFIG[selectedAchievement.rarity].border}`,
                padding: '28px', textAlign: 'center',
                boxShadow: `0 20px 60px ${RARITY_CONFIG[selectedAchievement.rarity].glow}`,
              }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>{selectedAchievement.icon}</div>
                <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>{selectedAchievement.title}</h3>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 12px', borderRadius: '8px',
                  background: `${RARITY_CONFIG[selectedAchievement.rarity].color}15`,
                  color: RARITY_CONFIG[selectedAchievement.rarity].color,
                  border: `1px solid ${RARITY_CONFIG[selectedAchievement.rarity].border}`,
                }}>
                  {RARITY_CONFIG[selectedAchievement.rarity].label}
                </span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '14px 0', lineHeight: 1.5 }}>
                  {selectedAchievement.description}
                </p>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                  Issued by: {selectedAchievement.issuer}
                  {selectedAchievement.date && (
                    <> • {new Date(selectedAchievement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none', borderRadius: '10px', padding: '10px 20px',
                    color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Download size={14} /> Download
                  </button>
                  <button style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 20px',
                    color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
                <button onClick={() => setSelectedAchievement(null)} style={{
                  marginTop: '16px', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px',
                }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
