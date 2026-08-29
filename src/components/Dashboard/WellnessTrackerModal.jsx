import React, { useState, useMemo } from 'react';
import { Heart, Smile, Frown, Meh, Angry, X, TrendingUp, Shield, Wind, Calendar, Flame } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MOOD OPTIONS
   ═══════════════════════════════════════════════════════════════ */
const MOODS = [
  { key: 'great',   emoji: '😊', label: 'Great',     color: '#10b981', score: 5 },
  { key: 'good',    emoji: '🙂', label: 'Good',      color: '#3b82f6', score: 4 },
  { key: 'okay',    emoji: '😐', label: 'Okay',      color: '#f59e0b', score: 3 },
  { key: 'low',     emoji: '😟', label: 'Low',       color: '#f97316', score: 2 },
  { key: 'stressed',emoji: '😤', label: 'Stressed',  color: '#ef4444', score: 1 },
];

/* ═══════════════════════════════════════════════════════════════
   MOCK WELLNESS HISTORY
   ═══════════════════════════════════════════════════════════════ */
function generateWellnessHistory() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const score = Math.floor(Math.random() * 5) + 1;
    days.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      fullDate: d.toISOString().slice(0, 10),
      score,
      mood: MOODS.find(m => m.score === score),
    });
  }
  return days;
}

const WELLNESS_TIPS = [
  { emoji: '🧘', title: 'Mindful Breathing', desc: 'Take 5 deep breaths. Inhale 4s, hold 4s, exhale 4s.' },
  { emoji: '🚶', title: 'Walk Break', desc: 'A 10-minute walk boosts mood and creativity.' },
  { emoji: '💤', title: 'Sleep Hygiene', desc: 'Aim for 7-8 hours. No screens 30 min before bed.' },
  { emoji: '📵', title: 'Digital Detox', desc: '30 min without phone can reduce anxiety significantly.' },
  { emoji: '🎵', title: 'Music Therapy', desc: 'Listen to calming music to lower cortisol levels.' },
  { emoji: '📝', title: 'Gratitude Journal', desc: 'Write 3 things you are grateful for today.' },
];

const COUNSELOR_RESOURCES = [
  { title: 'DCPE Student Counseling Center', contact: 'Room 108, Admin Block', emoji: '🏥' },
  { title: 'iCall Psychosocial Helpline', contact: '9152987821 (Mon-Sat, 8AM-10PM)', emoji: '📞' },
  { title: 'Vandrevala Foundation', contact: '1860-2662-345 (24/7)', emoji: '🆘' },
  { title: 'NIMHANS Helpline', contact: '080-46110007', emoji: '🧠' },
];

