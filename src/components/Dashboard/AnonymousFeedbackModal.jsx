import React, { useState } from 'react';
import { MessageCircle, Star, ThumbsUp, BarChart3, Send, X, Eye, EyeOff, TrendingUp } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */
const FACULTY_LIST = [
  { id: 'f1', name: 'Prof. S. Sharma', subject: 'Cloud Computing', avgRating: 4.3 },
  { id: 'f2', name: 'Dr. V. M. Thakare', subject: 'Machine Learning', avgRating: 4.1 },
  { id: 'f3', name: 'Dr. Ananya Roy', subject: 'Database Systems', avgRating: 4.6 },
  { id: 'f4', name: 'Prof. R. Deshmukh', subject: 'Software Architecture', avgRating: 3.9 },
  { id: 'f5', name: 'Prof. Kulkarni', subject: 'Sports Analytics', avgRating: 4.5 },
];

const ACTIVE_POLLS = [
  {
    id: 'p1', question: 'Should the department introduce a Blockchain elective?',
    options: [
      { text: 'Yes, definitely!', votes: 67 },
      { text: 'Maybe next year', votes: 23 },
      { text: 'No, not needed', votes: 10 },
    ],
    totalVotes: 100,
  },
  {
    id: 'p2', question: 'Preferred timing for extra placement preparation classes?',
    options: [
      { text: 'Morning (8-9 AM)', votes: 15 },
      { text: 'After college (4-5 PM)', votes: 52 },
      { text: 'Weekends', votes: 33 },
    ],
    totalVotes: 100,
  },
  {
    id: 'p3', question: 'Rate the canteen food quality this semester',
    options: [
      { text: '⭐ Excellent', votes: 12 },
      { text: '👍 Good', votes: 35 },
      { text: '😐 Average', votes: 38 },
      { text: '👎 Needs Improvement', votes: 15 },
    ],
    totalVotes: 100,
  },
];

const TRENDING_FEEDBACK = [
  { theme: 'More practical labs needed', sentiment: 'positive', count: 24, emoji: '🔬' },
  { theme: 'Wi-Fi speed improvement', sentiment: 'negative', count: 18, emoji: '📶' },
  { theme: 'Great placement support', sentiment: 'positive', count: 15, emoji: '💼' },
  { theme: 'Library hours extension', sentiment: 'neutral', count: 12, emoji: '📚' },
  { theme: 'AC in classrooms', sentiment: 'negative', count: 10, emoji: '❄️' },
];

/* ═══════════════════════════════════════════════════════════════
   STAR RATING COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function StarRating({ rating, onRate, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          style={{ cursor: onRate ? 'pointer' : 'default', transition: 'all 0.15s' }}
          color={(hover || rating) >= s ? '#ffd700' : 'rgba(255,255,255,0.15)'}
          fill={(hover || rating) >= s ? '#ffd700' : 'none'}
          onMouseEnter={() => onRate && setHover(s)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(s)}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AnonymousFeedbackModal({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('rate');
  const [ratings, setRatings] = useState({});
  const [feedbackText, setFeedbackText] = useState('');
  const [votedPolls, setVotedPolls] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (facultyId, rating) => {
    setRatings(prev => ({ ...prev, [facultyId]: rating }));
  };

  const handleVote = (pollId, optionIdx) => {
    if (votedPolls[pollId] !== undefined) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: optionIdx }));
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    setSubmitted(true);
    setFeedbackText('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
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
              background: 'linear-gradient(135deg, #ec4899, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
            }}>
              <MessageCircle size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>💬 Anonymous Feedback</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                <EyeOff size={12} style={{ verticalAlign: 'middle' }} /> Your identity is fully anonymous
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
            { key: 'rate', label: '⭐ Rate Faculty' },
            { key: 'polls', label: '📊 Live Polls' },
            { key: 'suggest', label: '💡 Suggestions' },
            { key: 'trending', label: '🔥 Trending' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              background: activeTab === t.key ? 'rgba(236,72,153,0.15)' : 'transparent',
              border: `1px solid ${activeTab === t.key ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '10px', padding: '7px 14px',
              color: activeTab === t.key ? '#f472b6' : 'rgba(255,255,255,0.5)',
              fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* RATE FACULTY */}
          {activeTab === 'rate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FACULTY_LIST.map(fac => (
                <div key={fac.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {fac.name.split(' ').slice(-1)[0][0]}{fac.name.split('.')[0].slice(-1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{fac.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fac.subject}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      Avg: ⭐ {fac.avgRating}/5 (anonymous aggregate)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <StarRating rating={ratings[fac.id] || 0} onRate={(r) => handleRate(fac.id, r)} />
                    {ratings[fac.id] && (
                      <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                        ✓ Submitted anonymously
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* POLLS */}
          {activeTab === 'polls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ACTIVE_POLLS.map(poll => (
                <div key={poll.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '20px',
                }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    📊 {poll.question}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {poll.options.map((opt, oi) => {
                      const hasVoted = votedPolls[poll.id] !== undefined;
                      const isMyVote = votedPolls[poll.id] === oi;
                      const pct = hasVoted ? opt.votes : 0;
                      return (
                        <div
                          key={oi}
                          onClick={() => handleVote(poll.id, oi)}
                          style={{
                            background: isMyVote ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isMyVote ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '10px', padding: '12px 16px', cursor: hasVoted ? 'default' : 'pointer',
                            position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
                          }}
                        >
                          {hasVoted && (
                            <div style={{
                              position: 'absolute', top: 0, left: 0, bottom: 0,
                              width: `${pct}%`,
                              background: isMyVote ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                              transition: 'width 1s ease',
                            }} />
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <span style={{ fontSize: '13px', fontWeight: isMyVote ? 700 : 500, color: isMyVote ? '#60a5fa' : '#fff' }}>
                              {isMyVote && '✓ '}{opt.text}
                            </span>
                            {hasVoted && (
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                {pct}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                    {poll.totalVotes} anonymous votes
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUGGESTIONS */}
          {activeTab === 'suggest' && (
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px',
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💡 Share Your Anonymous Suggestion
                </h4>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="What would you like to improve about the department? Your feedback is 100% anonymous..."
                  style={{
                    width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    padding: '14px', color: '#fff', fontSize: '13px', resize: 'vertical',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <EyeOff size={12} /> Completely anonymous — no personal data collected
                  </div>
                  <button onClick={handleSubmitFeedback} style={{
                    background: feedbackText.trim() ? 'linear-gradient(135deg, #ec4899, #f97316)' : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: feedbackText.trim() ? 'pointer' : 'default',
                    color: '#fff', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: feedbackText.trim() ? 1 : 0.4,
                  }}>
                    <Send size={14} /> Submit Anonymously
                  </button>
                </div>
                {submitted && (
                  <div style={{
                    marginTop: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#10b981', fontWeight: 600,
                  }}>
                    ✅ Your anonymous suggestion has been submitted successfully!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRENDING */}
          {activeTab === 'trending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>🔥 Trending Feedback Themes</h3>
              {TRENDING_FEEDBACK.map((tf, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '14px 18px', transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <span style={{ fontSize: '24px' }}>{tf.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{tf.theme}</div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                      background: tf.sentiment === 'positive' ? 'rgba(16,185,129,0.15)' : tf.sentiment === 'negative' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: tf.sentiment === 'positive' ? '#10b981' : tf.sentiment === 'negative' ? '#ef4444' : '#f59e0b',
                    }}>
                      {tf.sentiment === 'positive' ? '😊 Positive' : tf.sentiment === 'negative' ? '⚠️ Needs Attention' : '😐 Neutral'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                    {tf.count} mentions
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
