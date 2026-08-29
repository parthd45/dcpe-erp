import React, { useState, useMemo } from 'react';
import { Bell, X, Clock, CheckCircle2, AlertTriangle, Info, CreditCard, Calendar, Briefcase, BookOpen, Megaphone, BellOff, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION DATA
   ═══════════════════════════════════════════════════════════════ */
const PRIORITY = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle, dot: '🔴' },
  important: { label: 'Important', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock, dot: '🟡' },
  info: { label: 'Info', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Info, dot: '🟢' },
};

const CATEGORIES = {
  all:        { label: 'All',        emoji: '📥' },
  academic:   { label: 'Academic',   emoji: '📚' },
  fees:       { label: 'Fees',       emoji: '💳' },
  placement:  { label: 'Placement',  emoji: '💼' },
  exam:       { label: 'Exams',      emoji: '📋' },
  notice:     { label: 'Notices',    emoji: '📢' },
};

function generateNotifications(currentUser) {
  const name = currentUser?.name?.split(' ')[0] || 'Student';
  return [
    { id: 'n1', title: 'Semester Fee Due Date Approaching', body: `Your semester fees of ₹45,000 are due by March 15. Avoid late fee penalty of ₹500.`, category: 'fees', priority: 'critical', time: '2 hours ago', read: false },
    { id: 'n2', title: 'Attendance Warning — Cloud Computing', body: `Your attendance in Cloud Computing has dropped to 72%. Minimum 75% required for hall ticket eligibility.`, category: 'academic', priority: 'critical', time: '5 hours ago', read: false },
    { id: 'n3', title: 'TCS Campus Drive — Registration Open', body: `TCS is visiting campus on Nov 14. Eligibility: 60%+ aggregate. Register by Nov 10.`, category: 'placement', priority: 'important', time: '1 day ago', read: false },
    { id: 'n4', title: 'Mid-Semester Exam Schedule Released', body: `Mid-sem exams start March 15. Database Systems on March 16, ML on March 18. Check full schedule.`, category: 'exam', priority: 'important', time: '1 day ago', read: false },
    { id: 'n5', title: 'Library Book Return Overdue', body: `"Design Patterns" by Gamma et al. was due on March 1. Return immediately to avoid ₹5/day fine.`, category: 'academic', priority: 'important', time: '2 days ago', read: true },
    { id: 'n6', title: 'Assignment 2 Deadline Extended', body: `Software Architecture Assignment 2 deadline extended to March 20. Submit via Google Classroom.`, category: 'academic', priority: 'info', time: '2 days ago', read: true },
    { id: 'n7', title: 'Infosys Power Programmer — Results', body: `Results for Infosys Power Programmer certification exam are out. Check your score on the placement portal.`, category: 'placement', priority: 'info', time: '3 days ago', read: true },
    { id: 'n8', title: 'Cultural Fest Utsav — Call for Entries', body: `Register for dance, music, art competitions at Utsav 2026. Last date: March 25.`, category: 'notice', priority: 'info', time: '4 days ago', read: true },
    { id: 'n9', title: 'Wi-Fi Password Updated', body: `Campus Wi-Fi password has been changed. New credentials available at IT Help Desk, Room 105.`, category: 'notice', priority: 'info', time: '5 days ago', read: true },
    { id: 'n10', title: 'Sports Day Registration Open', body: `Annual Sports Day on May 15. Register for cricket, badminton, athletics by May 1.`, category: 'notice', priority: 'info', time: '1 week ago', read: true },
  ];
}

function generateBriefing(currentUser, notifications) {
  const name = currentUser?.name?.split(' ')[0] || 'Student';
  const unread = notifications.filter(n => !n.read).length;
  const critical = notifications.filter(n => n.priority === 'critical' && !n.read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return {
    greeting: `${greeting}, ${name}!`,
    summary: [
      `You have ${unread} unread notification${unread !== 1 ? 's' : ''}${critical > 0 ? ` (${critical} critical)` : ''}.`,
      critical > 0 ? '⚠️ Your semester fees are due soon and attendance needs attention.' : '',
      'TCS campus drive registration is open — don\'t miss the deadline!',
      'Mid-semester exams start next week. Time to prepare!',
    ].filter(Boolean),
  };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function NotificationCommandCenterModal({ currentUser, onClose }) {
  const initialNotifs = useMemo(() => generateNotifications(currentUser), [currentUser]);
  const [notifications, setNotifications] = useState(initialNotifs);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBriefing, setShowBriefing] = useState(true);

  const briefing = useMemo(() => generateBriefing(currentUser, notifications), [currentUser, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.keys(CATEGORIES).forEach(k => {
      counts[k] = k === 'all'
        ? notifications.filter(n => !n.read).length
        : notifications.filter(n => n.category === k && !n.read).length;
    });
    return counts;
  }, [notifications]);

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
        maxWidth: 800, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
        borderRadius: '20px',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Header ── */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
              position: 'relative',
            }}>
              <Bell size={26} color="#fff" />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: '#fff',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                  animation: 'pulse 2s infinite',
                }}>
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>🔔 Command Center</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
              }}>
                <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px' }}>

          {/* AI Daily Briefing */}
          {showBriefing && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.08))',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '14px', padding: '18px 20px', marginBottom: '20px',
              position: 'relative',
            }}>
              <button onClick={() => setShowBriefing(false)} style={{
                position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px',
              }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="#a855f7" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7' }}>AI Daily Briefing</span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {briefing.greeting} 👋
              </h3>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {briefing.summary.map((line, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setActiveCategory(key)} style={{
                background: activeCategory === key ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCategory === key ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: 600,
                color: activeCategory === key ? '#fbbf24' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {cat.emoji} {cat.label}
                {categoryCounts[key] > 0 && (
                  <span style={{
                    background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                    borderRadius: '6px', padding: '0 5px', fontSize: '10px', fontWeight: 700,
                  }}>
                    {categoryCounts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                <BellOff size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ fontSize: '13px' }}>No notifications in this category</p>
              </div>
            ) : (
              filtered.map(notif => {
                const prio = PRIORITY[notif.priority];
                const PrioIcon = prio.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    style={{
                      background: notif.read ? 'rgba(255,255,255,0.02)' : prio.bg,
                      border: `1px solid ${notif.read ? 'rgba(255,255,255,0.04)' : `${prio.color}20`}`,
                      borderLeft: `3px solid ${notif.read ? 'rgba(255,255,255,0.06)' : prio.color}`,
                      borderRadius: '12px', padding: '14px 18px',
                      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: `${prio.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px',
                      }}>
                        <PrioIcon size={18} color={prio.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {!notif.read && (
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: prio.color, flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: '13px', fontWeight: notif.read ? 500 : 700,
                            color: notif.read ? 'rgba(255,255,255,0.6)' : '#fff',
                          }}>
                            {notif.title}
                          </span>
                        </div>
                        <p style={{
                          margin: 0, fontSize: '12px', lineHeight: 1.4,
                          color: notif.read ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)',
                        }}>
                          {notif.body}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                            <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                            {notif.time}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                            background: `${prio.color}15`, color: prio.color,
                          }}>
                            {prio.dot} {prio.label}
                          </span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id); }} style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                        cursor: 'pointer', fontSize: '16px', padding: '4px',
                      }}
                      onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