/* ═══════════════════════════════════════════════════════════════
   BREATHING EXERCISE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [timer, setTimer] = useState(null);

  const startExercise = () => {
    setIsActive(true);
    let count = 0;
    const phases = ['inhale', 'hold', 'exhale', 'hold'];
    setPhase(phases[0]);
    const t = setInterval(() => {
      count++;
      setPhase(phases[count % 4]);
    }, 4000);
    setTimer(t);
    setTimeout(() => {
      clearInterval(t);
      setIsActive(false);
      setPhase('inhale');
    }, 4000 * 12); // 3 full cycles
  };

  const stopExercise = () => {
    if (timer) clearInterval(timer);
    setIsActive(false);
    setPhase('inhale');
  };

  const phaseColors = { inhale: '#10b981', hold: '#3b82f6', exhale: '#8b5cf6' };
  const phaseLabels = { inhale: 'Breathe In...', hold: 'Hold...', exhale: 'Breathe Out...' };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px', padding: '24px', textAlign: 'center',
    }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Wind size={16} color="#10b981" /> Guided Breathing Exercise
      </h4>

      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
        <div style={{
          width: isActive ? 140 : 80,
          height: isActive ? 140 : 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${phaseColors[phase]}30, transparent)`,
          border: `3px solid ${phaseColors[phase]}60`,
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 4s ease-in-out',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isActive ? `0 0 40px ${phaseColors[phase]}30` : 'none',
        }}>
          <span style={{ fontSize: isActive ? '14px' : '12px', fontWeight: 600, color: phaseColors[phase], transition: 'all 0.3s' }}>
            {isActive ? phaseLabels[phase] : '🧘'}
          </span>
        </div>
      </div>

      <button
        onClick={isActive ? stopExercise : startExercise}
        style={{
          background: isActive ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #10b981, #059669)',
          border: isActive ? '1px solid rgba(239,68,68,0.3)' : 'none',
          borderRadius: '10px', padding: '10px 24px', cursor: 'pointer',
          color: '#fff', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
        }}
      >
        {isActive ? '⏹ Stop' : '▶ Start Breathing (1 min)'}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function WellnessTrackerModal({ currentUser, onClose }) {
  const [todayMood, setTodayMood] = useState(null);
  const [activeTab, setActiveTab] = useState('checkin');

  const history = useMemo(() => generateWellnessHistory(), []);
  const streak = useMemo(() => {
    let s = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].score > 0) s++;
      else break;
    }
    return s;
  }, [history]);

  const avgScore = useMemo(() => {
    const sum = history.reduce((a, b) => a + b.score, 0);
    return (sum / history.length).toFixed(1);
  }, [history]);

  const wellnessLabel = avgScore >= 4 ? '💚 Excellent' : avgScore >= 3 ? '💛 Good' : avgScore >= 2 ? '🧡 Fair' : '❤️ Needs Care';

  // SVG line chart data
  const chartWidth = 600;
  const chartHeight = 100;
  const chartPoints = history.map((h, i) => {
    const x = (i / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((h.score - 1) / 4) * (chartHeight - 10) - 5;
    return { x, y, ...h };
  });
  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: 860, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
            }}>
              <Heart size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>📱 Wellness Tracker</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                🔒 Private — Only you can see this
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: '12px 28px 0', display: 'flex', gap: '6px' }}>
          {[
            { key: 'checkin', label: '😊 Check-in' },
            { key: 'history', label: '📈 History' },
            { key: 'breathe', label: '🧘 Breathe' },
            { key: 'resources', label: '🆘 Resources' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              background: activeTab === t.key ? 'rgba(236,72,153,0.15)' : 'transparent',
              border: `1px solid ${activeTab === t.key ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '10px', padding: '7px 14px',
              color: activeTab === t.key ? '#f472b6' : 'rgba(255,255,255,0.5)',
              fontWeight: 600, fontSize: '12px', cursor: 'pointer',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* Stats Bar */}
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
          }}>
            <div style={{
              flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Avg Wellness</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{avgScore}/5</div>
              <div style={{ fontSize: '11px', fontWeight: 600 }}>{wellnessLabel}</div>
            </div>
            <div style={{
              flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Check-in Streak</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={18} /> {streak} days
              </div>
            </div>
            <div style={{
              flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Today</div>
              <div style={{ fontSize: '20px' }}>
                {todayMood ? todayMood.emoji : '❓'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                {todayMood ? todayMood.label : 'Not checked in'}
              </div>
            </div>
          </div>

          {/* CHECK-IN */}
          {activeTab === 'checkin' && (
            <>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '20px',
              }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  How are you feeling today?
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
                  Tap a mood to check in — it's completely private
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {MOODS.map(mood => (
                    <button
                      key={mood.key}
                      onClick={() => setTodayMood(mood)}
                      style={{
                        background: todayMood?.key === mood.key ? `${mood.color}20` : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${todayMood?.key === mood.key ? mood.color : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '16px', padding: '16px 20px', cursor: 'pointer',
                        transition: 'all 0.3s', textAlign: 'center', minWidth: 80,
                        boxShadow: todayMood?.key === mood.key ? `0 4px 20px ${mood.color}30` : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '4px' }}>{mood.emoji}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: todayMood?.key === mood.key ? mood.color : 'rgba(255,255,255,0.5)' }}>
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
                {todayMood && (
                  <div style={{
                    marginTop: '16px', background: `${todayMood.color}10`,
                    border: `1px solid ${todayMood.color}25`, borderRadius: '10px',
                    padding: '10px', fontSize: '13px', color: todayMood.color, fontWeight: 600,
                  }}>
                    ✅ Mood logged: {todayMood.emoji} {todayMood.label}
                  </div>
                )}
              </div>

              {/* Daily Tips */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>💡 Wellness Tips</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {WELLNESS_TIPS.map((tip, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '14px', transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(236,72,153,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <span style={{ fontSize: '24px' }}>{tip.emoji}</span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: '6px 0 4px' }}>{tip.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{tip.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>📈 30-Day Wellness Trend</h4>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px', overflowX: 'auto', marginBottom: '20px',
              }}>
                <svg width={chartWidth} height={chartHeight + 20} viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} style={{ width: '100%', height: 'auto' }}>
                  <defs>
                    <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#wellnessGrad)" />
                  <path d={linePath} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {chartPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill={p.mood.color} stroke="#1a1a3e" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>

              {/* Day-by-day list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {history.slice().reverse().slice(0, 14).map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '8px 14px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: 60 }}>{h.date}</span>
                    <span style={{ fontSize: '20px' }}>{h.mood.emoji}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: h.mood.color }}>{h.mood.label}</span>
                    <div style={{ flex: 1 }} />
                    <div style={{ height: 6, width: 60, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${(h.score / 5) * 100}%`, height: '100%', borderRadius: 6, background: h.mood.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BREATHE */}
          {activeTab === 'breathe' && <BreathingExercise />}

          {/* RESOURCES */}
          {activeTab === 'resources' && (
            <div>
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
                fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
              }}>
                🆘 <strong style={{ color: '#fff' }}>If you're in crisis</strong>, please reach out immediately.
                You are not alone. Professional help is available 24/7.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {COUNSELOR_RESOURCES.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '16px',
                  }}>
                    <span style={{ fontSize: '28px' }}>{r.emoji}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{r.contact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
